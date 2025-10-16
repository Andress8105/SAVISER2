import { Patient } from '../services/api';
import { User, Calendar, Phone, Mail, MapPin, Heart, AlertCircle, Users, FileText } from 'lucide-react';

interface PatientSheetProps {
  patient: Patient;
}

export default function PatientSheet({ patient }: PatientSheetProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl" style={{ aspectRatio: '8.5/11' }}>
      <div className="h-full flex flex-col">
        <div className="bg-blue-600 text-white px-8 py-6 border-b-4 border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={32} />
            <div>
              <h1 className="text-2xl font-bold">SAVISER</h1>
              <p className="text-sm text-blue-100">Sistema de Atención y Vida al Ser Humano</p>
            </div>
          </div>
          <div className="mt-4 border-t border-blue-500 pt-4">
            <h2 className="text-xl font-semibold">HISTORIA CLÍNICA DEL PACIENTE</h2>
          </div>
        </div>

        <div className="flex-1 px-8 py-6 space-y-6 overflow-auto">
          <div className="border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              DATOS PERSONALES
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Identificación:</span>
                <span className="text-slate-900">{patient.numeroIdentificacion}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Tipo de Sangre:</span>
                <span className="text-slate-900 font-bold text-red-600">{patient.tipoSangre}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Nombres:</span>
                <span className="text-slate-900">{patient.nombres}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Apellidos:</span>
                <span className="text-slate-900">{patient.apellidos}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Fecha de Nacimiento:</span>
                <span className="text-slate-900">{formatDate(patient.fechaNacimiento)}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Género:</span>
                <span className="text-slate-900">{patient.genero}</span>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Phone size={20} className="text-blue-600" />
              INFORMACIÓN DE CONTACTO
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Teléfono:</span>
                <span className="text-slate-900">{patient.telefono}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-48">Email:</span>
                <span className="text-slate-900">{patient.email || 'No registrado'}</span>
              </div>
              <div className="flex col-span-2">
                <span className="font-semibold text-slate-700 w-48">Dirección:</span>
                <span className="text-slate-900">{patient.direccion}</span>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart size={20} className="text-blue-600" />
              INFORMACIÓN MÉDICA
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Alergias:</span>
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-slate-900">
                  {patient.alergias || 'Ninguna registrada'}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Condiciones Médicas:</span>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-slate-900">
                  {patient.condicionesMedicas || 'Ninguna registrada'}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              CONTACTO DE EMERGENCIA
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex">
                  <span className="font-semibold text-slate-700 w-32">Nombre:</span>
                  <span className="text-slate-900">{patient.contactoEmergencia.nombre}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-slate-700 w-32">Relación:</span>
                  <span className="text-slate-900">{patient.contactoEmergencia.relacion}</span>
                </div>
                <div className="flex col-span-2">
                  <span className="font-semibold text-slate-700 w-32">Teléfono:</span>
                  <span className="text-slate-900 font-bold">{patient.contactoEmergencia.telefono}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-8 py-4 border-t-2 border-slate-300">
          <p className="text-xs text-slate-600 text-center">
            Documento generado el {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} - SAVISER © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
