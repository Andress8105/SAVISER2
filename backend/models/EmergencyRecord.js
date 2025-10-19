import mongoose from 'mongoose';

const emergencyRecordSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  numero_identificacion: {
    type: String,
    required: true
  },
  nombres: {
    type: String,
    required: true
  },
  apellidos: {
    type: String,
    required: true
  },
  edad: {
    type: Number,
    required: true
  },
  genero: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro'],
    required: true
  },
  sintomas: {
    type: String,
    required: true
  },
  nivel_urgencia: {
    type: String,
    enum: ['Baja', 'Media', 'Alta', 'Crítica'],
    required: true
  },
  signos_vitales: {
    presion_arterial: String,
    frecuencia_cardiaca: String,
    temperatura: String,
    saturacion_oxigeno: String
  },
  alergias_conocidas: String,
  medicamentos_actuales: String,
  consultorio_asignado: {
    type: String,
    required: true
  },
  doctor_asignado: {
    type: String,
    required: true
  },
  fecha_ingreso: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['En espera', 'En atención', 'Atendido', 'Cancelado'],
    default: 'En espera'
  }
}, {
  timestamps: true
});

const EmergencyRecord = mongoose.model('EmergencyRecord', emergencyRecordSchema);

export default EmergencyRecord;
