import { useState, useEffect } from 'react';
import { Heart, User, Clock, AlertCircle, Activity, FileText, LogOut, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  nombre: string;
  role: string;
}

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

interface EmergencyPatient {
  _id: string;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  edad: number;
  genero: string;
  sintomas: string;
  nivel_urgencia: string;
  signos_vitales: {
    presion_arterial?: string;
    frecuencia_cardiaca?: string;
    temperatura?: string;
    saturacion_oxigeno?: string;
  };
  alergias_conocidas?: string;
  medicamentos_actuales?: string;
  fecha_ingreso: string;
  estado: string;
  patient_id?: {
    tipoSangre?: string;
    alergias?: string;
    condicionesMedicas?: string;
    telefono?: string;
  };
}

interface DoctorInfo {
  nombre: string;
  especialidad: string;
  consultorio: number;
}

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [patients, setPatients] = useState<EmergencyPatient[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/doctors/my-patients/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setPatients(data.patients);
        setDoctorInfo(data.doctor);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/doctors/update-patient-status/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: newStatus,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadPatients();
        if (selectedPatient && selectedPatient._id === recordId) {
          setSelectedPatient({ ...selectedPatient, estado: newStatus });
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Crítica':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Baja':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En espera':
        return 'bg-blue-100 text-blue-800';
      case 'En atención':
        return 'bg-amber-100 text-amber-800';
      case 'Atendido':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredPatients = statusFilter === 'all'
    ? patients
    : patients.filter(p => p.estado === statusFilter);

  const patientsByStatus = {
    'En espera': patients.filter(p => p.estado === 'En espera').length,
    'En atención': patients.filter(p => p.estado === 'En atención').length,
    'Atendido': patients.filter(p => p.estado === 'Atendido').length,
  };

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
                <h1 className="text-2xl font-bold text-slate-800">SAVISER - Dashboard Doctor</h1>
                {doctorInfo && (
                  <p className="text-sm text-slate-600">
                    {doctorInfo.nombre} - {doctorInfo.especialidad} - Consultorio #{doctorInfo.consultorio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadPatients}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <RefreshCw size={18} />
                <span>Actualizar</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Espera</p>
                    <p className="text-3xl font-bold text-slate-800">{patientsByStatus['En espera']}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Activity className="text-amber-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Atención</p>
                    <p className="text-3xl font-bold text-slate-800">{patientsByStatus['En atención']}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="text-green-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Atendidos</p>
                    <p className="text-3xl font-bold text-slate-800">{patientsByStatus['Atendido']}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Pacientes Remitidos</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStatusFilter('En espera')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'En espera'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    En Espera
                  </button>
                  <button
                    onClick={() => setStatusFilter('En atención')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'En atención'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    En Atención
                  </button>
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto text-slate-400 mb-3" size={48} />
                  <p className="text-slate-500 text-lg">No hay pacientes remitidos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        selectedPatient?._id === patient._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">
                              {patient.nombres} {patient.apellidos}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(patient.nivel_urgencia)}`}>
                              {patient.nivel_urgencia}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.estado)}`}>
                              {patient.estado}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-slate-600">ID:</span>{' '}
                              <span className="font-semibold text-slate-800">{patient.numero_identificacion}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Edad:</span>{' '}
                              <span className="font-semibold text-slate-800">{patient.edad} años</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Género:</span>{' '}
                              <span className="font-semibold text-slate-800">{patient.genero}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Ingreso:</span>{' '}
                              <span className="font-semibold text-slate-800">
                                {new Date(patient.fecha_ingreso).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-start gap-2">
                            <AlertCircle className="text-slate-500 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-slate-700">{patient.sintomas}</p>
                          </div>
                        </div>
                        {patient.estado !== 'Atendido' && patient.estado !== 'Cancelado' && (
                          <div className="flex flex-col gap-2">
                            {patient.estado === 'En espera' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(patient._id, 'En atención');
                                }}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition"
                              >
                                Atender
                              </button>
                            )}
                            {patient.estado === 'En atención' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(patient._id, 'Atendido');
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                              >
                                Completar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Información Detallada del Paciente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Datos Personales</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-600 text-sm">Nombre Completo:</span>
                        <p className="font-semibold text-slate-800">{selectedPatient.nombres} {selectedPatient.apellidos}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 text-sm">Identificación:</span>
                        <p className="font-semibold text-slate-800">{selectedPatient.numero_identificacion}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 text-sm">Edad:</span>
                        <p className="font-semibold text-slate-800">{selectedPatient.edad} años</p>
                      </div>
                      <div>
                        <span className="text-slate-600 text-sm">Género:</span>
                        <p className="font-semibold text-slate-800">{selectedPatient.genero}</p>
                      </div>
                      {selectedPatient.patient_id?.tipoSangre && (
                        <div>
                          <span className="text-slate-600 text-sm">Tipo de Sangre:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.patient_id.tipoSangre}</p>
                        </div>
                      )}
                      {selectedPatient.patient_id?.telefono && (
                        <div>
                          <span className="text-slate-600 text-sm">Teléfono:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.patient_id.telefono}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Signos Vitales</h3>
                    <div className="space-y-2">
                      {selectedPatient.signos_vitales.presion_arterial && (
                        <div>
                          <span className="text-slate-600 text-sm">Presión Arterial:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.signos_vitales.presion_arterial} mmHg</p>
                        </div>
                      )}
                      {selectedPatient.signos_vitales.frecuencia_cardiaca && (
                        <div>
                          <span className="text-slate-600 text-sm">Frecuencia Cardíaca:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.signos_vitales.frecuencia_cardiaca} bpm</p>
                        </div>
                      )}
                      {selectedPatient.signos_vitales.temperatura && (
                        <div>
                          <span className="text-slate-600 text-sm">Temperatura:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.signos_vitales.temperatura} °C</p>
                        </div>
                      )}
                      {selectedPatient.signos_vitales.saturacion_oxigeno && (
                        <div>
                          <span className="text-slate-600 text-sm">Saturación de Oxígeno:</span>
                          <p className="font-semibold text-slate-800">{selectedPatient.signos_vitales.saturacion_oxigeno}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Información Clínica</h3>
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <span className="text-slate-600 text-sm block mb-1">Síntomas:</span>
                        <p className="text-slate-800">{selectedPatient.sintomas}</p>
                      </div>
                      {selectedPatient.alergias_conocidas && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <span className="text-red-700 text-sm font-semibold block mb-1">Alergias:</span>
                          <p className="text-red-800">{selectedPatient.alergias_conocidas}</p>
                        </div>
                      )}
                      {selectedPatient.medicamentos_actuales && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <span className="text-blue-700 text-sm font-semibold block mb-1">Medicamentos Actuales:</span>
                          <p className="text-blue-800">{selectedPatient.medicamentos_actuales}</p>
                        </div>
                      )}
                      {selectedPatient.patient_id?.condicionesMedicas && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <span className="text-amber-700 text-sm font-semibold block mb-1">Condiciones Médicas:</span>
                          <p className="text-amber-800">{selectedPatient.patient_id.condicionesMedicas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
