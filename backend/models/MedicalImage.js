import mongoose from 'mongoose';

const medicalImageSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  exam_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalExam'
  },
  tipo: {
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
  url: {
    type: String,
    required: true
  },
  nombre_archivo: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const MedicalImage = mongoose.model('MedicalImage', medicalImageSchema);

export default MedicalImage;
