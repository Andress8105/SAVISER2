import { useState } from 'react';
import { Search } from 'lucide-react';

interface PatientSearchProps {
  onSearch: (numeroIdentificacion: string) => void;
  isLoading: boolean;
}

export default function PatientSearch({ onSearch, isLoading }: PatientSearchProps) {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numeroIdentificacion.trim()) {
      onSearch(numeroIdentificacion.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
            placeholder="Ingrese número de identificación"
            className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
        <button
          type="submit"
          disabled={isLoading || !numeroIdentificacion.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </form>
  );
}
