// Interfaces para Especialidades
export interface Specialty {
  id: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTO para crear especialidad - Exactamente como el backend
export interface CreateSpecialtyDto {
  name: string;
  code: string;
  description?: string;
  department?: string;
}

// DTO para actualizar especialidad
export interface UpdateSpecialtyDto extends Partial<CreateSpecialtyDto> {
  id: string;
}

// Filtros para búsqueda de especialidades
export interface SpecialtyFilters {
  search?: string;
  department?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Respuesta paginada de especialidades
export interface SpecialtiesResponse {
  data: Specialty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
