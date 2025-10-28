// Enums - Exactamente como en el backend
export enum IdentificationType {
  DNI = 'DNI',
  CARNET_EXTRANJERIA = 'Carnet de Extranjería',
  PASAPORTE = 'Pasaporte',
  CEDULA_IDENTIDAD = 'Cédula de Identidad',
}

export enum MaritalStatus {
  SOLTERO = 'Soltero',
  CASADO = 'Casado',
  DIVORCIADO = 'Divorciado',
  VIUDO = 'Viudo',
  CONVIVIENTE = 'Conviviente',
}

export enum EducationLevel {
  SIN_INSTRUCCION = 'Sin Instrucción',
  PRIMARIA_INCOMPLETA = 'Primaria Incompleta',
  PRIMARIA_COMPLETA = 'Primaria Completa',
  SECUNDARIA_INCOMPLETA = 'Secundaria Incompleta',
  SECUNDARIA_COMPLETA = 'Secundaria Completa',
  TECNICA = 'Técnica',
  UNIVERSITARIA_INCOMPLETA = 'Universitaria Incompleta',
  UNIVERSITARIA_COMPLETA = 'Universitaria Completa',
  POSTGRADO = 'Postgrado',
}

export enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
}

// Interfaces
export interface Patient {
  id: string;
  firstName: string;
  secondName?: string;
  firstLastname: string;
  secondLastname?: string;
  birthDate: string;
  age: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  educationLevel: EducationLevel;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  allergies?: string;
  observations?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  fullIdentification: string;
}

// DTO para crear paciente - Exactamente como el backend
export interface CreatePatientDto {
  firstName: string;
  secondName?: string;
  firstLastname: string;
  secondLastname?: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  educationLevel: EducationLevel;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  allergies?: string;
  observations?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  id: string;
}

export interface PatientFilters {
  search?: string;
  civilStatus?: string;
  educationLevel?: string;
  identificationType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
