import { useState } from 'react';
import { Heart, CheckCircle, XCircle } from 'lucide-react';
import PatientSearch from './components/PatientSearch';
import PatientForm from './components/PatientForm';
import PatientSheet from './components/PatientSheet';
import { Patient, searchPatient, createPatient } from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [patientFound, setPatientFound] = useState<boolean | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSearch = async (numeroIdentificacion: string) => {
    setIsLoading(true);
    setMessage(null);
    setPatientFound(null);
    setCurrentPatient(null);

    try {
      const result = await searchPatient(numeroIdentificacion);
      setPatientFound(result.found);

      if (result.found) {
        setCurrentPatient(result.patient);
        setMessage({ type: 'success', text: '¡Paciente encontrado! Información cargada automáticamente.' });
      } else {
        setCurrentPatient({
          numeroIdentificacion,
          nombres: '',
          apellidos: '',
          fechaNacimiento: '',
          genero: 'Masculino',
          telefono: '',
          email: '',
          direccion: '',
          tipoSangre: 'O+',
          alergias: '',
          condicionesMedicas: '',
          contactoEmergencia: {
            nombre: '',
            telefono: '',
            relacion: '',
          },
        });
        setMessage({ type: 'error', text: 'Paciente no encontrado. Complete el formulario para registrarlo.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al buscar el paciente. Intente nuevamente.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (patientData: Patient) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Heart className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">SAVISER</h1>
              <p className="text-sm text-slate-600">Sistema de Atención y Vida al Ser Humano</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
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

          {currentPatient && (
            <div className="mt-12">
              {patientFound ? (
                <PatientSheet patient={currentPatient} />
              ) : (
                <PatientForm
                  existingPatient={null}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
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
