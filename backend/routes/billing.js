import express from 'express';
import Bill from '../models/Bill.js';
import InsuranceClaim from '../models/InsuranceClaim.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// Obtener todas las facturas de una empresa
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { estado, fecha_inicio, fecha_fin } = req.query;

    let query = { companyId };

    if (estado) {
      query.estado = estado;
    }

    if (fecha_inicio && fecha_fin) {
      query.fecha_emision = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin)
      };
    }

    const bills = await Bill.find(query)
      .populate('patient_id', 'nombres apellidos numero_identificacion')
      .sort({ fecha_emision: -1 });

    res.json({
      success: true,
      bills
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas'
    });
  }
});

// Crear nueva factura
router.post('/', async (req, res) => {
  try {
    const billData = req.body;

    // Generar número de factura automático
    const lastBill = await Bill.findOne({ companyId: billData.companyId })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastBill) {
      const lastNumber = parseInt(lastBill.numero_factura.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    billData.numero_factura = `FAC-${nextNumber.toString().padStart(6, '0')}`;

    // Establecer fecha de vencimiento (30 días por defecto)
    if (!billData.fecha_vencimiento) {
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 30);
      billData.fecha_vencimiento = vencimiento;
    }

    const bill = new Bill(billData);
    await bill.save();

    const populatedBill = await Bill.findById(bill._id)
      .populate('patient_id', 'nombres apellidos numero_identificacion');

    res.status(201).json({
      success: true,
      bill: populatedBill
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura'
    });
  }
});

// Actualizar estado de factura
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, metodo_pago } = req.body;

    const updateData = { estado };
    if (metodo_pago) {
      updateData.metodo_pago = metodo_pago;
    }

    const bill = await Bill.findByIdAndUpdate(id, updateData, { new: true })
      .populate('patient_id', 'nombres apellidos numero_identificacion');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      bill
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar factura'
    });
  }
});

// Obtener facturas de un paciente
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const bills = await Bill.find({ patient_id: patientId })
      .sort({ fecha_emision: -1 });

    res.json({
      success: true,
      bills
    });
  } catch (error) {
    console.error('Error al obtener facturas del paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas del paciente'
    });
  }
});

// Reclamaciones de seguro
router.get('/insurance-claims/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { estado } = req.query;

    let query = { companyId };
    if (estado) {
      query.estado = estado;
    }

    const claims = await InsuranceClaim.find(query)
      .populate('patient_id', 'nombres apellidos numero_identificacion')
      .sort({ fecha_envio: -1 });

    res.json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Error al obtener reclamaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reclamaciones'
    });
  }
});

// Crear reclamación de seguro
router.post('/insurance-claims', async (req, res) => {
  try {
    const claimData = req.body;

    const claim = new InsuranceClaim(claimData);
    await claim.save();

    const populatedClaim = await InsuranceClaim.findById(claim._id)
      .populate('patient_id', 'nombres apellidos numero_identificacion');

    res.status(201).json({
      success: true,
      claim: populatedClaim
    });
  } catch (error) {
    console.error('Error al crear reclamación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reclamación'
    });
  }
});

// Estadísticas de facturación
router.get('/stats/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [monthlyStats, yearlyStats, statusStats] = await Promise.all([
      Bill.aggregate([
        {
          $match: {
            companyId: companyId,
            fecha_emision: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total_facturas: { $sum: 1 },
            monto_total: { $sum: '$total' },
            monto_pagado: {
              $sum: {
                $cond: [{ $eq: ['$estado', 'Pagada'] }, '$total', 0]
              }
            }
          }
        }
      ]),
      Bill.aggregate([
        {
          $match: {
            companyId: companyId,
            fecha_emision: { $gte: startOfYear }
          }
        },
        {
          $group: {
            _id: null,
            total_facturas: { $sum: 1 },
            monto_total: { $sum: '$total' }
          }
        }
      ]),
      Bill.aggregate([
        {
          $match: { companyId: companyId }
        },
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 },
            monto: { $sum: '$total' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        monthly: monthlyStats[0] || { total_facturas: 0, monto_total: 0, monto_pagado: 0 },
        yearly: yearlyStats[0] || { total_facturas: 0, monto_total: 0 },
        by_status: statusStats
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

export default router;