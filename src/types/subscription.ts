export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  durationDays: number;
  durationDescription: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionDto {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}

export interface SubscriptionFilters {
  includeInactive?: boolean;
  search?: string;
}
