import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  razon_social: {
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
    lowercase: true
  },
  contacto_principal: {
    nombre: {
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
      lowercase: true
    }
  },
  categorias_suministro: {
    type: [String],
    enum: ['Medicamento', 'Suministro Médico', 'Equipo', 'Material Quirúrgico', 'Consumible'],
    default: []
  },
  condiciones_pago: {
    type: String,
    default: ''
  },
  tiempo_entrega_dias: {
    type: Number,
    default: 7
  },
  activo: {
    type: Boolean,
    default: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  calificacion: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  notas: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índices
supplierSchema.index({ companyId: 1 });
supplierSchema.index({ rfc: 1 });
supplierSchema.index({ activo: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;