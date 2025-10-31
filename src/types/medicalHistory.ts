// === TIPOS PARA ANTECEDENTES (HISTORIAL BASE) ===

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum AllergyType {
  FOOD = 'ALIMENTARIA',
  MEDICATION = 'MEDICAMENTOSA',
  ENVIRONMENTAL = 'AMBIENTAL',
  CONTACT = 'CONTACTO',
  RESPIRATORY = 'RESPIRATORIA',
}

export enum SurgeryType {
  MAJOR = 'MAYOR',
  MINOR = 'MENOR',
  AMBULATORY = 'AMBULATORIA',
  EMERGENCY = 'EMERGENCIA',
}

export interface MedicalHistoryBase {
  id: string;
  // Antecedentes personales
  bloodType?: BloodType;
  personalHistory?: string;
  chronicDiseases?: string;
  allergies?: string;
  allergyTypes?: AllergyType[];
  immunizations?: string;

  // Antecedentes quirúrgicos
  surgicalHistory?: string;
  surgeries?: Array<{
    date: string;
    procedure: string;
    type: SurgeryType;
    hospital: string;
    complications?: string;
  }>;

  // Antecedentes de medicamentos
  currentMedications?: string;
  medications?: Array<{
    name: string;
    dose: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    indication: string;
  }>;
  adverseReactions?: string;

  // Antecedentes familiares
  familyHistory?: string;
  familyDiseases?: Array<{
    relationship: string;
    disease: string;
    ageOfOnset?: number;
    alive: boolean;
    causeOfDeath?: string;
  }>;

  // Hábitos y estilo de vida
  smoker?: boolean;
  smokingHistory?: string;
  alcoholConsumer?: boolean;
  alcoholHistory?: string;
  drugUser?: boolean;
  drugHistory?: string;
  physicalActivity?: string;
  diet?: string;

  // Antecedentes gineco-obstétricos
  pregnancies?: number;
  births?: number;
  abortions?: number;
  cesareans?: number;
  lastMenstrualPeriod?: string;
  menarche?: number;
  contraceptiveMethod?: string;

  // Antecedentes ocupacionales
  occupation?: string;
  occupationalRisks?: string;
  workEnvironment?: string;

  // Antecedentes epidemiológicos
  malaria?: boolean;
  dengue?: boolean;
  tuberculosis?: boolean;
  chagas?: boolean;
  leishmaniasis?: boolean;
  travelHistory?: string;

  // Observaciones
  observations?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === TIPOS PARA HISTORIA CLÍNICA POR ESPECIALIDAD ===

export enum SpecialtyHistoryType {
  GENERAL_MEDICINE = 'MEDICINA_GENERAL',
  DERMATOLOGY = 'DERMATOLOGÍA',
  PEDIATRICS = 'PEDIATRÍA',
  UROLOGY = 'UROLOGÍA',
  OBSTETRICS = 'OBSTETRICIA',
  TRAUMATOLOGY = 'TRAUMATOLOGÍA',
  INTERNAL_MEDICINE = 'MEDICINA_INTERNA',
}

export enum PainScale {
  NONE = 0,
  MILD = 1,
  MILD_MODERATE = 2,
  MODERATE = 3,
  MODERATE_SEVERE = 4,
  SEVERE = 5,
  VERY_SEVERE = 6,
  INTENSE = 7,
  VERY_INTENSE = 8,
  EXCRUCIATING = 9,
  UNBEARABLE = 10,
}

export enum ConsciousnessLevel {
  ALERT = 'ALERTA',
  DROWSY = 'SOMNOLIENTO',
  STUPOROUS = 'ESTUPOROSO',
  COMATOSE = 'COMATOSO',
}

export interface SpecialtyMedicalHistory {
  id: string;
  specialtyType: SpecialtyHistoryType;

  // Campos comunes
  chiefComplaint: string;
  currentIllness: string;
  systemsReview?: string;
  generalPhysicalExam?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };

  // Campos específicos por especialidad (JSON)
  generalMedicine?: any;
  dermatology?: any;
  pediatrics?: any;
  urology?: any;
  obstetrics?: any;
  traumatology?: any;
  internalMedicine?: any;

  // Diagnósticos
  diagnoses: Array<{
    type: 'principal' | 'secundario' | 'diferencial';
    code?: string;
    description: string;
    certainty: 'definitivo' | 'presuntivo' | 'descartado';
  }>;

  // Plan de tratamiento
  treatmentPlan?: {
    medications?: Array<{
      medication: string;
      dose: string;
      frequency: string;
      duration: string;
      indication: string;
    }>;
    nonPharmacological?: Array<{
      type: string;
      description: string;
      duration: string;
    }>;
    procedures?: Array<{
      procedure: string;
      indication: string;
      date?: string;
      urgency: string;
    }>;
    referrals?: Array<{
      specialty: string;
      reason: string;
      urgency: string;
    }>;
  };

  // Estudios complementarios
  complementaryStudies?: {
    laboratory?: Array<{
      test: string;
      indication: string;
      urgency: string;
      date?: string;
      result?: string;
    }>;
    imaging?: Array<{
      study: string;
      indication: string;
      urgency: string;
      date?: string;
      result?: string;
    }>;
    otherStudies?: Array<{
      study: string;
      indication: string;
      date?: string;
      result?: string;
    }>;
  };

  // Seguimiento
  followUp?: {
    nextAppointment?: {
      date: string;
      reason: string;
      specialty?: string;
    };
    warningSigns?: Array<string>;
    recommendations?: Array<string>;
    prognosis?: {
      shortTerm: string;
      longTerm: string;
    };
  };

  // Observaciones
  clinicalNotes?: string;
  observations?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === TIPOS PARA ESTADO DE COMPLETITUD ===

export interface CompletionStatus {
  hasTriage: boolean;
  hasMedicalHistoryBase: boolean;
  hasSpecialtyHistory: boolean;
  canFinalize: boolean;
  missingSteps: string[];
}

// === TIPOS PARA FORMULARIOS ===

export interface CreateMedicalHistoryBaseDto {
  bloodType?: BloodType;
  personalHistory?: string;
  chronicDiseases?: string;
  allergies?: string;
  allergyTypes?: AllergyType[];
  immunizations?: string;
  surgicalHistory?: string;
  surgeries?: Array<{
    date: string;
    procedure: string;
    type: SurgeryType;
    hospital: string;
    complications?: string;
  }>;
  currentMedications?: string;
  medications?: Array<{
    name: string;
    dose: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    indication: string;
  }>;
  adverseReactions?: string;
  familyHistory?: string;
  familyDiseases?: Array<{
    relationship: string;
    disease: string;
    ageOfOnset?: number;
    alive: boolean;
    causeOfDeath?: string;
  }>;
  smoker?: boolean;
  smokingHistory?: string;
  alcoholConsumer?: boolean;
  alcoholHistory?: string;
  drugUser?: boolean;
  drugHistory?: string;
  physicalActivity?: string;
  diet?: string;
  pregnancies?: number;
  births?: number;
  abortions?: number;
  cesareans?: number;
  lastMenstrualPeriod?: string;
  menarche?: number;
  contraceptiveMethod?: string;
  occupation?: string;
  occupationalRisks?: string;
  workEnvironment?: string;
  malaria?: boolean;
  dengue?: boolean;
  tuberculosis?: boolean;
  chagas?: boolean;
  leishmaniasis?: boolean;
  travelHistory?: string;
  observations?: string;
}

export interface CreateSpecialtyMedicalHistoryDto {
  specialtyType: SpecialtyHistoryType;
  chiefComplaint: string;
  currentIllness: string;
  systemsReview?: string;
  generalPhysicalExam?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  generalMedicine?: any;
  dermatology?: any;
  pediatrics?: any;
  urology?: any;
  obstetrics?: any;
  traumatology?: any;
  internalMedicine?: any;
  diagnoses: Array<{
    type: 'principal' | 'secundario' | 'diferencial';
    code?: string;
    description: string;
    certainty: 'definitivo' | 'presuntivo' | 'descartado';
  }>;
  treatmentPlan?: any;
  complementaryStudies?: any;
  followUp?: any;
  clinicalNotes?: string;
  observations?: string;
}
