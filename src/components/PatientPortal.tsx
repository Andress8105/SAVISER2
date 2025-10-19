import { useState, useEffect } from 'react';
import { User, Calendar, FileText, Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { PatientWithHistory, Appointment } from '../services/api';

interface PatientPortalProps {
  patientId: string;
}

export default function PatientPortal({ patientId }: PatientPortalProps) {
  const [patient, setPatient] = useState<PatientWithHistory | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'history'>('info');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
    loadAppointments();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/patients/search/${patientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else {
        setError('Paciente no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar datos del paciente:', error);
      setError('Error al cargar datos del paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/appointments/patient/${patientId}`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programada':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'En Curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completada':
        return 'bg-emerald-100 text-emerald-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4 inline-block">
            <User className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Heart className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Portal del Paciente</h1>
              <p className="text-sm text-slate-600">
                Bienvenido, {patient.nombres} {patient.apellidos}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <User size={20} />
            <span>Mi Información</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${
              activeTab === 'appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Calendar size={20} />
            <span>Mis Citas</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <FileText size={20} />
            <span>Historial Médico</span>
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nombre Completo</label>
                    <p className="text-lg font-semibold text-slate-800">
                      {patient.nombres} {patient.apellidos}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Identificación</label>
                    <p className="text-lg text-slate-800">{patient.numero_identificacion}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Fecha de Nacimiento</label>
                    <p className="text-lg text-slate-800">{formatDate(patient.fecha_nacimiento)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Género</label>
                    <p className="text-lg text-slate-800">{patient.genero}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tipo de Sangre</label>
                    <p className="text-lg font-bold text-red-600">{patient.tipo_sangre}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Phone className="text-blue-600 mt-1" size={18} />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Teléfono</label>
                      <p className="text-lg text-slate-800">{patient.telefono}</p>
                    </div>
                  </div>
                  
                  {patient.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="text-blue-600 mt-1" size={18} />
                      <div>
                        <label className="text-sm font-medium text-slate-600">Email</label>
                        <p className="text-lg text-slate-800">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="text-blue-600 mt-1" size={18} />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Dirección</label>
                      <p className="text-lg text-slate-800">{patient.direccion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Heart size={24} className="text-red-600" />
                Información Médica
              </h2>
              
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <label className="text-sm font-semibold text-amber-800 block mb-1">Alergias</label>
                  <p className="text-amber-900">{patient.alergias || 'Ninguna registrada'}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="text-sm font-semibold text-red-800 block mb-1">Condiciones Médicas</label>
                  <p className="text-red-900">{patient.condiciones_medicas || 'Ninguna registrada'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Contacto de Emergencia</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">Nombre</label>
                    <p className="font-semibold text-blue-900">{patient.contacto_emergencia_nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Teléfono</label>
                    <p className="font-semibold text-blue-900">{patient.contacto_emergencia_telefono}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Relación</label>
                    <p className="font-semibold text-blue-900">{patient.contacto_emergencia_relacion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              Mis Citas Médicas
            </h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-slate-400 mb-3" size={48} />
                <p className="text-slate-500 text-lg">No tienes citas programadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-blue-600" size={18} />
                          <span className="font-semibold text-slate-800">
                            {new Date(appointment.fecha_cita).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-slate-600">
                            {appointment.hora_inicio} - {appointment.hora_fin}
                          </span>
                        </div>
                        <p className="text-slate-700 mb-1">
                          <strong>Doctor:</strong> Dr. {appointment.doctor_id.nombre} {appointment.doctor_id.apellidos}
                        </p>
                        <p className="text-slate-700 mb-1">
                          <strong>Especialidad:</strong> {appointment.doctor_id.especialidad}
                        </p>
                        <p className="text-slate-700 mb-1">
                          <strong>Tipo:</strong> {appointment.tipo_cita}
                        </p>
                        <p className="text-slate-700">
                          <strong>Consultorio:</strong> #{appointment.consultorio}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                        {appointment.estado}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Motivo de la cita:</p>
                      <p className="text-slate-800">{appointment.motivo}</p>
                    </div>
                    
                    {appointment.notas && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">Notas:</p>
                        <p className="text-blue-800">{appointment.notas}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Mi Historial Médico
            </h2>
            
            <div className="space-y-6">
              {patient.diagnoses && patient.diagnoses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Diagnósticos</h3>
                  <div className="space-y-3">
                    {patient.diagnoses.map((diagnosis) => (
                      <div key={diagnosis._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-slate-800">{diagnosis.diagnostico}</p>
                          <span className="text-sm text-slate-500">
                            {formatDate(diagnosis.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Dr. {diagnosis.doctor}</p>
                        {diagnosis.notas && (
                          <p className="text-sm text-slate-700 mt-2">{diagnosis.notas}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {patient.treatments && patient.treatments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Tratamientos</h3>
                  <div className="space-y-3">
                    {patient.treatments.map((treatment) => (
                      <div key={treatment._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-slate-800">{treatment.descripcion}</p>
                          <span className="text-sm text-slate-500">
                            {formatDate(treatment.fecha_inicio)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Dr. {treatment.doctor}</p>
                        {treatment.medicamento && (
                          <div className="mt-2 text-sm">
                            <p><strong>Medicamento:</strong> {treatment.medicamento}</p>
                            {treatment.dosis && <p><strong>Dosis:</strong> {treatment.dosis}</p>}
                            {treatment.frecuencia && <p><strong>Frecuencia:</strong> {treatment.frecuencia}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {patient.exams && patient.exams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Exámenes</h3>
                  <div className="space-y-3">
                    {patient.exams.map((exam) => (
                      <div key={exam._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-slate-800">{exam.tipo_examen}</p>
                            <p className="text-sm text-slate-700">{exam.descripcion}</p>
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatDate(exam.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Dr. {exam.doctor}</p>
                        {exam.resultados && (
                          <div className="mt-2 bg-white rounded p-2">
                            <p className="text-sm font-medium text-slate-700">Resultados:</p>
                            <p className="text-sm text-slate-800">{exam.resultados}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!patient.diagnoses || patient.diagnoses.length === 0) &&
               (!patient.treatments || patient.treatments.length === 0) &&
               (!patient.exams || patient.exams.length === 0) && (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-slate-400 mb-3" size={48} />
                  <p className="text-slate-500 text-lg">No hay historial médico registrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}