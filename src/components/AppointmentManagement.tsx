import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Appointment {
  _id: string;
  patient_id: {
    _id: string;
    nombres: string;
    apellidos: string;
    numero_identificacion: string;
    telefono: string;
  };
  doctor_id: {
    _id: string;
    nombre: string;
    apellidos: string;
    especialidad: string;
  };
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_cita: string;
  estado: string;
  motivo: string;
  notas: string;
  consultorio: number;
}

interface Doctor {
  _id: string;
  nombre: string;
  apellidos: string;
  especialidad: string;
  consultorio: number;
}

interface AppointmentManagementProps {
  companyId: string;
}

export default function AppointmentManagement({ companyId }: AppointmentManagementProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_id: '',
    fecha_cita: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fin: '',
    tipo_cita: 'Consulta General',
    motivo: '',
    consultorio: 1
  });

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/appointments/company/${companyId}?fecha=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setError('Error al cargar citas');
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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAppointment,
          companyId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setNewAppointment({
          patient_id: '',
          doctor_id: '',
          fecha_cita: new Date().toISOString().split('T')[0],
          hora_inicio: '',
          hora_fin: '',
          tipo_cita: 'Consulta General',
          motivo: '',
          consultorio: 1
        });
        loadAppointments();
      } else {
        setError(data.message || 'Error al crear cita');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        loadAppointments();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
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
      case 'No Asistió':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const appointmentsByHour = appointments.reduce((acc, appointment) => {
    const hour = appointment.hora_inicio;
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={28} />
          <h2 className="text-xl font-bold text-slate-800">Gestión de Citas</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showCreateForm ? 'Cancelar' : 'Nueva Cita'}</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={16} />
          <span>{appointments.length} citas programadas</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Cita</h3>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ID del Paciente
                </label>
                <input
                  type="text"
                  value={newAppointment.patient_id}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  placeholder="ID del paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Doctor
                </label>
                <select
                  value={newAppointment.doctor_id}
                  onChange={(e) => {
                    const selectedDoctor = doctors.find(d => d._id === e.target.value);
                    setNewAppointment({ 
                      ...newAppointment, 
                      doctor_id: e.target.value,
                      consultorio: selectedDoctor?.consultorio || 1
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Seleccionar doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.nombre} {doctor.apellidos} - {doctor.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newAppointment.fecha_cita}
                  onChange={(e) => setNewAppointment({ ...newAppointment, fecha_cita: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Cita
                </label>
                <select
                  value={newAppointment.tipo_cita}
                  onChange={(e) => setNewAppointment({ ...newAppointment, tipo_cita: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Examen">Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={newAppointment.hora_inicio}
                  onChange={(e) => setNewAppointment({ ...newAppointment, hora_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={newAppointment.hora_fin}
                  onChange={(e) => setNewAppointment({ ...newAppointment, hora_fin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo de la Cita
              </label>
              <textarea
                value={newAppointment.motivo}
                onChange={(e) => setNewAppointment({ ...newAppointment, motivo: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                required
                placeholder="Describa el motivo de la cita..."
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
                Crear Cita
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Citas del {new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-slate-400 mb-3" size={48} />
            <p className="text-slate-500 text-lg">No hay citas programadas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(appointmentsByHour)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([hour, hourAppointments]) => (
                <div key={hour} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="text-blue-600" size={18} />
                    <span className="font-semibold text-slate-800">{hour}</span>
                  </div>
                  <div className="space-y-3">
                    {hourAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <User className="text-slate-500" size={16} />
                            <span className="font-medium text-slate-800">
                              {appointment.patient_id.nombres} {appointment.patient_id.apellidos}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.estado)}`}>
                              {appointment.estado}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 ml-5">
                            <p>Dr. {appointment.doctor_id.nombre} {appointment.doctor_id.apellidos}</p>
                            <p>{appointment.tipo_cita} - Consultorio #{appointment.consultorio}</p>
                            <p>{appointment.motivo}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.estado === 'Programada' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'Confirmada')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                            >
                              Confirmar
                            </button>
                          )}
                          {appointment.estado === 'Confirmada' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'En Curso')}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition"
                            >
                              Iniciar
                            </button>
                          )}
                          {appointment.estado === 'En Curso' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'Completada')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition"
                            >
                              Completar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}