import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  fecha_cita: {
    type: Date,
    required: true
  },
  hora_inicio: {
    type: String,
    required: true
  },
  hora_fin: {
    type: String,
    required: true
  },
  tipo_cita: {
    type: String,
    enum: ['Consulta General', 'Seguimiento', 'Urgencia', 'Cirugía', 'Examen'],
    required: true
  },
  estado: {
    type: String,
    enum: ['Programada', 'Confirmada', 'En Curso', 'Completada', 'Cancelada', 'No Asistió'],
    default: 'Programada'
  },
  motivo: {
    type: String,
    required: true
  },
  notas: {
    type: String,
    default: ''
  },
  consultorio: {
    type: Number,
    required: true
  },
  recordatorio_enviado: {
    type: Boolean,
    default: false
  },
  fecha_recordatorio: {
    type: Date
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
appointmentSchema.index({ patient_id: 1, fecha_cita: 1 });
appointmentSchema.index({ doctor_id: 1, fecha_cita: 1 });
appointmentSchema.index({ companyId: 1, fecha_cita: 1 });
appointmentSchema.index({ estado: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;