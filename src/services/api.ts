const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PatientFormData {
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  telefono: string;
  email?: string;
  direccion: string;
  tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  alergias?: string;
  condiciones_medicas?: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_relacion: string;
}

export interface Patient extends PatientFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalExam {
  _id: string;
  patient_id: string;
  tipo_examen: string;
  fecha: string;
  descripcion: string;
  resultados: string;
  doctor: string;
  createdAt: string;
}

export interface Diagnosis {
  _id: string;
  patient_id: string;
  fecha: string;
  diagnostico: string;
  cie10_code?: string;
  doctor: string;
  notas: string;
  createdAt: string;
}

export interface Treatment {
  _id: string;
  patient_id: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: string;
  descripcion: string;
  medicamento?: string;
  dosis?: string;
  frecuencia?: string;
  doctor: string;
  activo: boolean;
  createdAt: string;
}

export interface MedicalImage {
  _id: string;
  patient_id: string;
  exam_id?: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  url: string;
  nombre_archivo: string;
  createdAt: string;
}

export interface PatientWithHistory extends Patient {
  exams?: MedicalExam[];
  diagnoses?: Diagnosis[];
  treatments?: Treatment[];
  images?: MedicalImage[];
}

export const searchPatient = async (numeroIdentificacion: string): Promise<PatientWithHistory | null> => {
  const response = await fetch(`${API_URL}/api/patients/search/${numeroIdentificacion}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Error al buscar paciente');
  }

  return response.json();
};

export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
  const response = await fetch(`${API_URL}/api/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear paciente');
  }

  return response.json();
};

export const updatePatient = async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
  const response = await fetch(`${API_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar paciente');
  }

  return response.json();
};

export const addMedicalExam = async (examData: Omit<MedicalExam, '_id' | 'createdAt'>): Promise<MedicalExam> => {
  const response = await fetch(`${API_URL}/api/patients/${examData.patient_id}/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(examData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al agregar examen');
  }

  return response.json();
};

export const addDiagnosis = async (diagnosisData: Omit<Diagnosis, '_id' | 'createdAt'>): Promise<Diagnosis> => {
  const response = await fetch(`${API_URL}/api/patients/${diagnosisData.patient_id}/diagnoses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(diagnosisData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al agregar diagnóstico');
  }

  return response.json();
};

export const addTreatment = async (treatmentData: Omit<Treatment, '_id' | 'createdAt'>): Promise<Treatment> => {
  const response = await fetch(`${API_URL}/api/patients/${treatmentData.patient_id}/treatments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(treatmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al agregar tratamiento');
  }

  return response.json();
};

export const uploadMedicalImage = async (
  file: File,
  patientId: string,
  metadata: {
    tipo: string;
    fecha: string;
    descripcion: string;
    exam_id?: string;
  }
): Promise<MedicalImage> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('tipo', metadata.tipo);
  formData.append('fecha', metadata.fecha);
  formData.append('descripcion', metadata.descripcion);
  if (metadata.exam_id) {
    formData.append('exam_id', metadata.exam_id);
  }

  const response = await fetch(`${API_URL}/api/patients/${patientId}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al subir imagen');
  }

  return response.json();
};

export const deleteMedicalImage = async (imageId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/images/${imageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar imagen');
  }
};
