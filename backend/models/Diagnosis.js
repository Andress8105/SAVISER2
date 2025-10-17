import mongoose from 'mongoose';

const diagnosisSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  diagnostico: {
    type: String,
    required: true
  },
  cie10_code: {
    type: String,
    default: ''
  },
  doctor: {
    type: String,
    required: true
  },
  notas: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

export default Diagnosis;
