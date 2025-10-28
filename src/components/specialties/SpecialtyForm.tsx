'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Specialty, 
  CreateSpecialtyDto 
} from '@/types/specialty';
import { specialtyService } from '@/services/specialtyService';
import { Loader2, Save, X } from 'lucide-react';

interface SpecialtyFormProps {
  specialty?: Specialty;
  onSuccess?: (specialty: Specialty) => void;
  onCancel?: () => void;
}

export function SpecialtyForm({ specialty, onSuccess, onCancel }: SpecialtyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: specialty?.name || '',
    code: specialty?.code || '',
    description: specialty?.description || '',
    department: specialty?.department || '',
  });

  const isEditing = !!specialty;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.name.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.code.trim()) {
        setError('El código es requerido');
        return;
      }

      // Preparar datos exactamente como espera el backend
      const cleanData: CreateSpecialtyDto = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      };
      
      // Agregar campos opcionales solo si tienen valor
      if (formData.description?.trim()) {
        cleanData.description = formData.description.trim();
      }
      if (formData.department?.trim()) {
        cleanData.department = formData.department.trim();
      }

      let result: Specialty;
      
      if (isEditing && specialty) {
        result = await specialtyService.updateSpecialty(specialty.id, cleanData);
      } else {
        result = await specialtyService.createSpecialty(cleanData);
      }

      onSuccess?.(result);
    } catch (err: any) {
      console.error('Error saving specialty:', err);
      setError(
        err.response?.data?.message || 
        `Error al ${isEditing ? 'actualizar' : 'crear'} la especialidad`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Nombre y Código */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Cardiología"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ej: CARD"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <Input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Ej: Medicina Interna"
              maxLength={50}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de la especialidad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'} Especialidad
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
