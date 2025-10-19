import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellidos: {
    type: String,
    required: true,
    trim: true
  },
  especialidad: {
    type: String,
    required: true
  },
  cedulaProfesional: {
    type: String,
    required: true,
    unique: true
  },
  consultorio: {
    type: Number,
    required: true
  },
  prioridadesAsignadas: {
    type: [String],
    enum: ['baja', 'media', 'alta', 'critica'],
    default: []
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  telefono: {
    type: String
  },
  email: {
    type: String
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
