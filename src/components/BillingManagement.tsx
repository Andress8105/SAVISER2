import { useState, useEffect } from 'react';
import { Receipt, DollarSign, Plus, X, FileText, CreditCard } from 'lucide-react';

interface Bill {
  _id: string;
  numero_factura: string;
  patient_id: {
    _id: string;
    nombres: string;
    apellidos: string;
    numero_identificacion: string;
  };
  fecha_emision: string;
  fecha_vencimiento: string;
  conceptos: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  estado: string;
  metodo_pago: string;
  notas: string;
}

interface BillingStats {
  monthly: {
    total_facturas: number;
    monto_total: number;
    monto_pagado: number;
  };
  yearly: {
    total_facturas: number;
    monto_total: number;
  };
  by_status: Array<{
    _id: string;
    count: number;
    monto: number;
  }>;
}

interface BillingManagementProps {
  companyId: string;
}

export default function BillingManagement({ companyId }: BillingManagementProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    monthly: { total_facturas: 0, monto_total: 0, monto_pagado: 0 },
    yearly: { total_facturas: 0, monto_total: 0 },
    by_status: []
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newBill, setNewBill] = useState({
    patient_id: '',
    conceptos: [
      {
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0
      }
    ],
    impuestos: 0,
    descuentos: 0,
    notas: ''
  });

  useEffect(() => {
    loadBills();
    loadStats();
  }, [selectedStatus]);

  const loadBills = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      let url = `${API_URL}/api/billing/company/${companyId}`;
      
      if (selectedStatus !== 'all') {
        url += `?estado=${selectedStatus}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBills(data.bills);
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setError('Error al cargar facturas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/billing/stats/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBill,
          companyId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setNewBill({
          patient_id: '',
          conceptos: [
            {
              descripcion: '',
              cantidad: 1,
              precio_unitario: 0
            }
          ],
          impuestos: 0,
          descuentos: 0,
          notas: ''
        });
        loadBills();
        loadStats();
      } else {
        setError(data.message || 'Error al crear factura');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    }
  };

  const handleUpdateStatus = async (billId: string, newStatus: string, metodoPago?: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/billing/${billId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          estado: newStatus,
          metodo_pago: metodoPago 
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadBills();
        loadStats();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const addConcepto = () => {
    setNewBill({
      ...newBill,
      conceptos: [
        ...newBill.conceptos,
        {
          descripcion: '',
          cantidad: 1,
          precio_unitario: 0
        }
      ]
    });
  };

  const removeConcepto = (index: number) => {
    const newConceptos = newBill.conceptos.filter((_, i) => i !== index);
    setNewBill({
      ...newBill,
      conceptos: newConceptos
    });
  };

  const updateConcepto = (index: number, field: string, value: any) => {
    const newConceptos = [...newBill.conceptos];
    newConceptos[index] = {
      ...newConceptos[index],
      [field]: value
    };
    setNewBill({
      ...newBill,
      conceptos: newConceptos
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pagada':
        return 'bg-green-100 text-green-800';
      case 'Vencida':
        return 'bg-red-100 text-red-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const calculateSubtotal = () => {
    return newBill.conceptos.reduce((sum, concepto) => 
      sum + (concepto.cantidad * concepto.precio_unitario), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + newBill.impuestos - newBill.descuentos;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="text-blue-600" size={28} />
          <h2 className="text-xl font-bold text-slate-800">Gestión de Facturación</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showCreateForm ? 'Cancelar' : 'Nueva Factura'}</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Facturas del Mes</p>
              <p className="text-2xl font-bold text-slate-800">{stats.monthly.total_facturas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-slate-800">${stats.monthly.monto_total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CreditCard className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Cobrado del Mes</p>
              <p className="text-2xl font-bold text-slate-800">${stats.monthly.monto_pagado.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Receipt className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Pendiente</p>
              <p className="text-2xl font-bold text-slate-800">
                ${(stats.monthly.monto_total - stats.monthly.monto_pagado).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Todas las facturas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Pagada">Pagadas</option>
            <option value="Vencida">Vencidas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Receipt size={16} />
          <span>{bills.length} facturas</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Factura</h3>
          <form onSubmit={handleCreateBill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ID del Paciente
              </label>
              <input
                type="text"
                value={newBill.patient_id}
                onChange={(e) => setNewBill({ ...newBill, patient_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
                placeholder="ID del paciente"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Conceptos
                </label>
                <button
                  type="button"
                  onClick={addConcepto}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>

              <div className="space-y-2">
                {newBill.conceptos.map((concepto, index) => (
                  <div key={index} className="flex gap-2 items-center p-3 bg-slate-50 rounded-lg">
                    <input
                      type="text"
                      value={concepto.descripcion}
                      onChange={(e) => updateConcepto(index, 'descripcion', e.target.value)}
                      placeholder="Descripción"
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                      required
                    />
                    <input
                      type="number"
                      value={concepto.cantidad}
                      onChange={(e) => updateConcepto(index, 'cantidad', parseInt(e.target.value) || 1)}
                      placeholder="Cant."
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={concepto.precio_unitario}
                      onChange={(e) => updateConcepto(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      placeholder="Precio"
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                      min="0"
                      required
                    />
                    <span className="w-20 text-sm font-medium text-slate-700">
                      ${(concepto.cantidad * concepto.precio_unitario).toFixed(2)}
                    </span>
                    {newBill.conceptos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConcepto(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Impuestos
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBill.impuestos}
                  onChange={(e) => setNewBill({ ...newBill, impuestos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descuentos
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBill.descuentos}
                  onChange={(e) => setNewBill({ ...newBill, descuentos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas
              </label>
              <textarea
                value={newBill.notas}
                onChange={(e) => setNewBill({ ...newBill, notas: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Crear Factura
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Facturas</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto text-slate-400 mb-3" size={48} />
            <p className="text-slate-500 text-lg">No hay facturas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Número</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Paciente</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Fecha</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Estado</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800 font-mono text-sm">{bill.numero_factura}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {bill.patient_id.nombres} {bill.patient_id.apellidos}
                        </p>
                        <p className="text-sm text-slate-600">{bill.patient_id.numero_identificacion}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {new Date(bill.fecha_emision).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">
                      ${bill.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.estado)}`}>
                        {bill.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {bill.estado === 'Pendiente' && (
                          <button
                            onClick={() => {
                              const metodo = prompt('Método de pago (Efectivo, Tarjeta, Transferencia):');
                              if (metodo) {
                                handleUpdateStatus(bill._id, 'Pagada', metodo);
                              }
                            }}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                          >
                            Pagar
                          </button>
                        )}
                        {bill.estado !== 'Cancelada' && bill.estado !== 'Pagada' && (
                          <button
                            onClick={() => handleUpdateStatus(bill._id, 'Cancelada')}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}