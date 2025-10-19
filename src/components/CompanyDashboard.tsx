import { useState, useEffect } from 'react';
import { Heart, Users, Calendar, TrendingUp, Activity, LogOut, UserCog } from 'lucide-react';
import UserManagement from './UserManagement';

interface User {
  id: string;
  username: string;
  nombre: string;
  role: string;
}

interface CompanyDashboardProps {
  user: User;
  onLogout: () => void;
}

interface PatientStats {
  total: number;
  today: number;
  byDate: Array<{
    date: string;
    count: number;
  }>;
}

export default function CompanyDashboard({ user, onLogout }: CompanyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users'>('stats');
  const [stats, setStats] = useState<PatientStats>({
    total: 0,
    today: 0,
    byDate: []
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/patients/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const patientsOnDate = stats.byDate.find(d => d.date === selectedDate)?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">SAVISER - Dashboard Empresa</h1>
                <p className="text-sm text-slate-600">Bienvenido, {user.nombre}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={20} />
            <span>Estadísticas</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <UserCog size={20} />
            <span>Gestión de Usuarios</span>
          </button>
        </div>

        {activeTab === 'users' ? (
          <UserManagement adminId={user.id} companyId={user.id} />
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Pacientes</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Activity className="text-green-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Atendidos Hoy</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.today}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <TrendingUp className="text-amber-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Promedio Diario</p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.byDate.length > 0
                        ? Math.round(stats.total / stats.byDate.length)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-blue-600" size={28} />
                <h2 className="text-xl font-bold text-slate-800">Pacientes por Fecha</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
                    Seleccionar Fecha
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-slate-700 text-lg">
                    Pacientes atendidos el <strong>{selectedDate}</strong>:
                  </p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{patientsOnDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Historial de Atenciones</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">Fecha</th>
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">Pacientes Atendidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byDate.length > 0 ? (
                      stats.byDate.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-800">{item.date}</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{item.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-slate-500">
                          No hay datos disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
