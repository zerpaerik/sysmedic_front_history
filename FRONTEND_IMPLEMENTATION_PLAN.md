# 📋 PLAN DE IMPLEMENTACIÓN FRONTEND - Suscripciones, Empresas y Usuarios

## 🎯 Objetivo
Implementar módulos completos de gestión de **Suscripciones**, **Empresas** y **Usuarios** en la sección de Configuración del frontend, integrándolos con el backend ya desarrollado.

## 📊 Estructura del Plan

### 1. Types & Interfaces (`src/types/`)
Crear interfaces TypeScript que coincidan con los DTOs del backend:

#### `src/types/subscription.ts`
```typescript
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
```

#### `src/types/company.ts`
```typescript
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
  subscriptionStatus: string; // 'Activa', 'Por vencer', 'Vencida'
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
```

#### `src/types/user.ts`
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
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
  role?: string;
  companyId?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}

export interface UserFilters {
  includeInactive?: boolean;
  search?: string;
  role?: string;
  companyId?: string;
}
```

### 2. Services (`src/services/`)

#### `src/services/subscriptionService.ts`
```typescript
import axios from 'axios';
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto } from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SubscriptionService {
  private baseURL = `${API_URL}/subscriptions`;

  async getSubscriptions(includeInactive = false): Promise<Subscription[]> {
    const token = localStorage.getItem('sysmedic_token');
    const response = await axios.get(
      `${this.baseURL}?includeInactive=${includeInactive}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    const token = localStorage.getItem('sysmedic_token');
    const response = await axios.get(`${this.baseURL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const token = localStorage.getItem('sysmedic_token');
    const response = await axios.post(this.baseURL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    const token = localStorage.getItem('sysmedic_token');
    const response = await axios.patch(`${this.baseURL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deleteSubscription(id: string): Promise<void> {
    const token = localStorage.getItem('sysmedic_token');
    await axios.delete(`${this.baseURL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async activateSubscription(id: string): Promise<Subscription> {
    const token = localStorage.getItem('sysmedic_token');
    const response = await axios.patch(`${this.baseURL}/${id}/activate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
```

#### `src/services/companyService.ts`
Similar estructura con endpoints de companies

#### `src/services/userService.ts`
Similar estructura con endpoints de users

### 3. Componentes (`src/components/`)

#### Subscriptions Components
- `src/components/subscriptions/SubscriptionList.tsx`
- `src/components/subscriptions/SubscriptionForm.tsx`
- `src/components/subscriptions/DeleteSubscriptionModal.tsx`
- `src/components/subscriptions/SubscriptionCard.tsx`

#### Companies Components
- `src/components/companies/CompanyList.tsx`
- `src/components/companies/CompanyForm.tsx`
- `src/components/companies/DeleteCompanyModal.tsx`
- `src/components/companies/CompanyCard.tsx`
- `src/components/companies/SubscriptionStatusBadge.tsx` (muestra días restantes)

#### Users Components
- `src/components/users/UserList.tsx`
- `src/components/users/UserForm.tsx`
- `src/components/users/DeleteUserModal.tsx`
- `src/components/users/UserCard.tsx`

### 4. Páginas (`src/app/settings/`)

#### Estructura de rutas:
```
/settings                    → Página principal con cards de navegación
/settings/subscriptions      → Gestión de suscripciones
/settings/companies          → Gestión de empresas
/settings/users              → Gestión de usuarios
```

#### `src/app/settings/page.tsx` (actualizar)
Agregar cards para navegar a cada módulo:
- Card "Suscripciones" → `/settings/subscriptions`
- Card "Empresas" → `/settings/companies`
- Card "Usuarios" → `/settings/users`

#### `src/app/settings/subscriptions/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
// ... similar a patients/page.tsx
```

#### `src/app/settings/companies/page.tsx`
Con visualización especial de días restantes y estado de suscripción

#### `src/app/settings/users/page.tsx`
Con filtros por rol y empresa

### 5. Características Especiales

#### Companies - Visualización de Suscripción
```typescript
// Badge de estado con colores
const getStatusColor = (daysRemaining: number) => {
  if (daysRemaining === 0) return 'bg-red-100 text-red-800';
  if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800';
  if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

// Mostrar en tabla/card:
<div>
  <span className={getStatusColor(company.daysRemaining)}>
    {company.daysRemaining} días restantes
  </span>
  <p>Próxima renovación: {formatDate(company.nextRenewalDate)}</p>
  <Badge>{company.subscriptionStatus}</Badge>
</div>
```

#### Users - Selector de Empresa
```typescript
// En el formulario de usuario
<Select 
  value={formData.companyId}
  onChange={(value) => setFormData({...formData, companyId: value})}
>
  {companies.map(company => (
    <SelectItem key={company.id} value={company.id}>
      {company.name} - {company.ruc}
    </SelectItem>
  ))}
</Select>
```

### 6. Flujo de Datos

```
Usuario → Página → Componente → Service → API Backend
                ↓
           State Management
                ↓
         Actualización UI
```

### 7. Validaciones

#### Subscriptions
- Nombre único
- Precio > 0
- Duración > 0
- Features array válido

#### Companies
- RUC único (11 dígitos)
- Email válido
- Fechas de suscripción coherentes

#### Users
- Email único
- Username único
- Password mínimo 6 caracteres
- Rol válido

### 8. Estados y Notificaciones

```typescript
// Toast notifications
import { toast } from 'sonner';

// Success
toast.success('Suscripción creada exitosamente');

// Error
toast.error('Error al crear suscripción');

// Warning
toast.warning('La suscripción está por vencer');
```

### 9. Permisos

Solo usuarios con rol **ADMIN** pueden acceder a estos módulos.

```typescript
// Verificar en cada página
useEffect(() => {
  const user = authService.getCurrentUser();
  if (user?.role !== 'admin') {
    router.push('/dashboard');
    toast.error('No tienes permisos para acceder a esta sección');
  }
}, []);
```

### 10. Responsive Design

- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Tabla con columnas esenciales
- **Mobile**: Cards apiladas

## 📦 Archivos a Crear (Total: ~30 archivos)

### Types (3 archivos)
- `src/types/subscription.ts`
- `src/types/company.ts`
- `src/types/user.ts` (actualizar existente)

### Services (3 archivos)
- `src/services/subscriptionService.ts`
- `src/services/companyService.ts`
- `src/services/userService.ts`

### Components (15 archivos)
- Subscriptions: List, Form, DeleteModal, Card, StatsCard
- Companies: List, Form, DeleteModal, Card, StatusBadge
- Users: List, Form, DeleteModal, Card, RoleBadge

### Pages (4 archivos)
- `src/app/settings/page.tsx` (actualizar)
- `src/app/settings/subscriptions/page.tsx`
- `src/app/settings/companies/page.tsx`
- `src/app/settings/users/page.tsx`

## 🎨 UI/UX Considerations

- **Colores consistentes** con el diseño actual
- **Iconos de Lucide React**
- **Shadcn/ui components**
- **Animaciones suaves**
- **Loading states**
- **Empty states**
- **Error boundaries**

## 🚀 Orden de Implementación

1. ✅ Types & Interfaces
2. ✅ Services
3. ✅ Subscriptions (más simple)
4. ✅ Companies (con lógica de días restantes)
5. ✅ Users (con relación a companies)
6. ✅ Actualizar página de settings
7. ✅ Testing y ajustes

## ⚡ Optimizaciones

- **React Query** para caching (opcional)
- **Debounce** en búsquedas
- **Paginación** en listas largas
- **Lazy loading** de componentes
- **Memoization** de cálculos pesados

## 📝 Notas Importantes

- Mantener consistencia con el patrón de patients/professionals
- Usar los mismos componentes UI (Card, Button, Input, etc.)
- Implementar manejo de errores robusto
- Agregar logs para debugging
- Documentar funciones complejas
