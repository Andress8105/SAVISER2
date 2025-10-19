import { useState } from 'react';
import { Heart, LogIn, Loader2, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { id: string; username: string; nombre: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [companyData, setCompanyData] = useState({
    nombre: '',
    razonSocial: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
    adminUsername: '',
    adminPassword: '',
    adminNombre: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Verifique que el servidor esté activo.');
      console.error('Error de login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/register-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Error al registrar empresa');
      }
    } catch (err) {
      setError('Error de conexión. Verifique que el servidor esté activo.');
      console.error('Error de registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-slate-700 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-blue-600 rounded-full mb-3">
                <Building2 className="text-white" size={36} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Registro de Empresa</h1>
              <p className="text-slate-600 text-sm">Complete los datos de su empresa</p>
            </div>

            <form onSubmit={handleRegisterCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={companyData.nombre}
                    onChange={(e) => setCompanyData({...companyData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={companyData.razonSocial}
                    onChange={(e) => setCompanyData({...companyData, razonSocial: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={companyData.rfc}
                    onChange={(e) => setCompanyData({...companyData, rfc: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={companyData.telefono}
                    onChange={(e) => setCompanyData({...companyData, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={companyData.direccion}
                  onChange={(e) => setCompanyData({...companyData, direccion: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Corporativo
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Datos del Administrador</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={companyData.adminNombre}
                      onChange={(e) => setCompanyData({...companyData, adminNombre: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={companyData.adminUsername}
                      onChange={(e) => setCompanyData({...companyData, adminUsername: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={companyData.adminPassword}
                      onChange={(e) => setCompanyData({...companyData, adminPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  disabled={isLoading}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={20} />
                      <span>Registrar Empresa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-slate-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-blue-600 rounded-full mb-4">
              <Heart className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">SAVISER</h1>
            <p className="text-slate-600">Sistema de Atención y Vida al Ser Humano</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ingrese su usuario"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ingrese su contraseña"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsRegistering(true)}
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Building2 size={20} />
              <span>Registrar Empresa</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Usuarios de prueba: saviser, empresa, secretaria, consultorio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
