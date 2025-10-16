/*
  # Create Patients and Medical History System

  ## Overview
  This migration creates a comprehensive patient management system with medical history tracking and image storage capabilities.

  ## New Tables

  ### 1. `patients`
  Core patient demographic and contact information
  - `id` (uuid, primary key) - Unique patient identifier
  - `numero_identificacion` (text, unique) - National ID or passport number
  - `nombres` (text) - Patient's first names
  - `apellidos` (text) - Patient's last names
  - `fecha_nacimiento` (date) - Date of birth
  - `genero` (text) - Gender (Masculino, Femenino, Otro)
  - `telefono` (text) - Phone number
  - `email` (text) - Email address
  - `direccion` (text) - Physical address
  - `tipo_sangre` (text) - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `alergias` (text) - Known allergies
  - `condiciones_medicas` (text) - Pre-existing medical conditions
  - `contacto_emergencia_nombre` (text) - Emergency contact name
  - `contacto_emergencia_telefono` (text) - Emergency contact phone
  - `contacto_emergencia_relacion` (text) - Relationship to patient
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `medical_exams`
  Medical examinations and test results
  - `id` (uuid, primary key)
  - `patient_id` (uuid, foreign key) - References patients table
  - `tipo_examen` (text) - Type of examination (Laboratorio, Radiografía, Resonancia, etc.)
  - `fecha` (date) - Date of examination
  - `descripcion` (text) - Exam description
  - `resultados` (text) - Test results
  - `doctor` (text) - Attending physician
  - `created_at` (timestamptz)

  ### 3. `diagnoses`
  Medical diagnoses history
  - `id` (uuid, primary key)
  - `patient_id` (uuid, foreign key)
  - `fecha` (date) - Diagnosis date
  - `diagnostico` (text) - Diagnosis description
  - `cie10_code` (text) - ICD-10 code (optional)
  - `doctor` (text) - Diagnosing physician
  - `notas` (text) - Additional notes
  - `created_at` (timestamptz)

  ### 4. `treatments`
  Treatment and medication history
  - `id` (uuid, primary key)
  - `patient_id` (uuid, foreign key)
  - `fecha_inicio` (date) - Treatment start date
  - `fecha_fin` (date) - Treatment end date (nullable)
  - `tipo` (text) - Treatment type (Medicamento, Cirugía, Terapia, etc.)
  - `descripcion` (text) - Treatment description
  - `medicamento` (text) - Medication name (if applicable)
  - `dosis` (text) - Dosage information
  - `frecuencia` (text) - Frequency (e.g., "cada 8 horas")
  - `doctor` (text) - Prescribing physician
  - `activo` (boolean) - Whether treatment is currently active
  - `created_at` (timestamptz)

  ### 5. `medical_images`
  Medical images and documents (radiografías, resonancias, etc.)
  - `id` (uuid, primary key)
  - `patient_id` (uuid, foreign key)
  - `exam_id` (uuid, foreign key, nullable) - Associated exam if applicable
  - `tipo` (text) - Image type (Radiografía, Resonancia, Ecografía, Documento, etc.)
  - `fecha` (date) - Image date
  - `descripcion` (text) - Image description
  - `url` (text) - Storage URL for the image
  - `nombre_archivo` (text) - Original filename
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Authenticated users can read all patient data
  - Authenticated users can insert and update all records
  - This assumes a healthcare application where medical staff need access to patient records

  ## Indexes
  - Index on `numero_identificacion` for fast patient lookup
  - Indexes on `patient_id` foreign keys for efficient joins
  - Index on `fecha` fields for chronological queries
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_identificacion text UNIQUE NOT NULL,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  fecha_nacimiento date NOT NULL,
  genero text NOT NULL CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  telefono text NOT NULL,
  email text,
  direccion text NOT NULL,
  tipo_sangre text NOT NULL CHECK (tipo_sangre IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  alergias text DEFAULT '',
  condiciones_medicas text DEFAULT '',
  contacto_emergencia_nombre text NOT NULL,
  contacto_emergencia_telefono text NOT NULL,
  contacto_emergencia_relacion text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medical_exams table
CREATE TABLE IF NOT EXISTS medical_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tipo_examen text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  descripcion text NOT NULL,
  resultados text DEFAULT '',
  doctor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  diagnostico text NOT NULL,
  cie10_code text,
  doctor text NOT NULL,
  notas text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date,
  tipo text NOT NULL,
  descripcion text NOT NULL,
  medicamento text,
  dosis text,
  frecuencia text,
  doctor text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create medical_images table
CREATE TABLE IF NOT EXISTS medical_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES medical_exams(id) ON DELETE SET NULL,
  tipo text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  descripcion text NOT NULL,
  url text NOT NULL,
  nombre_archivo text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_numero_identificacion ON patients(numero_identificacion);
CREATE INDEX IF NOT EXISTS idx_medical_exams_patient_id ON medical_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_exams_fecha ON medical_exams(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_fecha ON diagnoses(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_activo ON treatments(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_medical_images_patient_id ON medical_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_exam_id ON medical_images(exam_id);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY "Authenticated users can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for medical_exams table
CREATE POLICY "Authenticated users can view all medical exams"
  ON medical_exams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert medical exams"
  ON medical_exams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update medical exams"
  ON medical_exams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete medical exams"
  ON medical_exams FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for diagnoses table
CREATE POLICY "Authenticated users can view all diagnoses"
  ON diagnoses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert diagnoses"
  ON diagnoses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update diagnoses"
  ON diagnoses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete diagnoses"
  ON diagnoses FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for treatments table
CREATE POLICY "Authenticated users can view all treatments"
  ON treatments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert treatments"
  ON treatments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update treatments"
  ON treatments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete treatments"
  ON treatments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for medical_images table
CREATE POLICY "Authenticated users can view all medical images"
  ON medical_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert medical images"
  ON medical_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update medical images"
  ON medical_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete medical images"
  ON medical_images FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for medical images
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical images
CREATE POLICY "Authenticated users can upload medical images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'medical-images');

CREATE POLICY "Authenticated users can view medical images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'medical-images');

CREATE POLICY "Authenticated users can update medical images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'medical-images')
  WITH CHECK (bucket_id = 'medical-images');

CREATE POLICY "Authenticated users can delete medical images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'medical-images');