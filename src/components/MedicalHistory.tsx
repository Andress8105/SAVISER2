import { FileText, Stethoscope, Pill, Image as ImageIcon, Calendar, User, AlertCircle } from 'lucide-react';
import { MedicalExam, Diagnosis, Treatment, MedicalImage } from '../lib/supabase';

interface MedicalHistoryProps {
  exams?: MedicalExam[];
  diagnoses?: Diagnosis[];
  treatments?: Treatment[];
  images?: MedicalImage[];
}

export default function MedicalHistory({ exams = [], diagnoses = [], treatments = [], images = [] }: MedicalHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {exams.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Exámenes Médicos</h3>
          </div>
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
        </div>
      )}

      {diagnoses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Diagnósticos</h3>
          </div>
          <div className="space-y-3">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
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
        </div>
      )}

      {treatments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tratamientos</h3>
          </div>
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
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
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Imágenes Médicas</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="aspect-video bg-gray-200 rounded-lg mb-2 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.descripcion}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => window.open(image.url, '_blank')}
                  />
                </div>
                <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full mb-1">
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
        </div>
      )}

      {exams.length === 0 && diagnoses.length === 0 && treatments.length === 0 && images.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay historial médico registrado para este paciente</p>
        </div>
      )}
    </div>
  );
}
