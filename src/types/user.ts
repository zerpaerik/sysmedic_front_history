import { Company } from './company';

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  companyId: string;
  company: Company | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  companyId?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  includeInactive?: boolean;
  search?: string;
  role?: UserRole;
  companyId?: string;
}
