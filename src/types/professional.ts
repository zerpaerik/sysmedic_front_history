import { Specialty } from './specialty';

// Enums - Exactamente como en el backend
export enum IdentificationType {
  DNI = 'DNI',
  PASAPORTE = 'Pasaporte',
  CARNET_EXTRANJERIA = 'Carnet de Extranjería',
  CEDULA = 'Cédula',
}

export enum ProfessionalStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo',
  SUSPENDED = 'Suspendido',
  RETIRED = 'Retirado',
}

// Interfaces
export interface Professional {
  id: string;
  firstName: string;
  secondName?: string;
  firstLastname: string;
  secondLastname?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address?: string;
  status: ProfessionalStatus;
  licenseExpiryDate?: string;
  observations?: string;
  signatureUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialties?: Specialty[];
  fullName: string;
  fullIdentification: string;
  professionalInfo: string;
  specialtyNames: string[];
}

// DTO para crear profesional - Exactamente como el backend
export interface CreateProfessionalDto {
  firstName: string;
  secondName?: string;
  firstLastname: string;
  secondLastname?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address?: string;
  status: ProfessionalStatus;
  licenseExpiryDate?: string;
  observations?: string;
  signatureUrl?: string;
  specialtyIds?: string[];
}

// DTO para actualizar profesional
export interface UpdateProfessionalDto extends Partial<CreateProfessionalDto> {
  id: string;
}

// Filtros para búsqueda de profesionales
export interface ProfessionalFilters {
  search?: string;
  specialtyId?: string;
  status?: ProfessionalStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Respuesta paginada de profesionales
export interface ProfessionalsResponse {
  data: Professional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
