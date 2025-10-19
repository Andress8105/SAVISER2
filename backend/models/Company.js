import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  razonSocial: {
    type: String,
    required: true,
    trim: true
  },
  rfc: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  direccion: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
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

const Company = mongoose.model('Company', companySchema);

export default Company;
