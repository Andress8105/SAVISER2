import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  categoria: {
    type: String,
    enum: ['Medicamento', 'Suministro Médico', 'Equipo', 'Material Quirúrgico', 'Consumible'],
    required: true
  },
  unidad_medida: {
    type: String,
    enum: ['Unidad', 'Caja', 'Frasco', 'Ampolla', 'Tableta', 'ml', 'mg', 'gr'],
    required: true
  },
  stock_actual: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  stock_minimo: {
    type: Number,
    required: true,
    min: 0
  },
  stock_maximo: {
    type: Number,
    required: true,
    min: 0
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: 0
  },
  proveedor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  fecha_vencimiento: {
    type: Date
  },
  lote: {
    type: String,
    default: ''
  },
  ubicacion: {
    type: String,
    default: ''
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
  alertas: {
    stock_bajo: {
      type: Boolean,
      default: false
    },
    proximo_vencimiento: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Middleware para calcular alertas automáticamente
inventoryItemSchema.pre('save', function(next) {
  // Alerta de stock bajo
  this.alertas.stock_bajo = this.stock_actual <= this.stock_minimo;
  
  // Alerta de próximo vencimiento (30 días)
  if (this.fecha_vencimiento) {
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    this.alertas.proximo_vencimiento = this.fecha_vencimiento <= treintaDias;
  }
  
  next();
});

// Índices
inventoryItemSchema.index({ codigo: 1 });
inventoryItemSchema.index({ companyId: 1, categoria: 1 });
inventoryItemSchema.index({ 'alertas.stock_bajo': 1 });
inventoryItemSchema.index({ 'alertas.proximo_vencimiento': 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;