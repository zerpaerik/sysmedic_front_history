# 📊 VISUALIZACIÓN DE SUSCRIPCIÓN EN HEADER

## ✅ IMPLEMENTADO

Se ha agregado la visualización de la suscripción activa y días restantes en el header de la aplicación para todos los usuarios.

---

## 🎯 OBJETIVO

Mostrar en tiempo real la información de la suscripción de la empresa del usuario, incluyendo:
- Nombre del plan de suscripción
- Días restantes
- Alertas visuales según el estado

---

## 📋 CAMBIOS REALIZADOS

### Archivo Modificado
**`src/components/layout/DashboardLayout.tsx`**

### 1. Imports Agregados
```typescript
import { userService } from '@/services/userService';
import { User as UserType } from '@/types/user';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
```

### 2. Estado Agregado
```typescript
const [userDetails, setUserDetails] = useState<UserType | null>(null);
```

### 3. Carga de Datos del Usuario
```typescript
// Cargar detalles completos del usuario con empresa y suscripción
try {
  const fullUserData = await userService.getUserById(userData.id);
  setUserDetails(fullUserData);
} catch (error) {
  console.error('Error loading user details:', error);
}
```

### 4. Función de Colores
```typescript
const getStatusColor = (daysRemaining: number) => {
  if (daysRemaining === 0) return 'bg-red-100 text-red-800 border-red-200';
  if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};
```

---

## 🎨 DISEÑO VISUAL

### Componentes en el Header

#### 1. Card de Suscripción (Azul)
```
┌─────────────────────────┐
│ 💳 Suscripción          │
│    Plan Premium         │
└─────────────────────────┘
```
- Fondo azul claro
- Icono de tarjeta de crédito
- Nombre del plan

#### 2. Card de Días Restantes (Colores Dinámicos)
```
┌─────────────────────────┐
│ 📅 Días restantes       │
│    15 días              │
└─────────────────────────┘
```
- Color según días restantes:
  - 🟢 Verde: > 30 días
  - 🟡 Amarillo: ≤ 30 días
  - 🟠 Naranja: ≤ 7 días
  - 🔴 Rojo: 0 días (vencida)

#### 3. Alerta Visual (Condicional)
- **Por vencer** (≤ 7 días): ⚠️ "¡Por vencer!" (naranja)
- **Vencida** (0 días): ⚠️ "¡Vencida!" (rojo)

---

## 📊 ESTADOS VISUALES

### Estado 1: Suscripción Activa (> 30 días)
```
Header:
[Logo] Sistema de Gestión Médica          [💳 Plan Premium] [📅 45 días] 🟢          [Usuario]
       Bienvenido, Juan Pérez
```

### Estado 2: Por Vencer (≤ 30 días)
```
Header:
[Logo] Sistema de Gestión Médica          [💳 Plan Premium] [📅 25 días] 🟡          [Usuario]
       Bienvenido, Juan Pérez
```

### Estado 3: Crítico (≤ 7 días)
```
Header:
[Logo] Sistema de Gestión Médica          [💳 Plan Premium] [📅 5 días] 🟠 ⚠️ ¡Por vencer!          [Usuario]
       Bienvenido, Juan Pérez
```

### Estado 4: Vencida (0 días)
```
Header:
[Logo] Sistema de Gestión Médica          [💳 Plan Premium] [📅 0 días] 🔴 ⚠️ ¡Vencida!          [Usuario]
       Bienvenido, Juan Pérez
```

### Estado 5: Sin Suscripción
```
Header:
[Logo] Sistema de Gestión Médica                                                    [Usuario]
       Bienvenido, Juan Pérez                                                       Sin suscripción
```

---

## 🔄 FLUJO DE DATOS

```
Usuario inicia sesión
        ↓
DashboardLayout carga
        ↓
Obtiene userData de authService
        ↓
Llama a userService.getUserById(id)
        ↓
Backend retorna User con Company y Subscription
        ↓
Calcula días restantes (backend)
        ↓
Frontend muestra en header con colores
        ↓
Usuario ve su suscripción en tiempo real
```

---

## 🎯 CASOS DE USO

### Caso 1: Usuario con Empresa y Suscripción
**Condición:** Usuario tiene `companyId` y la empresa tiene suscripción activa

**Resultado:**
- ✅ Muestra card de suscripción
- ✅ Muestra días restantes con color
- ✅ Muestra alerta si aplica

### Caso 2: Usuario con Empresa sin Suscripción
**Condición:** Usuario tiene `companyId` pero la empresa no tiene suscripción

**Resultado:**
- ❌ No muestra cards de suscripción
- ✅ Muestra "Sin suscripción" bajo el nombre del usuario

### Caso 3: Usuario sin Empresa
**Condición:** Usuario no tiene `companyId`

**Resultado:**
- ❌ No muestra información de suscripción
- ✅ Solo muestra información básica del usuario

### Caso 4: Usuario ADMIN
**Condición:** Usuario con rol `admin`

**Resultado:**
- ✅ Muestra suscripción si tiene empresa
- ✅ Puede gestionar suscripciones desde `/settings`

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 1024px)
```
[Logo + Título]  [Suscripción] [Días] [Alerta]  [Usuario]
```

### Tablet (768px - 1024px)
```
[Logo + Título]  [Suscripción] [Días]  [Usuario]
                                [Alerta]
```

### Mobile (< 768px)
```
[Logo + Título]              [Usuario]
[Suscripción]
[Días] [Alerta]
```

---

## 🎨 COLORES Y ESTILOS

### Card de Suscripción
```css
background: bg-blue-50
border: border-blue-200
text: text-blue-600 (label), text-blue-900 (value)
```

### Card de Días Restantes

**Verde (> 30 días):**
```css
background: bg-green-100
border: border-green-200
text: text-green-800
```

**Amarillo (≤ 30 días):**
```css
background: bg-yellow-100
border: border-yellow-200
text: text-yellow-800
```

**Naranja (≤ 7 días):**
```css
background: bg-orange-100
border: border-orange-200
text: text-orange-800
```

**Rojo (0 días):**
```css
background: bg-red-100
border: border-red-200
text: text-red-800
```

---

## 🔔 ALERTAS VISUALES

### Alerta "Por Vencer"
- **Condición:** `daysRemaining <= 7 && daysRemaining > 0`
- **Color:** Naranja
- **Icono:** AlertCircle
- **Texto:** "¡Por vencer!"

### Alerta "Vencida"
- **Condición:** `daysRemaining === 0`
- **Color:** Rojo
- **Icono:** AlertCircle
- **Texto:** "¡Vencida!"

---

## 🧪 TESTING

### Test 1: Usuario con Suscripción Activa
1. Login con usuario que tiene empresa y suscripción
2. Verificar que aparecen los 2 cards
3. Verificar color según días restantes
4. Verificar que no hay alerta si > 7 días

### Test 2: Usuario con Suscripción por Vencer
1. Login con usuario cuya empresa tiene ≤ 7 días
2. Verificar card naranja
3. Verificar alerta "¡Por vencer!"

### Test 3: Usuario con Suscripción Vencida
1. Login con usuario cuya empresa tiene 0 días
2. Verificar card rojo
3. Verificar alerta "¡Vencida!"

### Test 4: Usuario sin Suscripción
1. Login con usuario sin empresa o empresa sin suscripción
2. Verificar que no aparecen cards
3. Verificar texto "Sin suscripción" bajo nombre

---

## 🚀 BENEFICIOS

### Para Usuarios
- ✅ **Visibilidad inmediata** del estado de suscripción
- ✅ **Alertas tempranas** antes de vencimiento
- ✅ **Información siempre visible** en todas las páginas
- ✅ **Colores intuitivos** para identificar estado

### Para Administradores
- ✅ **Monitoreo visual** del estado de clientes
- ✅ **Identificación rápida** de suscripciones por vencer
- ✅ **Gestión proactiva** de renovaciones

### Para el Negocio
- ✅ **Reducción de cancelaciones** por olvido
- ✅ **Mejora en renovaciones** con alertas tempranas
- ✅ **Transparencia** con los clientes

---

## 📝 CÓDIGO COMPLETO

### Estructura del Header
```tsx
<header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
  <div className="flex items-center justify-between">
    {/* Logo y Título */}
    <div className="flex-1">
      <h1>Sistema de Gestión Médica</h1>
      <p>Bienvenido, {user.firstName} {user.lastName}</p>
    </div>

    {/* Subscription Info */}
    {hasSubscription && company?.subscription && (
      <div className="flex items-center gap-3 mr-6">
        {/* Card de Suscripción */}
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <CreditCard />
          <p>Suscripción</p>
          <p>{company.subscription.name}</p>
        </div>

        {/* Card de Días Restantes */}
        <div className={getStatusColor(company.daysRemaining)}>
          <Calendar />
          <p>Días restantes</p>
          <p>{company.daysRemaining} días</p>
        </div>

        {/* Alertas */}
        {company.daysRemaining <= 7 && company.daysRemaining > 0 && (
          <div className="text-orange-600">
            <AlertCircle />
            <span>¡Por vencer!</span>
          </div>
        )}
      </div>
    )}

    {/* User Info */}
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p>{user.firstName} {user.lastName}</p>
        <p>{user.role}</p>
      </div>
      <div className="w-10 h-10 bg-blue-600 rounded-full">
        <span>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
      </div>
    </div>
  </div>
</header>
```

---

## 🎉 RESULTADO FINAL

**Funcionalidad completamente implementada:**
- ✅ Visualización de suscripción en header
- ✅ Días restantes con colores dinámicos
- ✅ Alertas visuales automáticas
- ✅ Responsive design
- ✅ Manejo de todos los casos (con/sin suscripción)
- ✅ Integración completa con backend

**Visible en todas las páginas del sistema para todos los usuarios que tengan empresa con suscripción activa.**
