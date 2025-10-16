import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadMedicalImage } from '../services/api';

interface ImageUploadProps {
  patientId: string;
  onSuccess: () => void;
}

export default function ImageUpload({ patientId, onSuccess }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'Radiografía',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      await uploadMedicalImage(file, patientId, formData);
      setIsOpen(false);
      setFile(null);
      setPreview(null);
      setFormData({
        tipo: 'Radiografía',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: ''
      });
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al subir imagen');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Subir Imagen Médica
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Subir Imagen Médica</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Imagen
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="Radiografía">Radiografía</option>
              <option value="Resonancia">Resonancia Magnética</option>
              <option value="Tomografía">Tomografía</option>
              <option value="Ecografía">Ecografía</option>
              <option value="Electrocardiograma">Electrocardiograma</option>
              <option value="Laboratorio">Resultado de Laboratorio</option>
              <option value="Documento">Documento Médico</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Ej: Radiografía de tórax PA y lateral"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo
            </label>
            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Haz clic para seleccionar una imagen o documento
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, PDF (máx. 10MB)
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {file && (
                  <p className="mt-2 text-sm text-gray-600 text-center">{file.name}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir Imagen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
