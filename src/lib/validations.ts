import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Patient validation schemas
export const patientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El primer nombre es requerido')
    .min(2, 'El primer nombre debe tener al menos 2 caracteres')
    .max(50, 'El primer nombre no puede exceder 50 caracteres'),
  secondName: z
    .string()
    .max(50, 'El segundo nombre no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  firstLastName: z
    .string()
    .min(1, 'El primer apellido es requerido')
    .min(2, 'El primer apellido debe tener al menos 2 caracteres')
    .max(50, 'El primer apellido no puede exceder 50 caracteres'),
  secondLastName: z
    .string()
    .max(50, 'El segundo apellido no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'La fecha de nacimiento debe ser válida'),
  civilStatus: z.enum(['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Conviviente'], {
    message: 'El estado civil es requerido',
  }),
  educationLevel: z.enum(['Sin Instrucción', 'Primaria Incompleta', 'Primaria Completa', 'Secundaria Incompleta', 'Secundaria Completa', 'Técnica', 'Universitaria Incompleta', 'Universitaria Completa', 'Postgrado'], {
    message: 'El grado de instrucción es requerido',
  }),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Formato de email inválido')
    .optional()
    .or(z.literal('')),
  identificationType: z.enum(['DNI', 'Cédula de Identidad', 'Pasaporte', 'Carnet de Extranjería'], {
    message: 'El tipo de identificación es requerido',
  }),
  identificationNumber: z
    .string()
    .min(1, 'El número de identificación es requerido')
    .min(6, 'El número de identificación debe tener al menos 6 caracteres')
    .max(20, 'El número de identificación no puede exceder 20 caracteres'),
});

export const updatePatientSchema = patientSchema.partial().extend({
  id: z.string().min(1, 'El ID del paciente es requerido'),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;
