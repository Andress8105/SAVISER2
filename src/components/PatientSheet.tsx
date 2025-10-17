import { User, Phone, Heart, Users, FileText } from 'lucide-react';
import { PatientWithHistory } from '../services/api';
import MedicalHistory from './MedicalHistory';
import ImageUpload from './ImageUpload';
import { WorkflowPanel } from './WorkflowPanel';

interface PatientSheetProps {
  patient: PatientWithHistory;
  onRefresh: () => void;
}

export default function PatientSheet({ patient, onRefresh }: PatientSheetProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={32} />
            <div>
              <h1 className="text-2xl font-bold">SAVISER</h1>
              <p className="text-sm text-blue-100">Sistema de Atención y Vida al Ser Humano</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">HISTORIA CLÍNICA</h2>
            <p className="text-sm text-blue-100">Registro Completo del Paciente</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        <div className="border-b-2 border-slate-200 pb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            DATOS PERSONALES
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex">
              <span className="font-semibold text-slate-700 w-48">Identificación:</span>
              <span className="text-slate-900">{patient.numero_identificacion}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-slate-700 w-48">Tipo de Sangre:</span>
              <span className="text-slate-900 font-bold text-red-600">{patient.tipo_sangre}</span>
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
              <span className="text-slate-900">{formatDate(patient.fecha_nacimiento)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-slate-700 w-48">Género:</span>
              <span className="text-slate-900">{patient.genero}</span>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-slate-200 pb-6">
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

        <div className="border-b-2 border-slate-200 pb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Heart size={20} className="text-blue-600" />
            INFORMACIÓN MÉDICA BÁSICA
          </h3>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Alergias:</span>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-slate-900">
                {patient.alergias || 'Ninguna registrada'}
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Condiciones Médicas:</span>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-slate-900">
                {patient.condiciones_medicas || 'Ninguna registrada'}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-slate-200 pb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            CONTACTO DE EMERGENCIA
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex">
                <span className="font-semibold text-slate-700 w-32">Nombre:</span>
                <span className="text-slate-900">{patient.contacto_emergencia_nombre}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-slate-700 w-32">Relación:</span>
                <span className="text-slate-900">{patient.contacto_emergencia_relacion}</span>
              </div>
              <div className="flex col-span-2">
                <span className="font-semibold text-slate-700 w-32">Teléfono:</span>
                <span className="text-slate-900 font-bold">{patient.contacto_emergencia_telefono}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-slate-200 pb-6">
          <WorkflowPanel patient={patient} onStateChange={onRefresh} />
        </div>

        <div className="border-b-2 border-slate-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              HISTORIAL MÉDICO COMPLETO
            </h3>
            <ImageUpload patientId={patient.id} onSuccess={onRefresh} />
          </div>
          <MedicalHistory
            exams={patient.exams}
            diagnoses={patient.diagnoses}
            treatments={patient.treatments}
            images={patient.images}
          />
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
  );
}
