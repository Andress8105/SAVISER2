import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// Obtener todas las citas de una empresa
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { fecha, doctor_id, estado } = req.query;

    let query = { companyId };

    if (fecha) {
      const startDate = new Date(fecha);
      const endDate = new Date(fecha);
      endDate.setDate(endDate.getDate() + 1);
      query.fecha_cita = { $gte: startDate, $lt: endDate };
    }

    if (doctor_id) {
      query.doctor_id = doctor_id;
    }

    if (estado) {
      query.estado = estado;
    }

    const appointments = await Appointment.find(query)
      .populate('patient_id', 'nombres apellidos numero_identificacion telefono')
      .populate('doctor_id', 'nombre apellidos especialidad')
      .sort({ fecha_cita: 1, hora_inicio: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas'
    });
  }
});

// Crear nueva cita
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;

    // Verificar disponibilidad del doctor
    const conflictingAppointment = await Appointment.findOne({
      doctor_id: appointmentData.doctor_id,
      fecha_cita: appointmentData.fecha_cita,
      $or: [
        {
          hora_inicio: { $lte: appointmentData.hora_inicio },
          hora_fin: { $gt: appointmentData.hora_inicio }
        },
        {
          hora_inicio: { $lt: appointmentData.hora_fin },
          hora_fin: { $gte: appointmentData.hora_fin }
        }
      ],
      estado: { $nin: ['Cancelada', 'No Asistió'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'El doctor ya tiene una cita programada en ese horario'
      });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient_id', 'nombres apellidos numero_identificacion telefono')
      .populate('doctor_id', 'nombre apellidos especialidad');

    res.status(201).json({
      success: true,
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cita'
    });
  }
});

// Actualizar estado de cita
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { estado, notas },
      { new: true }
    ).populate('patient_id', 'nombres apellidos numero_identificacion')
     .populate('doctor_id', 'nombre apellidos especialidad');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cita'
    });
  }
});

// Obtener citas de un paciente
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient_id: patientId })
      .populate('doctor_id', 'nombre apellidos especialidad')
      .sort({ fecha_cita: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del paciente'
    });
  }
});

// Obtener citas de un doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fecha } = req.query;

    let query = { doctor_id: doctorId };

    if (fecha) {
      const startDate = new Date(fecha);
      const endDate = new Date(fecha);
      endDate.setDate(endDate.getDate() + 1);
      query.fecha_cita = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient_id', 'nombres apellidos numero_identificacion telefono')
      .sort({ fecha_cita: 1, hora_inicio: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error al obtener citas del doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del doctor'
    });
  }
});

// Cancelar cita
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { estado: 'Cancelada' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita'
    });
  }
});

export default router;