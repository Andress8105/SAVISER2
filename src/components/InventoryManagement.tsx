import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, X, TrendingDown, Calendar } from 'lucide-react';

interface InventoryItem {
  _id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  precio_unitario: number;
  fecha_vencimiento?: string;
  lote: string;
  ubicacion: string;
  alertas: {
    stock_bajo: boolean;
    proximo_vencimiento: boolean;
  };
  proveedor_id?: {
    _id: string;
    nombre: string;
  };
}

interface Supplier {
  _id: string;
  nombre: string;
  razon_social: string;
  rfc: string;
  telefono: string;
  email: string;
}

interface InventoryManagementProps {
  companyId: string;
}

export default function InventoryManagement({ companyId }: InventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newItem, setNewItem] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'Medicamento',
    unidad_medida: 'Unidad',
    stock_actual: 0,
    stock_minimo: 10,
    stock_maximo: 100,
    precio_unitario: 0,
    fecha_vencimiento: '',
    lote: '',
    ubicacion: '',
    proveedor_id: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    nombre: '',
    razon_social: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto_principal: {
      nombre: '',
      telefono: '',
      email: ''
    }
  });

  useEffect(() => {
    loadItems();
    loadSuppliers();
  }, [selectedCategory, alertFilter]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      let url = `${API_URL}/api/inventory/company/${companyId}`;
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('categoria', selectedCategory);
      }
      if (alertFilter !== 'all') {
        params.append('alerta', alertFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setError('Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/inventory/suppliers/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          companyId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setNewItem({
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria: 'Medicamento',
          unidad_medida: 'Unidad',
          stock_actual: 0,
          stock_minimo: 10,
          stock_maximo: 100,
          precio_unitario: 0,
          fecha_vencimiento: '',
          lote: '',
          ubicacion: '',
          proveedor_id: ''
        });
        loadItems();
      } else {
        setError(data.message || 'Error al crear item');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/inventory/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSupplier,
          companyId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSupplierForm(false);
        setNewSupplier({
          nombre: '',
          razon_social: '',
          rfc: '',
          direccion: '',
          telefono: '',
          email: '',
          contacto_principal: {
            nombre: '',
            telefono: '',
            email: ''
          }
        });
        loadSuppliers();
      } else {
        setError(data.message || 'Error al crear proveedor');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    }
  };

  const handleStockUpdate = async (itemId: string, cantidad: number, tipo: 'entrada' | 'salida') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/inventory/${itemId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad,
          tipo,
          motivo: `${tipo === 'entrada' ? 'Entrada' : 'Salida'} manual`
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadItems();
      } else {
        setError(data.message || 'Error al actualizar stock');
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      setError('Error al actualizar stock');
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Medicamento':
        return 'bg-blue-100 text-blue-800';
      case 'Suministro Médico':
        return 'bg-green-100 text-green-800';
      case 'Equipo':
        return 'bg-purple-100 text-purple-800';
      case 'Material Quirúrgico':
        return 'bg-red-100 text-red-800';
      case 'Consumible':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const alertItems = items.filter(item => item.alertas.stock_bajo || item.alertas.proximo_vencimiento);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="text-blue-600" size={28} />
          <h2 className="text-xl font-bold text-slate-800">Gestión de Inventario</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSupplierForm(!showSupplierForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Plus size={20} />
            <span>Proveedor</span>
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            {showCreateForm ? <X size={20} /> : <Plus size={20} />}
            <span>{showCreateForm ? 'Cancelar' : 'Nuevo Item'}</span>
          </button>
        </div>
      </div>

      {alertItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <h3 className="font-semibold text-amber-800">Alertas de Inventario</h3>
          </div>
          <div className="text-sm text-amber-700">
            <p>{alertItems.filter(i => i.alertas.stock_bajo).length} items con stock bajo</p>
            <p>{alertItems.filter(i => i.alertas.proximo_vencimiento).length} items próximos a vencer</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Todas las categorías</option>
            <option value="Medicamento">Medicamento</option>
            <option value="Suministro Médico">Suministro Médico</option>
            <option value="Equipo">Equipo</option>
            <option value="Material Quirúrgico">Material Quirúrgico</option>
            <option value="Consumible">Consumible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Alertas
          </label>
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Todos los items</option>
            <option value="stock_bajo">Stock bajo</option>
            <option value="vencimiento">Próximo vencimiento</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package size={16} />
          <span>{items.length} items en inventario</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nuevo Item de Inventario</h3>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newItem.codigo}
                  onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newItem.nombre}
                  onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={newItem.categoria}
                  onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="Medicamento">Medicamento</option>
                  <option value="Suministro Médico">Suministro Médico</option>
                  <option value="Equipo">Equipo</option>
                  <option value="Material Quirúrgico">Material Quirúrgico</option>
                  <option value="Consumible">Consumible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Actual
                </label>
                <input
                  type="number"
                  value={newItem.stock_actual}
                  onChange={(e) => setNewItem({ ...newItem, stock_actual: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={newItem.stock_minimo}
                  onChange={(e) => setNewItem({ ...newItem, stock_minimo: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.precio_unitario}
                  onChange={(e) => setNewItem({ ...newItem, precio_unitario: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proveedor
                </label>
                <select
                  value={newItem.proveedor_id}
                  onChange={(e) => setNewItem({ ...newItem, proveedor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Sin proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={newItem.fecha_vencimiento}
                  onChange={(e) => setNewItem({ ...newItem, fecha_vencimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                value={newItem.descripcion}
                onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
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
                Crear Item
              </button>
            </div>
          </form>
        </div>
      )}

      {showSupplierForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nuevo Proveedor</h3>
          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newSupplier.nombre}
                  onChange={(e) => setNewSupplier({ ...newSupplier, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RFC
                </label>
                <input
                  type="text"
                  value={newSupplier.rfc}
                  onChange={(e) => setNewSupplier({ ...newSupplier, rfc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newSupplier.telefono}
                  onChange={(e) => setNewSupplier({ ...newSupplier, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSupplierForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Crear Proveedor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Items de Inventario</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-slate-400 mb-3" size={48} />
            <p className="text-slate-500 text-lg">No hay items en el inventario</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Código</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Categoría</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Stock</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Precio</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Alertas</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800 font-mono text-sm">{item.codigo}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800">{item.nombre}</p>
                        {item.descripcion && (
                          <p className="text-sm text-slate-600">{item.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.categoria)}`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className={`font-semibold ${item.alertas.stock_bajo ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.stock_actual} {item.unidad_medida}
                        </p>
                        <p className="text-slate-500">Min: {item.stock_minimo}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      ${item.precio_unitario.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {item.alertas.stock_bajo && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <TrendingDown size={12} />
                            Stock bajo
                          </span>
                        )}
                        {item.alertas.proximo_vencimiento && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Calendar size={12} />
                            Próx. vencimiento
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const cantidad = prompt('Cantidad de entrada:');
                            if (cantidad && parseInt(cantidad) > 0) {
                              handleStockUpdate(item._id, parseInt(cantidad), 'entrada');
                            }
                          }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                        >
                          +
                        </button>
                        <button
                          onClick={() => {
                            const cantidad = prompt('Cantidad de salida:');
                            if (cantidad && parseInt(cantidad) > 0) {
                              handleStockUpdate(item._id, parseInt(cantidad), 'salida');
                            }
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                        >
                          -
                        </button>
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