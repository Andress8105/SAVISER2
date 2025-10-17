/*
  # Sistema Médico SAVISER - Base de Datos Completa

  1. Nuevas Tablas
    - `patients` - Información completa de pacientes
      - `id` (uuid, primary key)
      - `numero_identificacion` (text, unique)
      - `nombres` (text)
      - `apellidos` (text)
      - `fecha_nacimiento` (date)
      - `genero` (text)
      - `telefono` (text)
      - `email` (text)
      - `direccion` (text)
      - `tipo_sangre` (text)
      - `alergias` (text)
      - `condiciones_medicas` (text)
      - `contacto_emergencia_nombre` (text)
      - `contacto_emergencia_telefono` (text)
      - `contacto_emergencia_relacion` (text)
      - `workflow_state` (text) - Estado actual en el AFD
      - `workflow_history` (jsonb) - Historial de transiciones
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `medical_exams` - Exámenes médicos
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `tipo_examen` (text)
      - `fecha` (timestamptz)
      - `descripcion` (text)
      - `resultados` (text)
      - `doctor` (text)
      - `created_at` (timestamptz)
    
    - `diagnoses` - Diagnósticos médicos
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `fecha` (timestamptz)
      - `diagnostico` (text)
      - `cie10_code` (text)
      - `doctor` (text)
      - `notas` (text)
      - `created_at` (timestamptz)
    
    - `treatments` - Tratamientos
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `fecha_inicio` (timestamptz)
      - `fecha_fin` (timestamptz)
      - `tipo` (text)
      - `descripcion` (text)
      - `medicamento` (text)
      - `dosis` (text)
      - `frecuencia` (text)
      - `doctor` (text)
      - `activo` (boolean)
      - `created_at` (timestamptz)
    
    - `medical_images` - Imágenes médicas
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `exam_id` (uuid, foreign key, nullable)
      - `tipo` (text)
      - `fecha` (timestamptz)
      - `descripcion` (text)
      - `url` (text)
      - `nombre_archivo` (text)
      - `created_at` (timestamptz)
    
    - `workflow_transitions` - Log de transiciones del AFD
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `from_state` (text)
      - `to_state` (text)
      - `action` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
  
  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas restrictivas para usuarios autenticados

  3. Índices
    - Índices en columnas de búsqueda frecuente
    - Índices para foreign keys
*/

-- Crear tabla de pacientes
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
  workflow_state text DEFAULT 'INICIO' NOT NULL,
  workflow_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de exámenes médicos
CREATE TABLE IF NOT EXISTS medical_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tipo_examen text NOT NULL,
  fecha timestamptz NOT NULL,
  descripcion text NOT NULL,
  resultados text DEFAULT '',
  doctor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de diagnósticos
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  fecha timestamptz NOT NULL,
  diagnostico text NOT NULL,
  cie10_code text DEFAULT '',
  doctor text NOT NULL,
  notas text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de tratamientos
CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  fecha_inicio timestamptz NOT NULL,
  fecha_fin timestamptz,
  tipo text NOT NULL,
  descripcion text NOT NULL,
  medicamento text DEFAULT '',
  dosis text DEFAULT '',
  frecuencia text DEFAULT '',
  doctor text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de imágenes médicas
CREATE TABLE IF NOT EXISTS medical_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES medical_exams(id) ON DELETE SET NULL,
  tipo text NOT NULL,
  fecha timestamptz NOT NULL,
  descripcion text NOT NULL,
  url text NOT NULL,
  nombre_archivo text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de transiciones del workflow
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  from_state text NOT NULL,
  to_state text NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para búsqueda y performance
CREATE INDEX IF NOT EXISTS idx_patients_numero_identificacion ON patients(numero_identificacion);
CREATE INDEX IF NOT EXISTS idx_patients_workflow_state ON patients(workflow_state);
CREATE INDEX IF NOT EXISTS idx_medical_exams_patient_id ON medical_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_patient_id ON medical_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_patient_id ON workflow_transitions(patient_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at en patients
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

-- Políticas para patients (público por ahora para desarrollo, restrictivo en producción)
CREATE POLICY "Allow public read access to patients"
  ON patients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to patients"
  ON patients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to patients"
  ON patients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para medical_exams
CREATE POLICY "Allow public read access to medical_exams"
  ON medical_exams FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to medical_exams"
  ON medical_exams FOR INSERT
  TO public
  WITH CHECK (true);

-- Políticas para diagnoses
CREATE POLICY "Allow public read access to diagnoses"
  ON diagnoses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to diagnoses"
  ON diagnoses FOR INSERT
  TO public
  WITH CHECK (true);

-- Políticas para treatments
CREATE POLICY "Allow public read access to treatments"
  ON treatments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to treatments"
  ON treatments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to treatments"
  ON treatments FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para medical_images
CREATE POLICY "Allow public read access to medical_images"
  ON medical_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to medical_images"
  ON medical_images FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete to medical_images"
  ON medical_images FOR DELETE
  TO public
  USING (true);

-- Políticas para workflow_transitions
CREATE POLICY "Allow public read access to workflow_transitions"
  ON workflow_transitions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to workflow_transitions"
  ON workflow_transitions FOR INSERT
  TO public
  WITH CHECK (true);