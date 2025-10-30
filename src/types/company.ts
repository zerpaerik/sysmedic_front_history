import { Subscription } from './subscription';

export interface Company {
  id: string;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  subscriptionId: string;
  subscription: Subscription | null;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  daysRemaining: number;
  nextRenewalDate: Date | null;
  subscriptionStatus: string;
  isSubscriptionActive: boolean;
  status: 'Activo' | 'Inactivo' | 'Suspendido' | 'Prueba';
  isActive: boolean;
  fullInfo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyDto {
  name: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  subscriptionId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  status?: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  isActive?: boolean;
}

export interface CompanyFilters {
  includeInactive?: boolean;
  search?: string;
}
