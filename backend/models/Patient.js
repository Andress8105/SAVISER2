import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  numeroIdentificacion: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombres: {
    type: String,
    required: true,
    trim: true
  },
  apellidos: {
    type: String,
    required: true,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  genero: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro'],
    required: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  tipoSangre: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  alergias: {
    type: String,
    default: ''
  },
  condicionesMedicas: {
    type: String,
    default: ''
  },
  contactoEmergencia: {
    nombre: {
      type: String,
      required: true
    },
    telefono: {
      type: String,
      required: true
    },
    relacion: {
      type: String,
      required: true
    }
  },
  workflow_state: {
    type: String,
    default: 'INICIO'
  },
  workflow_history: {
    type: [{
      state: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        required: true
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
