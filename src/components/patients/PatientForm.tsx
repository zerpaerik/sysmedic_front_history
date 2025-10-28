'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientSchema, type PatientFormData } from '@/lib/validations';
import { Patient } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { Loader2, Save, X } from 'lucide-react';

interface PatientFormProps {
  patient?: Patient;
  onSuccess?: (patient: Patient) => void;
  onCancel?: () => void;
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!patient;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      firstName: patient.firstName,
      secondName: patient.secondName || '',
      firstLastName: patient.firstLastname,
      secondLastName: patient.secondLastname || '',
      birthDate: patient.birthDate.split('T')[0], // Format for date input
      civilStatus: patient.maritalStatus,
      educationLevel: patient.educationLevel,
      phone: patient.phone || '',
      email: patient.email || '',
      identificationType: patient.identificationType,
      identificationNumber: patient.identificationNumber,
    } : {
      firstName: '',
      secondName: '',
      firstLastName: '',
      secondLastName: '',
      birthDate: '',
      civilStatus: 'Soltero',
      educationLevel: 'Sin Instrucción',
      phone: '',
      email: '',
      identificationType: 'DNI',
      identificationNumber: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert empty strings to undefined for optional fields and map to backend format
      const cleanData = {
        firstName: data.firstName,
        secondName: data.secondName || undefined,
        firstLastname: data.firstLastName,
        secondLastname: data.secondLastName || undefined,
        birthDate: data.birthDate,
        gender: 'Masculino' as any, // Valor por defecto, podrías agregar un campo en el formulario
        maritalStatus: data.civilStatus as any,
        educationLevel: data.educationLevel as any,
        phone: data.phone || undefined,
        email: data.email || undefined,
        identificationType: data.identificationType as any,
        identificationNumber: data.identificationNumber,
      };

      let result: Patient;
      if (isEditing && patient) {
        result = await patientService.updatePatient(patient.id, cleanData);
      } else {
        result = await patientService.createPatient(cleanData);
      }

      onSuccess?.(result);
      if (!isEditing) {
        reset();
      }
    } catch (err: any) {
      console.error('Error saving patient:', err);
      setError(
        err.response?.data?.message || 
        `Error al ${isEditing ? 'actualizar' : 'crear'} el paciente`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primer Nombre *
              </label>
              <Input
                {...register('firstName')}
                placeholder="Primer nombre"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Nombre
              </label>
              <Input
                {...register('secondName')}
                placeholder="Segundo nombre (opcional)"
              />
              {errors.secondName && (
                <p className="text-red-500 text-sm mt-1">{errors.secondName.message}</p>
              )}
            </div>
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primer Apellido *
              </label>
              <Input
                {...register('firstLastName')}
                placeholder="Primer apellido"
                className={errors.firstLastName ? 'border-red-500' : ''}
              />
              {errors.firstLastName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstLastName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Apellido
              </label>
              <Input
                {...register('secondLastName')}
                placeholder="Segundo apellido (opcional)"
              />
              {errors.secondLastName && (
                <p className="text-red-500 text-sm mt-1">{errors.secondLastName.message}</p>
              )}
            </div>
          </div>

          {/* Identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Identificación *
              </label>
              <select
                {...register('identificationType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DNI">DNI</option>
                <option value="Cédula de Identidad">Cédula de Identidad</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet de Extranjería">Carnet de Extranjería</option>
              </select>
              {errors.identificationType && (
                <p className="text-red-500 text-sm mt-1">{errors.identificationType.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Identificación *
              </label>
              <Input
                {...register('identificationNumber')}
                placeholder="Número de identificación"
                className={errors.identificationNumber ? 'border-red-500' : ''}
              />
              {errors.identificationNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.identificationNumber.message}</p>
              )}
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <Input
              type="date"
              {...register('birthDate')}
              className={errors.birthDate ? 'border-red-500' : ''}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Estado civil y educación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Civil *
              </label>
              <select
                {...register('civilStatus')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Soltero">Soltero(a)</option>
                <option value="Casado">Casado(a)</option>
                <option value="Divorciado">Divorciado(a)</option>
                <option value="Viudo">Viudo(a)</option>
                <option value="Conviviente">Conviviente</option>
              </select>
              {errors.civilStatus && (
                <p className="text-red-500 text-sm mt-1">{errors.civilStatus.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grado de Instrucción *
              </label>
              <select
                {...register('educationLevel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Sin Instrucción">Sin Instrucción</option>
                <option value="Primaria Incompleta">Primaria Incompleta</option>
                <option value="Primaria Completa">Primaria Completa</option>
                <option value="Secundaria Incompleta">Secundaria Incompleta</option>
                <option value="Secundaria Completa">Secundaria Completa</option>
                <option value="Técnica">Técnica</option>
                <option value="Universitaria Incompleta">Universitaria Incompleta</option>
                <option value="Universitaria Completa">Universitaria Completa</option>
                <option value="Postgrado">Postgrado</option>
              </select>
              {errors.educationLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.educationLevel.message}</p>
              )}
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <Input
                {...register('phone')}
                placeholder="Número de teléfono (opcional)"
                type="tel"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                {...register('email')}
                placeholder="Correo electrónico (opcional)"
                type="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Actualizar' : 'Guardar'} Paciente
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
