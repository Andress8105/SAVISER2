import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  numero_factura: {
    type: String,
    required: true,
    unique: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fecha_emision: {
    type: Date,
    default: Date.now
  },
  fecha_vencimiento: {
    type: Date,
    required: true
  },
  conceptos: [{
    descripcion: {
      type: String,
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precio_unitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  impuestos: {
    type: Number,
    default: 0,
    min: 0
  },
  descuentos: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Pagada', 'Vencida', 'Cancelada'],
    default: 'Pendiente'
  },
  metodo_pago: {
    type: String,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Seguro', 'Mixto'],
    default: 'Efectivo'
  },
  seguro_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceClaim'
  },
  notas: {
    type: String,
    default: ''
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Middleware para calcular totales automáticamente
billSchema.pre('save', function(next) {
  // Calcular subtotal de conceptos
  this.subtotal = this.conceptos.reduce((sum, concepto) => {
    concepto.subtotal = concepto.cantidad * concepto.precio_unitario;
    return sum + concepto.subtotal;
  }, 0);
  
  // Calcular total final
  this.total = this.subtotal + this.impuestos - this.descuentos;
  
  next();
});

// Índices
billSchema.index({ patient_id: 1, fecha_emision: -1 });
billSchema.index({ companyId: 1, estado: 1 });
billSchema.index({ numero_factura: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;