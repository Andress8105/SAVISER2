import { useState } from 'react';
import { Stethoscope, FileText, Pill, Image as ImageIcon } from 'lucide-react';
import ExamForm from './ExamForm';
import DiagnosisForm from './DiagnosisForm';
import TreatmentForm from './TreatmentForm';
import ImageUpload from './ImageUpload';
import type { MedicalExam, Diagnosis, Treatment, MedicalImage } from '../services/api';
import { Calendar, User, AlertCircle } from 'lucide-react';

interface MedicalRecordTabsProps {
  patientId: string;
  exams?: MedicalExam[];
  diagnoses?: Diagnosis[];
  treatments?: Treatment[];
  images?: MedicalImage[];
  onRefresh: () => void;
}

type TabType = 'exams' | 'diagnoses' | 'treatments' | 'images';

export default function MedicalRecordTabs({
  patientId,
  exams = [],
  diagnoses = [],
  treatments = [],
  images = [],
  onRefresh,
}: MedicalRecordTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('exams');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'exams' as TabType, label: 'Exámenes', icon: Stethoscope, count: exams.length, color: 'blue' },
    { id: 'diagnoses' as TabType, label: 'Diagnósticos', icon: FileText, count: diagnoses.length, color: 'red' },
    { id: 'treatments' as TabType, label: 'Tratamientos', icon: Pill, count: treatments.length, color: 'green' },
    { id: 'images' as TabType, label: 'Imágenes', icon: ImageIcon, count: images.length, color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
                isActive
                  ? `border-${tab.color}-600 text-${tab.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={20} />
              {tab.label}
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive
                    ? `bg-${tab.color}-100 text-${tab.color}-700`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="py-4">
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <ExamForm patientId={patientId} onSuccess={onRefresh} />

            {exams.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay exámenes registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div key={exam._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-2">
                          {exam.tipo_examen}
                        </span>
                        <p className="text-sm font-medium text-gray-900">{exam.descripcion}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exam.fecha)}
                      </div>
                    </div>
                    {exam.resultados && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Resultados:</span> {exam.resultados}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      Dr. {exam.doctor}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'diagnoses' && (
          <div className="space-y-4">
            <DiagnosisForm patientId={patientId} onSuccess={onRefresh} />

            {diagnoses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay diagnósticos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnoses.map((diagnosis) => (
                  <div key={diagnosis._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{diagnosis.diagnostico}</p>
                        {diagnosis.cie10_code && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-mono text-red-700 bg-red-100 rounded">
                            CIE-10: {diagnosis.cie10_code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(diagnosis.fecha)}
                      </div>
                    </div>
                    {diagnosis.notas && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Notas:</span> {diagnosis.notas}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      Dr. {diagnosis.doctor}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="space-y-4">
            <TreatmentForm patientId={patientId} onSuccess={onRefresh} />

            {treatments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay tratamientos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {treatments.map((treatment) => (
                  <div key={treatment._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            {treatment.tipo}
                          </span>
                          {treatment.activo && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{treatment.descripcion}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(treatment.fecha_inicio)}
                        </div>
                        {treatment.fecha_fin && (
                          <div className="mt-1">hasta {formatDate(treatment.fecha_fin)}</div>
                        )}
                      </div>
                    </div>
                    {treatment.medicamento && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Medicamento:</span> {treatment.medicamento}
                      </div>
                    )}
                    {treatment.dosis && (
                      <div className="mt-1 text-sm text-gray-700">
                        <span className="font-medium">Dosis:</span> {treatment.dosis}
                      </div>
                    )}
                    {treatment.frecuencia && (
                      <div className="mt-1 text-sm text-gray-700">
                        <span className="font-medium">Frecuencia:</span> {treatment.frecuencia}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      Dr. {treatment.doctor}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-4">
            <ImageUpload patientId={patientId} onSuccess={onRefresh} />

            {images.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay imágenes registradas</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((image) => (
                  <div key={image._id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-2 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.descripcion}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(image.url, '_blank')}
                      />
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full mb-1">
                      {image.tipo}
                    </span>
                    <p className="text-sm text-gray-900 font-medium">{image.descripcion}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(image.fecha)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
