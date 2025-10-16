import express from 'express';
import Patient from '../models/Patient.js';

const router = express.Router();

router.get('/search/:numeroIdentificacion', async (req, res) => {
  try {
    const { numeroIdentificacion } = req.params;
    const patient = await Patient.findOne({ numeroIdentificacion });

    if (patient) {
      return res.json({ found: true, patient });
    } else {
      return res.json({ found: false, patient: null });
    }
  } catch (error) {
    console.error('Error searching patient:', error);
    res.status(500).json({ error: 'Error al buscar el paciente' });
  }
});

router.post('/', async (req, res) => {
  try {
    const patientData = req.body;
    const existingPatient = await Patient.findOne({
      numeroIdentificacion: patientData.numeroIdentificacion
    });

    if (existingPatient) {
      return res.status(400).json({
        error: 'Ya existe un paciente con este número de identificación'
      });
    }

    const newPatient = new Patient(patientData);
    await newPatient.save();

    res.status(201).json({
      success: true,
      patient: newPatient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Error al crear el paciente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ success: true, patient: updatedPatient });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Error al actualizar el paciente' });
  }
});

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

export default router;
