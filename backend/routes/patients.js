import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Patient from '../models/Patient.js';
import MedicalExam from '../models/MedicalExam.js';
import Diagnosis from '../models/Diagnosis.js';
import Treatment from '../models/Treatment.js';
import MedicalImage from '../models/MedicalImage.js';
import EmergencyRecord from '../models/EmergencyRecord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const transformPatientData = (data) => {
  return {
    numero_identificacion: data.numeroIdentificacion || data.numero_identificacion,
    nombres: data.nombres,
    apellidos: data.apellidos,
    fecha_nacimiento: data.fechaNacimiento || data.fecha_nacimiento,
    genero: data.genero,
    telefono: data.telefono,
    email: data.email,
    direccion: data.direccion,
    tipo_sangre: data.tipoSangre || data.tipo_sangre,
    alergias: data.alergias,
    condiciones_medicas: data.condicionesMedicas || data.condiciones_medicas,
    contacto_emergencia_nombre: data.contactoEmergencia?.nombre || data.contacto_emergencia_nombre,
    contacto_emergencia_telefono: data.contactoEmergencia?.telefono || data.contacto_emergencia_telefono,
    contacto_emergencia_relacion: data.contactoEmergencia?.relacion || data.contacto_emergencia_relacion
  };
};

const transformPatientFromDB = (patient) => {
  return {
    _id: patient._id,
    numero_identificacion: patient.numeroIdentificacion,
    nombres: patient.nombres,
    apellidos: patient.apellidos,
    fecha_nacimiento: patient.fechaNacimiento,
    genero: patient.genero,
    telefono: patient.telefono,
    email: patient.email,
    direccion: patient.direccion,
    tipo_sangre: patient.tipoSangre,
    alergias: patient.alergias,
    condiciones_medicas: patient.condicionesMedicas,
    contacto_emergencia_nombre: patient.contactoEmergencia?.nombre,
    contacto_emergencia_telefono: patient.contactoEmergencia?.telefono,
    contacto_emergencia_relacion: patient.contactoEmergencia?.relacion,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt
  };
};

router.get('/search/:numeroIdentificacion', async (req, res) => {
  try {
    const { numeroIdentificacion } = req.params;
    const patient = await Patient.findOne({ numeroIdentificacion });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const [exams, diagnoses, treatments, images] = await Promise.all([
      MedicalExam.find({ patient_id: patient._id }).sort({ fecha: -1 }),
      Diagnosis.find({ patient_id: patient._id }).sort({ fecha: -1 }),
      Treatment.find({ patient_id: patient._id }).sort({ fecha_inicio: -1 }),
      MedicalImage.find({ patient_id: patient._id }).sort({ fecha: -1 })
    ]);

    const transformedPatient = transformPatientFromDB(patient);

    res.json({
      ...transformedPatient,
      exams,
      diagnoses,
      treatments,
      images
    });
  } catch (error) {
    console.error('Error searching patient:', error);
    res.status(500).json({ message: 'Error al buscar el paciente' });
  }
});

router.post('/', async (req, res) => {
  try {
    const patientData = req.body;

    const existingPatient = await Patient.findOne({
      numeroIdentificacion: patientData.numero_identificacion
    });

    if (existingPatient) {
      return res.status(400).json({
        message: 'Ya existe un paciente con este número de identificación'
      });
    }

    const newPatient = new Patient({
      numeroIdentificacion: patientData.numero_identificacion,
      nombres: patientData.nombres,
      apellidos: patientData.apellidos,
      fechaNacimiento: patientData.fecha_nacimiento,
      genero: patientData.genero,
      telefono: patientData.telefono,
      email: patientData.email,
      direccion: patientData.direccion,
      tipoSangre: patientData.tipo_sangre,
      alergias: patientData.alergias,
      condicionesMedicas: patientData.condiciones_medicas,
      contactoEmergencia: {
        nombre: patientData.contacto_emergencia_nombre,
        telefono: patientData.contacto_emergencia_telefono,
        relacion: patientData.contacto_emergencia_relacion
      }
    });

    await newPatient.save();

    res.status(201).json(transformPatientFromDB(newPatient));
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error al crear el paciente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patientData = req.body;

    const updateData = {
      nombres: patientData.nombres,
      apellidos: patientData.apellidos,
      fechaNacimiento: patientData.fecha_nacimiento,
      genero: patientData.genero,
      telefono: patientData.telefono,
      email: patientData.email,
      direccion: patientData.direccion,
      tipoSangre: patientData.tipo_sangre,
      alergias: patientData.alergias,
      condicionesMedicas: patientData.condiciones_medicas
    };

    if (patientData.contacto_emergencia_nombre) {
      updateData.contactoEmergencia = {
        nombre: patientData.contacto_emergencia_nombre,
        telefono: patientData.contacto_emergencia_telefono,
        relacion: patientData.contacto_emergencia_relacion
      };
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(transformPatientFromDB(updatedPatient));
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Error al actualizar el paciente' });
  }
});

router.post('/:id/exams', async (req, res) => {
  try {
    const { id } = req.params;
    const examData = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const newExam = new MedicalExam({
      patient_id: id,
      tipo_examen: examData.tipo_examen,
      fecha: examData.fecha,
      descripcion: examData.descripcion,
      resultados: examData.resultados,
      doctor: examData.doctor
    });

    await newExam.save();
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Error al crear el examen' });
  }
});

router.post('/:id/diagnoses', async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosisData = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const newDiagnosis = new Diagnosis({
      patient_id: id,
      fecha: diagnosisData.fecha,
      diagnostico: diagnosisData.diagnostico,
      cie10_code: diagnosisData.cie10_code,
      doctor: diagnosisData.doctor,
      notas: diagnosisData.notas
    });

    await newDiagnosis.save();
    res.status(201).json(newDiagnosis);
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(500).json({ message: 'Error al crear el diagnóstico' });
  }
});

router.post('/:id/treatments', async (req, res) => {
  try {
    const { id } = req.params;
    const treatmentData = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const newTreatment = new Treatment({
      patient_id: id,
      fecha_inicio: treatmentData.fecha_inicio,
      fecha_fin: treatmentData.fecha_fin,
      tipo: treatmentData.tipo,
      descripcion: treatmentData.descripcion,
      medicamento: treatmentData.medicamento,
      dosis: treatmentData.dosis,
      frecuencia: treatmentData.frecuencia,
      doctor: treatmentData.doctor,
      activo: treatmentData.activo !== undefined ? treatmentData.activo : true
    });

    await newTreatment.save();
    res.status(201).json(newTreatment);
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ message: 'Error al crear el tratamiento' });
  }
});

router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newImage = new MedicalImage({
      patient_id: id,
      exam_id: req.body.exam_id || null,
      tipo: req.body.tipo,
      fecha: req.body.fecha,
      descripcion: req.body.descripcion,
      url: imageUrl,
      nombre_archivo: req.file.originalname
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const image = await MedicalImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const filePath = path.join(__dirname, '../..', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await MedicalImage.findByIdAndDelete(id);
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen' });
  }
});

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    const transformedPatients = patients.map(transformPatientFromDB);
    res.json(transformedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
});

const SPECIALTIES = [
  { symptoms: ['fiebre', 'tos', 'gripe', 'dolor de garganta', 'resfriado'], specialty: 'Medicina General', doctor: 'Dr. García' },
  { symptoms: ['dolor de pecho', 'palpitaciones', 'presión alta', 'arritmia'], specialty: 'Cardiología', doctor: 'Dr. Martínez' },
  { symptoms: ['fractura', 'esguince', 'dolor de huesos', 'trauma'], specialty: 'Traumatología', doctor: 'Dr. López' },
  { symptoms: ['apendicitis', 'hernia', 'abdomen agudo'], specialty: 'Cirugía', doctor: 'Dr. Fernández' },
  { symptoms: ['embarazo', 'parto', 'ginecológico'], specialty: 'Ginecología', doctor: 'Dra. Rodríguez' },
  { symptoms: ['asma', 'neumonía', 'dificultad respiratoria'], specialty: 'Neumología', doctor: 'Dr. Sánchez' },
];

const determineSpecialty = (sintomas) => {
  const sintomasLower = sintomas.toLowerCase();

  for (const spec of SPECIALTIES) {
    if (spec.symptoms.some(symptom => sintomasLower.includes(symptom))) {
      return { specialty: spec.specialty, doctor: spec.doctor };
    }
  }

  return { specialty: 'Medicina General', doctor: 'Dr. García' };
};

router.post('/emergency', async (req, res) => {
  try {
    const emergencyData = req.body;

    let patient = await Patient.findOne({
      numeroIdentificacion: emergencyData.numero_identificacion
    });

    if (!patient) {
      patient = new Patient({
        numeroIdentificacion: emergencyData.numero_identificacion,
        nombres: emergencyData.nombres,
        apellidos: emergencyData.apellidos,
        fechaNacimiento: new Date(new Date().getFullYear() - emergencyData.edad, 0, 1),
        genero: emergencyData.genero,
        telefono: '',
        direccion: '',
        tipoSangre: 'O+',
        alergias: emergencyData.alergias_conocidas || '',
        condicionesMedicas: emergencyData.medicamentos_actuales || '',
        contactoEmergencia: {
          nombre: 'Por definir',
          telefono: '',
          relacion: 'Por definir'
        }
      });

      await patient.save();
    }

    const assignment = determineSpecialty(emergencyData.sintomas);

    const emergencyRecord = new EmergencyRecord({
      patient_id: patient._id,
      numero_identificacion: emergencyData.numero_identificacion,
      nombres: emergencyData.nombres,
      apellidos: emergencyData.apellidos,
      edad: emergencyData.edad,
      genero: emergencyData.genero,
      sintomas: emergencyData.sintomas,
      nivel_urgencia: emergencyData.nivel_urgencia,
      signos_vitales: emergencyData.signos_vitales,
      alergias_conocidas: emergencyData.alergias_conocidas,
      medicamentos_actuales: emergencyData.medicamentos_actuales,
      consultorio_asignado: assignment.specialty,
      doctor_asignado: assignment.doctor
    });

    await emergencyRecord.save();

    const diagnosis = new Diagnosis({
      patient_id: patient._id,
      fecha: new Date(),
      diagnostico: `Registro de Urgencias - ${emergencyData.sintomas}`,
      doctor: assignment.doctor,
      notas: `Nivel de urgencia: ${emergencyData.nivel_urgencia}\nSignos vitales:\n- Presión arterial: ${emergencyData.signos_vitales.presion_arterial}\n- Frecuencia cardíaca: ${emergencyData.signos_vitales.frecuencia_cardiaca}\n- Temperatura: ${emergencyData.signos_vitales.temperatura}\n- Saturación O2: ${emergencyData.signos_vitales.saturacion_oxigeno}\n\nConsultorio asignado: ${assignment.specialty}`
    });

    await diagnosis.save();

    res.status(201).json({
      success: true,
      patient: transformPatientFromDB(patient),
      emergencyRecord,
      assignment
    });
  } catch (error) {
    console.error('Error registering emergency:', error);
    res.status(500).json({ message: 'Error al registrar urgencia' });
  }
});

router.get('/emergency/records', async (req, res) => {
  try {
    const records = await EmergencyRecord.find()
      .sort({ fecha_ingreso: -1 })
      .limit(50);
    res.json(records);
  } catch (error) {
    console.error('Error fetching emergency records:', error);
    res.status(500).json({ message: 'Error al obtener registros de urgencias' });
  }
});

export default router;
