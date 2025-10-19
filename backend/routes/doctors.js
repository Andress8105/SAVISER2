import express from 'express';
import Doctor from '../models/Doctor.js';
import EmergencyRecord from '../models/EmergencyRecord.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/assign-by-priority/:companyId/:priority', async (req, res) => {
  try {
    const { companyId, priority } = req.params;

    const priorityMap = {
      'Baja': 'baja',
      'Media': 'media',
      'Alta': 'alta',
      'Crítica': 'critica'
    };

    const normalizedPriority = priorityMap[priority];

    const availableDoctors = await Doctor.find({
      companyId,
      activo: true,
      prioridadesAsignadas: normalizedPriority
    });

    if (availableDoctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay doctores disponibles para esta prioridad'
      });
    }

    const randomDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];

    res.json({
      success: true,
      doctor: {
        id: randomDoctor._id,
        nombre: `${randomDoctor.nombre} ${randomDoctor.apellidos}`,
        especialidad: randomDoctor.especialidad,
        consultorio: randomDoctor.consultorio
      }
    });

  } catch (error) {
    console.error('Error al asignar doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar doctor'
    });
  }
});

router.get('/my-patients/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.role !== 'consultorio') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const doctor = await Doctor.findOne({ userId: user._id });

    if (!doctor) {
      return res.json({
        success: true,
        patients: [],
        doctor: null
      });
    }

    const patients = await EmergencyRecord.find({
      doctor_asignado: doctor._id
    })
    .populate('patient_id')
    .sort({ fecha_ingreso: -1 });

    res.json({
      success: true,
      patients,
      doctor: {
        nombre: `${doctor.nombre} ${doctor.apellidos}`,
        especialidad: doctor.especialidad,
        consultorio: doctor.consultorio
      }
    });

  } catch (error) {
    console.error('Error al obtener pacientes del doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes'
    });
  }
});

router.put('/update-patient-status/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { estado, userId } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'consultorio') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const record = await EmergencyRecord.findByIdAndUpdate(
      recordId,
      { estado },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      record
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado'
    });
  }
});

export default router;
