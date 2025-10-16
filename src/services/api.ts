import { supabase, Patient, MedicalExam, Diagnosis, Treatment, MedicalImage } from '../lib/supabase';

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

export const searchPatient = async (numeroIdentificacion: string): Promise<PatientWithHistory | null> => {
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('numero_identificacion', numeroIdentificacion)
    .maybeSingle();

  if (error) {
    throw new Error('Error al buscar paciente');
  }

  if (!patient) {
    return null;
  }

  const [examsResult, diagnosesResult, treatmentsResult, imagesResult] = await Promise.all([
    supabase.from('medical_exams').select('*').eq('patient_id', patient.id).order('fecha', { ascending: false }),
    supabase.from('diagnoses').select('*').eq('patient_id', patient.id).order('fecha', { ascending: false }),
    supabase.from('treatments').select('*').eq('patient_id', patient.id).order('fecha_inicio', { ascending: false }),
    supabase.from('medical_images').select('*').eq('patient_id', patient.id).order('fecha', { ascending: false })
  ]);

  return {
    ...patient,
    exams: examsResult.data || [],
    diagnoses: diagnosesResult.data || [],
    treatments: treatmentsResult.data || [],
    images: imagesResult.data || []
  };
};

export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select()
    .single();

  if (error) {
    throw new Error('Error al crear paciente: ' + error.message);
  }

  return data;
};

export const updatePatient = async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...patientData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Error al actualizar paciente: ' + error.message);
  }

  return data;
};

export const addMedicalExam = async (examData: Omit<MedicalExam, 'id' | 'created_at'>): Promise<MedicalExam> => {
  const { data, error } = await supabase
    .from('medical_exams')
    .insert([examData])
    .select()
    .single();

  if (error) {
    throw new Error('Error al agregar examen: ' + error.message);
  }

  return data;
};

export const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'id' | 'created_at'>): Promise<Diagnosis> => {
  const { data, error } = await supabase
    .from('diagnoses')
    .insert([diagnosisData])
    .select()
    .single();

  if (error) {
    throw new Error('Error al agregar diagnóstico: ' + error.message);
  }

  return data;
};

export const addTreatment = async (treatmentData: Omit<Treatment, 'id' | 'created_at'>): Promise<Treatment> => {
  const { data, error } = await supabase
    .from('treatments')
    .insert([treatmentData])
    .select()
    .single();

  if (error) {
    throw new Error('Error al agregar tratamiento: ' + error.message);
  }

  return data;
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
  const fileExt = file.name.split('.').pop();
  const fileName = `${patientId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('medical-images')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error('Error al subir imagen: ' + uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('medical-images')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('medical_images')
    .insert([{
      patient_id: patientId,
      exam_id: metadata.exam_id || null,
      tipo: metadata.tipo,
      fecha: metadata.fecha,
      descripcion: metadata.descripcion,
      url: publicUrl,
      nombre_archivo: file.name
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Error al guardar información de imagen: ' + error.message);
  }

  return data;
};

export const deleteMedicalImage = async (imageId: string, imageUrl: string): Promise<void> => {
  const pathParts = imageUrl.split('/medical-images/');
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    await supabase.storage.from('medical-images').remove([filePath]);
  }

  const { error } = await supabase
    .from('medical_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    throw new Error('Error al eliminar imagen: ' + error.message);
  }
};
