import mongoose from 'mongoose';

const medicalExamSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  tipo_examen: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  resultados: {
    type: String,
    default: ''
  },
  doctor: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const MedicalExam = mongoose.model('MedicalExam', medicalExamSchema);

export default MedicalExam;
