import { useState, useEffect } from 'react';
import { Heart, CheckCircle, XCircle, LogOut } from 'lucide-react';
import Login from './components/Login';
import CompanyDashboard from './components/CompanyDashboard';
import PatientSearch from './components/PatientSearch';
import PatientForm from './components/PatientForm';
import PatientSheet from './components/PatientSheet';
import EmergencyRegistration from './components/EmergencyRegistration';
import type { PatientFormData, PatientWithHistory, EmergencyData } from './services/api';
import { searchPatient, createPatient, registerEmergency } from './services/api';

interface User {
  id: string;
  username: string;
  nombre: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientFound, setPatientFound] = useState<boolean | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientWithHistory | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('saviser_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('saviser_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('saviser_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'empresa') {
    return <CompanyDashboard user={user} onLogout={handleLogout} />;
  }

  const handleSearch = async (numeroIdentificacion: string) => {
    setIsLoading(true);
    setMessage(null);
    setPatientFound(null);
    setCurrentPatient(null);

    try {
      const result = await searchPatient(numeroIdentificacion);

      if (result) {
        setPatientFound(true);
        setCurrentPatient(result);
        setMessage({ type: 'success', text: '¡Paciente encontrado! Historial médico completo cargado automáticamente.' });
      } else {
        setPatientFound(false);
        setMessage({ type: 'error', text: 'Paciente no encontrado. Complete el formulario para registrarlo.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al buscar el paciente. Intente nuevamente.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (patientData: PatientFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await createPatient(patientData);
      setMessage({ type: 'success', text: '¡Paciente registrado exitosamente!' });
      setCurrentPatient(null);
      setPatientFound(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al registrar el paciente. Intente nuevamente.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPatient = async () => {
    if (currentPatient) {
      try {
        const refreshedPatient = await searchPatient(currentPatient.numero_identificacion);
        if (refreshedPatient) {
          setCurrentPatient(refreshedPatient);
        }
      } catch (error) {
        console.error('Error al actualizar paciente:', error);
      }
    }
  };

  const handleEmergencyRegistration = async (emergencyData: EmergencyData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await registerEmergency(emergencyData);
      setMessage({
        type: 'success',
        text: `¡Paciente registrado en urgencias! Remitido a ${response.assignment.specialty} con ${response.assignment.doctor}`
      });

      const fullPatient = await searchPatient(response.patient.numero_identificacion);
      if (fullPatient) {
        setCurrentPatient(fullPatient);
        setPatientFound(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al registrar urgencia. Intente nuevamente.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">SAVISER</h1>
                <p className="text-sm text-slate-600">Sistema de Atención y Vida al Ser Humano</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user.nombre}</p>
                <p className="text-xs text-slate-600 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="mb-12">
            <EmergencyRegistration
              onRegister={handleEmergencyRegistration}
              isLoading={isLoading}
            />
          </div>

          <div className="border-t-4 border-blue-200 my-16"></div>

          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Búsqueda de Pacientes
            </h2>
            <p className="text-slate-600">
              Ingrese el número de identificación para buscar o registrar un paciente
            </p>
          </div>

          <PatientSearch onSearch={handleSearch} isLoading={isLoading} />

          {message && (
            <div className={`max-w-2xl mx-auto p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              ) : (
                <XCircle className="text-amber-600 flex-shrink-0" size={24} />
              )}
              <p className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-amber-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {currentPatient && patientFound && (
            <div className="mt-12">
              <PatientSheet patient={currentPatient} onRefresh={handleRefreshPatient} />
            </div>
          )}

          {patientFound === false && (
            <div className="mt-12">
              <PatientForm
                existingPatient={null}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-slate-600">
          <p>&copy; 2025 SAVISER - Sistema de Atención y Vida al Ser Humano</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
