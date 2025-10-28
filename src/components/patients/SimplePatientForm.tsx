'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Patient, 
  CreatePatientDto, 
  IdentificationType, 
  MaritalStatus, 
  EducationLevel, 
  Gender 
} from '@/types/patient';
import { patientService } from '@/services/patientService';
import { Loader2, Save, X } from 'lucide-react';

interface SimplePatientFormProps {
  patient?: Patient;
  onSuccess?: (patient: Patient) => void;
  onCancel?: () => void;
}

export function SimplePatientForm({ patient, onSuccess, onCancel }: SimplePatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    secondName: patient?.secondName || '',
    firstLastname: patient?.firstLastname || '',
    secondLastname: patient?.secondLastname || '',
    birthDate: patient?.birthDate ? patient.birthDate.split('T')[0] : '',
    gender: patient?.gender || Gender.MASCULINO,
    maritalStatus: patient?.maritalStatus || MaritalStatus.SOLTERO,
    educationLevel: patient?.educationLevel || EducationLevel.SECUNDARIA_COMPLETA,
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    identificationType: patient?.identificationType || IdentificationType.DNI,
    identificationNumber: patient?.identificationNumber || '',
    bloodType: patient?.bloodType || '',
    allergies: patient?.allergies || '',
    observations: patient?.observations || '',
  });

  const isEditing = !!patient;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      // Basic validation
      if (!formData.firstName || !formData.firstLastname || !formData.birthDate || !formData.identificationNumber) {
        setError('Por favor complete los campos obligatorios');
        return;
      }

      // Preparar datos exactamente como espera el backend
      const cleanData: CreatePatientDto = {
        // Campos requeridos
        firstName: formData.firstName.trim(),
        firstLastname: formData.firstLastname.trim(),
        birthDate: formData.birthDate,
        identificationType: formData.identificationType as IdentificationType,
        identificationNumber: formData.identificationNumber.trim(),
        gender: formData.gender as Gender,
        maritalStatus: formData.maritalStatus as MaritalStatus,
        educationLevel: formData.educationLevel as EducationLevel,
      };
      
      // Agregar campos opcionales solo si tienen valor
      if (formData.secondName?.trim()) {
        cleanData.secondName = formData.secondName.trim();
      }
      if (formData.secondLastname?.trim()) {
        cleanData.secondLastname = formData.secondLastname.trim();
      }
      if (formData.phone?.trim()) {
        cleanData.phone = formData.phone.trim();
      }
      if (formData.email?.trim()) {
        cleanData.email = formData.email.trim();
      }
      if (formData.address?.trim()) {
        cleanData.address = formData.address.trim();
      }
      if (formData.bloodType?.trim()) {
        cleanData.bloodType = formData.bloodType.trim();
      }
      if (formData.allergies?.trim()) {
        cleanData.allergies = formData.allergies.trim();
      }
      if (formData.observations?.trim()) {
        cleanData.observations = formData.observations.trim();
      }

      let result: Patient;
      
      if (isEditing && patient) {
        result = await patientService.updatePatient(patient.id, cleanData);
      } else {
        result = await patientService.createPatient(cleanData);
      }

      onSuccess?.(result);
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
        <CardTitle>
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Primer nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Nombre
              </label>
              <Input
                name="secondName"
                value={formData.secondName}
                onChange={handleChange}
                placeholder="Segundo nombre (opcional)"
              />
            </div>
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primer Apellido *
              </label>
              <Input
                name="firstLastname"
                value={formData.firstLastname}
                onChange={handleChange}
                placeholder="Primer apellido"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Apellido
              </label>
              <Input
                name="secondLastname"
                value={formData.secondLastname}
                onChange={handleChange}
                placeholder="Segundo apellido (opcional)"
              />
            </div>
          </div>

          {/* Identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Identificación *
              </label>
              <select
                name="identificationType"
                value={formData.identificationType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={IdentificationType.DNI}>DNI</option>
                <option value={IdentificationType.CEDULA_IDENTIDAD}>Cédula de Identidad</option>
                <option value={IdentificationType.PASAPORTE}>Pasaporte</option>
                <option value={IdentificationType.CARNET_EXTRANJERIA}>Carnet de Extranjería</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Identificación *
              </label>
              <Input
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                placeholder="Número de identificación"
                required
              />
            </div>
          </div>

          {/* Fecha de nacimiento y género */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <Input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={Gender.MASCULINO}>Masculino</option>
                <option value={Gender.FEMENINO}>Femenino</option>
                <option value={Gender.OTRO}>Otro</option>
              </select>
            </div>
          </div>

          {/* Estado civil y educación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Civil
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={MaritalStatus.SOLTERO}>Soltero</option>
                <option value={MaritalStatus.CASADO}>Casado</option>
                <option value={MaritalStatus.DIVORCIADO}>Divorciado</option>
                <option value={MaritalStatus.VIUDO}>Viudo</option>
                <option value={MaritalStatus.CONVIVIENTE}>Conviviente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel Educativo
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={EducationLevel.SIN_INSTRUCCION}>Sin Instrucción</option>
                <option value={EducationLevel.PRIMARIA_INCOMPLETA}>Primaria Incompleta</option>
                <option value={EducationLevel.PRIMARIA_COMPLETA}>Primaria Completa</option>
                <option value={EducationLevel.SECUNDARIA_INCOMPLETA}>Secundaria Incompleta</option>
                <option value={EducationLevel.SECUNDARIA_COMPLETA}>Secundaria Completa</option>
                <option value={EducationLevel.TECNICA}>Técnica</option>
                <option value={EducationLevel.UNIVERSITARIA_INCOMPLETA}>Universitaria Incompleta</option>
                <option value={EducationLevel.UNIVERSITARIA_COMPLETA}>Universitaria Completa</option>
                <option value={EducationLevel.POSTGRADO}>Postgrado</option>
              </select>
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Número de teléfono"
                type="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                type="email"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección completa"
            />
          </div>

          {/* Información médica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sangre
              </label>
              <Input
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                placeholder="Ej: O+, A-, B+, AB-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alergias
              </label>
              <Input
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Alergias conocidas"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Observaciones adicionales"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
