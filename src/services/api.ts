const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Patient {
  _id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalExam {
  _id: string;
  patient_id: string;
  tipo_examen: string;
  fecha: string;
  descripcion: string;
  resultados?: string;
  doctor: string;
  createdAt?: string;
}

export interface Diagnosis {
  _id: string;
  patient_id: string;
  fecha: string;
  diagnostico: string;
  cie10_code?: string;
  doctor: string;
  notas?: string;
  createdAt?: string;
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
  createdAt?: string;
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
  createdAt?: string;
}

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

export interface PatientWithHistory extends Patient {
  exams?: MedicalExam[];
  diagnoses?: Diagnosis[];
  treatments?: Treatment[];
  images?: MedicalImage[];
  workflow_state: string;
  workflow_history: Array<{
    state: string;
    timestamp: string;
    action: string;
    metadata?: Record<string, unknown>;
  }>;
}

export const searchPatient = async (numeroIdentificacion: string): Promise<PatientWithHistory | null> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/search/${numeroIdentificacion}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Error al buscar paciente');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching patient:', error);
    throw new Error('Error al buscar paciente');
  }
};

export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
  try {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const updatePatient = async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar paciente');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw new Error('Error al actualizar paciente');
  }
};

export const addMedicalExam = async (examData: Omit<MedicalExam, '_id' | 'createdAt'>): Promise<MedicalExam> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/${examData.patient_id}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      throw new Error('Error al agregar examen');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding medical exam:', error);
    throw new Error('Error al agregar examen');
  }
};

export const addDiagnosis = async (diagnosisData: Omit<Diagnosis, '_id' | 'createdAt'>): Promise<Diagnosis> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/${diagnosisData.patient_id}/diagnoses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagnosisData),
    });

    if (!response.ok) {
      throw new Error('Error al agregar diagnóstico');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    throw new Error('Error al agregar diagnóstico');
  }
};

export const addTreatment = async (treatmentData: Omit<Treatment, '_id' | 'createdAt'>): Promise<Treatment> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/${treatmentData.patient_id}/treatments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treatmentData),
    });

    if (!response.ok) {
      throw new Error('Error al agregar tratamiento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding treatment:', error);
    throw new Error('Error al agregar tratamiento');
  }
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
  try {
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
      throw new Error('Error al subir imagen');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir imagen');
  }
};

export const deleteMedicalImage = async (imageId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/images/${imageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar imagen');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Error al eliminar imagen');
  }
};

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

export interface EmergencyResponse {
  success: boolean;
  patient: Patient;
  emergencyRecord: any;
  assignment: {
    specialty: string;
    doctor: string;
  };
}

export const registerEmergency = async (emergencyData: EmergencyData): Promise<EmergencyResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/patients/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emergencyData),
    });

    if (!response.ok) {
      throw new Error('Error al registrar urgencia');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering emergency:', error);
    throw new Error('Error al registrar urgencia');
  }
};
