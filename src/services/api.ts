const API_URL = 'http://localhost:3001/api';

export interface Patient {
  _id?: string;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  telefono: string;
  email?: string;
  direccion: string;
  tipoSangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  alergias?: string;
  condicionesMedicas?: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

export const searchPatient = async (numeroIdentificacion: string) => {
  const response = await fetch(`${API_URL}/patients/search/${numeroIdentificacion}`);
  if (!response.ok) {
    throw new Error('Error al buscar paciente');
  }
  return response.json();
};

export const createPatient = async (patientData: Patient) => {
  const response = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    throw new Error('Error al crear paciente');
  }
  return response.json();
};

export const updatePatient = async (id: string, patientData: Partial<Patient>) => {
  const response = await fetch(`${API_URL}/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar paciente');
  }
  return response.json();
};
