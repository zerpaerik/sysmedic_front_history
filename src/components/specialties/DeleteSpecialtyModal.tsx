'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Specialty } from '@/types/specialty';
import { specialtyService } from '@/services/specialtyService';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteSpecialtyModalProps {
  specialty: Specialty;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteSpecialtyModal({ specialty, isOpen, onClose, onSuccess }: DeleteSpecialtyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await specialtyService.deleteSpecialty(specialty.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting specialty:', err);
      setError(err.response?.data?.message || 'Error al eliminar la especialidad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Eliminación
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar la siguiente especialidad?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{specialty.name}</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {specialty.code}
                </span>
              </div>
              {specialty.department && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Departamento:</strong> {specialty.department}
                </p>
              )}
              {specialty.description && (
                <p className="text-sm text-gray-600">
                  {specialty.description}
                </p>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
                La especialidad será eliminada permanentemente del sistema.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
