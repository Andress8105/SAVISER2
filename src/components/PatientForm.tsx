import { useState, useEffect } from 'react';
import { PatientFormData } from '../services/api';
import { User, Calendar, Phone, Mail, MapPin, Heart, AlertCircle, Users } from 'lucide-react';

interface PatientFormProps {
  existingPatient?: PatientFormData | null;
  onSubmit: (patientData: PatientFormData) => void;
  isLoading: boolean;
}

export default function PatientForm({ existingPatient, onSubmit, isLoading }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    telefono: '',
    email: '',
    direccion: '',
    tipo_sangre: 'O+',
    alergias: '',
    condiciones_medicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
  });

  useEffect(() => {
    if (existingPatient) {
      setFormData(existingPatient);
    }
  }, [existingPatient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isReadOnly = !!existingPatient;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isReadOnly ? 'Información del Paciente' : 'Registrar Nuevo Paciente'}
        </h2>
        <p className="text-slate-600">
          {isReadOnly ? 'Datos cargados automáticamente' : 'Complete todos los campos requeridos'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User size={16} />
              Número de Identificación *
            </label>
            <input
              type="text"
              name="numero_identificacion"
              value={formData.numero_identificacion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User size={16} />
              Nombres *
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User size={16} />
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Calendar size={16} />
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              Género *
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isReadOnly}
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Heart size={16} />
              Tipo de Sangre *
            </label>
            <select
              name="tipo_sangre"
              value={formData.tipo_sangre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isReadOnly}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Phone size={16} />
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly={isReadOnly}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <MapPin size={16} />
            Dirección *
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <AlertCircle size={16} />
            Alergias
          </label>
          <textarea
            name="alergias"
            value={formData.alergias}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Descripción de alergias conocidas"
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Heart size={16} />
            Condiciones Médicas
          </label>
          <textarea
            name="condiciones_medicas"
            value={formData.condiciones_medicas}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Condiciones médicas preexistentes"
            readOnly={isReadOnly}
          />
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <Users size={20} />
            Contacto de Emergencia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Teléfono *
              </label>
              <input
                type="tel"
                name="contacto_emergencia_telefono"
                value={formData.contacto_emergencia_telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Relación *
              </label>
              <input
                type="text"
                name="contacto_emergencia_relacion"
                value={formData.contacto_emergencia_relacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Madre, Padre, Esposo/a"
                required
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              {isLoading ? 'Guardando...' : 'Registrar Paciente'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
