import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fecha_inicio: {
    type: Date,
    required: true
  },
  fecha_fin: {
    type: Date
  },
  tipo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  medicamento: {
    type: String,
    default: ''
  },
  dosis: {
    type: String,
    default: ''
  },
  frecuencia: {
    type: String,
    default: ''
  },
  doctor: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Treatment = mongoose.model('Treatment', treatmentSchema);

export default Treatment;
