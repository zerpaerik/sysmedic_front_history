import { Patient } from './patient';
import { Professional } from './professional';
import { Specialty } from './specialty';

// Enums
export enum MedicalRecordStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Proceso',
  COMPLETED = 'Completada',
  CANCELLED = 'Cancelada',
}

// Interfaz para Triaje
export interface Triage {
  id: string;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  oxygenSaturation?: string;
  heartRate?: string;
  temperature?: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para Historia Clínica
export interface MedicalRecord {
  id: string;
  recordNumber: string;
  appointmentDate?: Date;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  status: MedicalRecordStatus;
  chiefComplaint?: string;
  currentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  patient: Patient;
  professional: Professional;
  specialty: Specialty;
  triage?: Triage;
}

// DTO para crear historia clínica
export interface CreateMedicalRecordDto {
  patientId: string;
  professionalId: string;
  specialtyId: string;
  appointmentDate?: string;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  status?: MedicalRecordStatus;
  chiefComplaint?: string;
  currentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  triage?: CreateTriageDto;
}

// DTO para crear triaje
export interface CreateTriageDto {
  weight?: string;
  height?: string;
  bloodPressure?: string;
  oxygenSaturation?: string;
  heartRate?: string;
  temperature?: string;
  observations?: string;
}

// DTO para actualizar historia clínica
export interface UpdateMedicalRecordDto {
  appointmentDate?: string;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  status?: MedicalRecordStatus;
  chiefComplaint?: string;
  currentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  triage?: CreateTriageDto;
}

// Filtros para búsqueda de historias clínicas
export interface MedicalRecordFilters {
  search?: string;
  patientId?: string;
  professionalId?: string;
  specialtyId?: string;
  status?: MedicalRecordStatus;
  appointmentDate?: string;
  startDate?: string;
  endDate?: string;
  hasTriageData?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Respuesta paginada de historias clínicas
export interface MedicalRecordsResponse {
  data: MedicalRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaz para búsqueda de paciente por DNI
export interface PatientSearchResult {
  found: boolean;
  patient?: Patient;
  message?: string;
}
