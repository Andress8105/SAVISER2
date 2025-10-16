import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Patient = {
  id: string;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  telefono: string;
  email?: string;
  direccion: string;
  tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  alergias: string;
  condiciones_medicas: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_relacion: string;
  created_at: string;
  updated_at: string;
};

export type MedicalExam = {
  id: string;
  patient_id: string;
  tipo_examen: string;
  fecha: string;
  descripcion: string;
  resultados: string;
  doctor: string;
  created_at: string;
};

export type Diagnosis = {
  id: string;
  patient_id: string;
  fecha: string;
  diagnostico: string;
  cie10_code?: string;
  doctor: string;
  notas: string;
  created_at: string;
};

export type Treatment = {
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
};

export type MedicalImage = {
  id: string;
  patient_id: string;
  exam_id?: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  url: string;
  nombre_archivo: string;
  created_at: string;
};
