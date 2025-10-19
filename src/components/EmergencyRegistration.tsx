import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Send, Stethoscope, Search, CheckCircle } from 'lucide-react';
import { searchPatient } from '../services/api';

export interface EmergencyData {
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  sintomas: string;
  nivel_urgencia: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  signos_vitales: {
    presion_arterial: string;
    frecuencia_cardiaca: string;
    temperatura: string;
    saturacion_oxigeno: string;
  };
  alergias_conocidas?: string;
  medicamentos_actuales?: string;
}

interface EmergencyRegistrationProps {
  onRegister: (data: EmergencyData) => void;
  isLoading?: boolean;
}

const SPECIALTIES = [
  { symptoms: ['fiebre', 'tos', 'gripe', 'dolor de garganta', 'resfriado'], specialty: 'Medicina General', doctor: 'Dr. García' },
  { symptoms: ['dolor de pecho', 'palpitaciones', 'presión alta', 'arritmia'], specialty: 'Cardiología', doctor: 'Dr. Martínez' },
  { symptoms: ['fractura', 'esguince', 'dolor de huesos', 'trauma'], specialty: 'Traumatología', doctor: 'Dr. López' },
  { symptoms: ['apendicitis', 'hernia', 'abdomen agudo'], specialty: 'Cirugía', doctor: 'Dr. Fernández' },
  { symptoms: ['embarazo', 'parto', 'ginecológico'], specialty: 'Ginecología', doctor: 'Dra. Rodríguez' },
  { symptoms: ['asma', 'neumonía', 'dificultad respiratoria'], specialty: 'Neumología', doctor: 'Dr. Sánchez' },
];

const determineSpecialty = (sintomas: string): { specialty: string; doctor: string } => {
  const sintomasLower = sintomas.toLowerCase();

  for (const spec of SPECIALTIES) {
    if (spec.symptoms.some(symptom => sintomasLower.includes(symptom))) {
      return { specialty: spec.specialty, doctor: spec.doctor };
    }
  }

  return { specialty: 'Medicina General', doctor: 'Dr. García' };
};

export default function EmergencyRegistration({ onRegister, isLoading = false }: EmergencyRegistrationProps) {
  const [formData, setFormData] = useState<EmergencyData>({
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    edad: 0,
    genero: 'Masculino',
    sintomas: '',
    nivel_urgencia: 'Media',
    signos_vitales: {
      presion_arterial: '',
      frecuencia_cardiaca: '',
      temperatura: '',
      saturacion_oxigeno: '',
    },
    alergias_conocidas: '',
    medicamentos_actuales: '',
  });

  const [assignedSpecialty, setAssignedSpecialty] = useState<{ specialty: string; doctor: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientFoundMessage, setPatientFoundMessage] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const calculateAge = (fechaNacimiento: string): number => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const autoFillPatientData = useCallback(async (numeroIdentificacion: string) => {
    if (numeroIdentificacion.length < 5) {
      setPatientFoundMessage(null);
      return;
    }

    setIsSearching(true);
    setPatientFoundMessage(null);

    try {
      const patient = await searchPatient(numeroIdentificacion);

      if (patient) {
        const edad = calculateAge(patient.fecha_nacimiento);

        setFormData(prev => ({
          ...prev,
          nombres: patient.nombres,
          apellidos: patient.apellidos,
          edad: edad,
          genero: patient.genero,
          alergias_conocidas: patient.alergias || '',
          medicamentos_actuales: patient.condiciones_medicas || '',
        }));

        setPatientFoundMessage(`Paciente encontrado: ${patient.nombres} ${patient.apellidos}`);
      } else {
        setPatientFoundMessage(null);
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      setPatientFoundMessage(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (formData.numero_identificacion.length >= 5) {
      const timeout = setTimeout(() => {
        autoFillPatientData(formData.numero_identificacion);
      }, 800);
      setSearchTimeout(timeout);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [formData.numero_identificacion]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('signos_vitales.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        signos_vitales: {
          ...prev.signos_vitales,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'edad' ? parseInt(value) || 0 : value,
      }));
    }

    if (name === 'sintomas' && value) {
      const assignment = determineSpecialty(value);
      setAssignedSpecialty(assignment);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  const getUrgencyColor = (nivel: string) => {
    switch (nivel) {
      case 'Baja':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Media':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Alta':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Crítica':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="p-3 bg-red-100 rounded-lg">
          <AlertCircle className="text-red-600" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registro de Urgencias</h2>
          <p className="text-slate-600">Ingreso de pacientes a emergencias</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Número de Identificación *
            </label>
            <div className="relative">
              <input
                type="text"
                name="numero_identificacion"
                value={formData.numero_identificacion}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Ej: 12345678 (se auto-completará si existe)"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="text-blue-500 animate-pulse" size={20} />
                </div>
              )}
            </div>
            {patientFoundMessage && (
              <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">{patientFoundMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombres *
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Nombres del paciente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Apellidos del paciente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Edad *
            </label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              required
              min="0"
              max="150"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Edad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Género *
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nivel de Urgencia *
            </label>
            <select
              name="nivel_urgencia"
              value={formData.nivel_urgencia}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${getUrgencyColor(formData.nivel_urgencia)}`}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Signos Vitales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Presión Arterial
              </label>
              <input
                type="text"
                name="signos_vitales.presion_arterial"
                value={formData.signos_vitales.presion_arterial}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Ej: 120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Frecuencia Cardíaca
              </label>
              <input
                type="text"
                name="signos_vitales.frecuencia_cardiaca"
                value={formData.signos_vitales.frecuencia_cardiaca}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Ej: 72 lpm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temperatura
              </label>
              <input
                type="text"
                name="signos_vitales.temperatura"
                value={formData.signos_vitales.temperatura}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Ej: 36.5°C"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Saturación O2
              </label>
              <input
                type="text"
                name="signos_vitales.saturacion_oxigeno"
                value={formData.signos_vitales.saturacion_oxigeno}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Ej: 98%"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Síntomas y Motivo de Consulta *
          </label>
          <textarea
            name="sintomas"
            value={formData.sintomas}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Describa los síntomas del paciente..."
          />
        </div>

        {assignedSpecialty && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Stethoscope className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Remisión Automática</h4>
              <p className="text-blue-800">
                Basado en los síntomas, el paciente será remitido a:
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-blue-900 font-medium">
                  Consultorio: {assignedSpecialty.specialty}
                </p>
                <p className="text-blue-900 font-medium">
                  Doctor asignado: {assignedSpecialty.doctor}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alergias Conocidas
            </label>
            <input
              type="text"
              name="alergias_conocidas"
              value={formData.alergias_conocidas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Ej: Penicilina, Polen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Medicamentos Actuales
            </label>
            <input
              type="text"
              name="medicamentos_actuales"
              value={formData.medicamentos_actuales}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Ej: Aspirina 100mg"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send size={20} />
            {isLoading ? 'Registrando...' : 'Registrar en Urgencias'}
          </button>
        </div>
      </form>
    </div>
  );
}
