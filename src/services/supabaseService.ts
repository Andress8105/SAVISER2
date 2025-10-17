import { supabase } from '../lib/supabase';
import type { WorkflowState, WorkflowAction, WorkflowHistory } from '../automaton';

export interface Patient {
  id: string;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email?: string;
  direccion: string;
  tipo_sangre: string;
  alergias?: string;
  condiciones_medicas?: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_relacion: string;
  workflow_state: WorkflowState;
  workflow_history: WorkflowHistory[];
  created_at: string;
  updated_at: string;
}

export interface MedicalExam {
  id: string;
  patient_id: string;
  tipo_examen: string;
  fecha: string;
  descripcion: string;
  resultados?: string;
  doctor: string;
  created_at: string;
}

export interface Diagnosis {
  id: string;
  patient_id: string;
  fecha: string;
  diagnostico: string;
  cie10_code?: string;
  doctor: string;
  notas?: string;
  created_at: string;
}

export interface Treatment {
  id: string;
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
  created_at: string;
}

export interface MedicalImage {
  id: string;
  patient_id: string;
  exam_id?: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  url: string;
  nombre_archivo: string;
  created_at: string;
}

export interface WorkflowTransitionRecord {
  id: string;
  patient_id: string;
  from_state: WorkflowState;
  to_state: WorkflowState;
  action: WorkflowAction;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const supabaseService = {
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'workflow_state' | 'workflow_history'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        workflow_state: 'REGISTRO_PACIENTE',
        workflow_history: [{
          state: 'REGISTRO_PACIENTE',
          timestamp: new Date().toISOString(),
          action: 'REGISTRAR',
        }],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPatient(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPatientByIdentification(numeroIdentificacion: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('numero_identificacion', numeroIdentificacion)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async transitionWorkflowState(
    patientId: string,
    fromState: WorkflowState,
    toState: WorkflowState,
    action: WorkflowAction,
    metadata?: Record<string, unknown>
  ): Promise<Patient> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Paciente no encontrado');

    if (patient.workflow_state !== fromState) {
      throw new Error(`Estado actual del paciente es ${patient.workflow_state}, no ${fromState}`);
    }

    const newHistoryEntry: WorkflowHistory = {
      state: toState,
      timestamp: new Date().toISOString(),
      action,
      metadata,
    };

    const updatedHistory = [...patient.workflow_history, newHistoryEntry];

    const { data: transitionData, error: transitionError } = await supabase
      .from('workflow_transitions')
      .insert({
        patient_id: patientId,
        from_state: fromState,
        to_state: toState,
        action,
        metadata: metadata || {},
      });

    if (transitionError) throw transitionError;

    return this.updatePatient(patientId, {
      workflow_state: toState,
      workflow_history: updatedHistory,
    });
  },

  async getPatientMedicalData(patientId: string) {
    const [exams, diagnoses, treatments, images] = await Promise.all([
      this.getMedicalExams(patientId),
      this.getDiagnoses(patientId),
      this.getTreatments(patientId),
      this.getMedicalImages(patientId),
    ]);

    return { exams, diagnoses, treatments, images };
  },

  async getMedicalExams(patientId: string): Promise<MedicalExam[]> {
    const { data, error } = await supabase
      .from('medical_exams')
      .select('*')
      .eq('patient_id', patientId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createMedicalExam(examData: Omit<MedicalExam, 'id' | 'created_at'>): Promise<MedicalExam> {
    const { data, error } = await supabase
      .from('medical_exams')
      .insert(examData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('patient_id', patientId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createDiagnosis(diagnosisData: Omit<Diagnosis, 'id' | 'created_at'>): Promise<Diagnosis> {
    const { data, error } = await supabase
      .from('diagnoses')
      .insert(diagnosisData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTreatments(patientId: string): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('patient_id', patientId)
      .order('fecha_inicio', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTreatment(treatmentData: Omit<Treatment, 'id' | 'created_at'>): Promise<Treatment> {
    const { data, error } = await supabase
      .from('treatments')
      .insert(treatmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTreatment(id: string, updates: Partial<Treatment>): Promise<Treatment> {
    const { data, error } = await supabase
      .from('treatments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMedicalImages(patientId: string): Promise<MedicalImage[]> {
    const { data, error } = await supabase
      .from('medical_images')
      .select('*')
      .eq('patient_id', patientId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createMedicalImage(imageData: Omit<MedicalImage, 'id' | 'created_at'>): Promise<MedicalImage> {
    const { data, error } = await supabase
      .from('medical_images')
      .insert(imageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMedicalImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('medical_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getWorkflowTransitions(patientId: string): Promise<WorkflowTransitionRecord[]> {
    const { data, error } = await supabase
      .from('workflow_transitions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
