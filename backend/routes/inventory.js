import express from 'express';
import InventoryItem from '../models/InventoryItem.js';
import Supplier from '../models/Supplier.js';

const router = express.Router();

// Obtener todos los items del inventario
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { categoria, alerta } = req.query;

    let query = { companyId, activo: true };

    if (categoria) {
      query.categoria = categoria;
    }

    if (alerta === 'stock_bajo') {
      query['alertas.stock_bajo'] = true;
    } else if (alerta === 'vencimiento') {
      query['alertas.proximo_vencimiento'] = true;
    }

    const items = await InventoryItem.find(query)
      .populate('proveedor_id', 'nombre contacto_principal')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario'
    });
  }
});

// Crear nuevo item de inventario
router.post('/', async (req, res) => {
  try {
    const itemData = req.body;

    const existingItem = await InventoryItem.findOne({
      codigo: itemData.codigo,
      companyId: itemData.companyId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un item con ese código'
      });
    }

    const item = new InventoryItem(itemData);
    await item.save();

    const populatedItem = await InventoryItem.findById(item._id)
      .populate('proveedor_id', 'nombre contacto_principal');

    res.status(201).json({
      success: true,
      item: populatedItem
    });
  } catch (error) {
    console.error('Error al crear item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear item'
    });
  }
});

// Actualizar stock de item
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo, motivo } = req.body; // tipo: 'entrada' o 'salida'

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    if (tipo === 'entrada') {
      item.stock_actual += cantidad;
    } else if (tipo === 'salida') {
      if (item.stock_actual < cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente'
        });
      }
      item.stock_actual -= cantidad;
    }

    await item.save();

    res.json({
      success: true,
      item,
      message: `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock'
    });
  }
});

// Obtener alertas de inventario
router.get('/alerts/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const stockBajo = await InventoryItem.find({
      companyId,
      'alertas.stock_bajo': true,
      activo: true
    }).populate('proveedor_id', 'nombre');

    const proximoVencimiento = await InventoryItem.find({
      companyId,
      'alertas.proximo_vencimiento': true,
      activo: true
    }).populate('proveedor_id', 'nombre');

    res.json({
      success: true,
      alerts: {
        stock_bajo: stockBajo,
        proximo_vencimiento: proximoVencimiento
      }
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas'
    });
  }
});

// Proveedores
router.get('/suppliers/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const suppliers = await Supplier.find({ companyId, activo: true })
      .sort({ nombre: 1 });

    res.json({
      success: true,
      suppliers
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores'
    });
  }
});

// Crear proveedor
router.post('/suppliers', async (req, res) => {
  try {
    const supplierData = req.body;

    const existingSupplier = await Supplier.findOne({
      rfc: supplierData.rfc
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con ese RFC'
      });
    }

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      supplier
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proveedor'
    });
  }
});

export default router;