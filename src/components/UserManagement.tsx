import { useState, useEffect } from 'react';
import { Plus, X, Eye, EyeOff, UserCog } from 'lucide-react';

interface User {
  id: string;
  username: string;
  nombre: string;
  role: string;
  consultorio?: number;
  activo: boolean;
}

interface UserManagementProps {
  adminId: string;
  companyId: string;
}

interface NewUserForm {
  username: string;
  password: string;
  nombre: string;
  role: string;
  consultorio?: number;
}

export default function UserManagement({ adminId, companyId }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    password: '',
    nombre: '',
    role: 'secretaria',
    consultorio: undefined
  });

  useEffect(() => {
    loadUsers();
    loadDoctors();
  }, []);

  const loadUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/company-users/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/company-doctors/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error al cargar doctores:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          adminId,
          companyId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Usuario creado exitosamente');
        setNewUser({
          username: '',
          password: '',
          nombre: '',
          role: 'secretaria',
          consultorio: undefined
        });
        setShowCreateForm(false);
        loadUsers();
      } else {
        setError(data.message || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    }
  };


  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      'empresa': 'Administrador',
      'secretaria': 'Secretaria',
      'consultorio': 'Consultorio/Doctor',
      'empleado': 'Empleado'
    };
    return roles[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="text-blue-600" size={28} />
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showCreateForm ? 'Cancelar' : 'Crear Usuario'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="secretaria">Secretaria</option>
                  <option value="consultorio">Consultorio/Doctor</option>
                  <option value="empleado">Empleado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {newUser.role === 'consultorio' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Número de Consultorio
                  </label>
                  <input
                    type="number"
                    value={newUser.consultorio || ''}
                    onChange={(e) => setNewUser({ ...newUser, consultorio: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    min="1"
                  />
                </div>
              )}
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
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Usuarios Registrados</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No hay usuarios registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Usuario</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Rol</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Consultorio</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">{user.nombre}</td>
                    <td className="py-3 px-4 text-slate-800">{user.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {user.consultorio ? `#${user.consultorio}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {doctors.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Doctores Registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Especialidad</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Cédula</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Consultorio</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">{doctor.nombre} {doctor.apellidos}</td>
                    <td className="py-3 px-4 text-slate-800">{doctor.especialidad}</td>
                    <td className="py-3 px-4 text-slate-800">{doctor.cedulaProfesional}</td>
                    <td className="py-3 px-4 text-slate-800">#{doctor.consultorio}</td>
                    <td className="py-3 px-4 text-slate-800">
                      {doctor.userId?.username || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
