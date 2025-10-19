import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema({
  numero_poliza: {
    type: String,
    required: true
  },
  aseguradora: {
    type: String,
    required: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fecha_servicio: {
    type: Date,
    required: true
  },
  servicios: [{
    codigo_servicio: {
      type: String,
      required: true
    },
    descripcion: {
      type: String,
      required: true
    },
    monto_reclamado: {
      type: Number,
      required: true,
      min: 0
    },
    monto_aprobado: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  monto_total_reclamado: {
    type: Number,
    required: true,
    min: 0
  },
  monto_total_aprobado: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['Enviada', 'En Revisión', 'Aprobada', 'Rechazada', 'Pagada'],
    default: 'Enviada'
  },
  fecha_envio: {
    type: Date,
    default: Date.now
  },
  fecha_respuesta: {
    type: Date
  },
  motivo_rechazo: {
    type: String,
    default: ''
  },
  documentos_adjuntos: [{
    nombre: String,
    url: String,
    tipo: String
  }],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Middleware para calcular montos totales
insuranceClaimSchema.pre('save', function(next) {
  this.monto_total_reclamado = this.servicios.reduce((sum, servicio) => 
    sum + servicio.monto_reclamado, 0);
  
  this.monto_total_aprobado = this.servicios.reduce((sum, servicio) => 
    sum + servicio.monto_aprobado, 0);
  
  next();
});

// Índices
insuranceClaimSchema.index({ patient_id: 1, fecha_servicio: -1 });
insuranceClaimSchema.index({ companyId: 1, estado: 1 });
insuranceClaimSchema.index({ numero_poliza: 1 });

const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);

export default InsuranceClaim;