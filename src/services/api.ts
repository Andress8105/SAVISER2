import { supabaseService } from './supabaseService';
import type { Patient, MedicalExam, Diagnosis, Treatment, MedicalImage } from './supabaseService';
import type { WorkflowState, WorkflowHistory } from '../automaton';

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
}

export { type Patient, type MedicalExam, type Diagnosis, type Treatment, type MedicalImage };

export const searchPatient = async (numeroIdentificacion: string): Promise<PatientWithHistory | null> => {
  try {
    const patient = await supabaseService.getPatientByIdentification(numeroIdentificacion);

    if (!patient) {
      return null;
    }

    const { exams, diagnoses, treatments, images } = await supabaseService.getPatientMedicalData(patient.id);

    return {
      ...patient,
      exams,
      diagnoses,
      treatments,
      images,
    };
  } catch (error) {
    console.error('Error searching patient:', error);
    throw new Error('Error al buscar paciente');
  }
};

export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
  try {
    const patient = await supabaseService.createPatient(patientData);
    return patient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw new Error('Error al crear paciente');
  }
};

export const updatePatient = async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
  try {
    const patient = await supabaseService.updatePatient(id, patientData);
    return patient;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw new Error('Error al actualizar paciente');
  }
};

export const addMedicalExam = async (examData: Omit<MedicalExam, 'id' | 'created_at'>): Promise<MedicalExam> => {
  try {
    const exam = await supabaseService.createMedicalExam(examData);
    return exam;
  } catch (error) {
    console.error('Error adding medical exam:', error);
    throw new Error('Error al agregar examen');
  }
};

export const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'id' | 'created_at'>): Promise<Diagnosis> => {
  try {
    const diagnosis = await supabaseService.createDiagnosis(diagnosisData);
    return diagnosis;
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    throw new Error('Error al agregar diagnóstico');
  }
};

export const addTreatment = async (treatmentData: Omit<Treatment, 'id' | 'created_at'>): Promise<Treatment> => {
  try {
    const treatment = await supabaseService.createTreatment(treatmentData);
    return treatment;
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
    const fileUrl = URL.createObjectURL(file);

    const imageData = {
      patient_id: patientId,
      exam_id: metadata.exam_id,
      tipo: metadata.tipo,
      fecha: metadata.fecha,
      descripcion: metadata.descripcion,
      url: fileUrl,
      nombre_archivo: file.name,
    };

    const image = await supabaseService.createMedicalImage(imageData);
    return image;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir imagen');
  }
};

export const deleteMedicalImage = async (imageId: string): Promise<void> => {
  try {
    await supabaseService.deleteMedicalImage(imageId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Error al eliminar imagen');
  }
};
