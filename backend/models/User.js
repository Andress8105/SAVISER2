import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['empleado', 'empresa', 'secretaria', 'consultorio'],
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.role !== 'empleado';
    }
  },
  consultorio: {
    type: Number,
    required: function() {
      return this.role === 'consultorio';
    }
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

const User = mongoose.model('User', userSchema);

export default User;
