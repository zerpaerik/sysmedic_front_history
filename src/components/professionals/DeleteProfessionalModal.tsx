'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Professional } from '@/types/professional';
import { professionalService } from '@/services/professionalService';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteProfessionalModalProps {
  professional: Professional;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProfessionalModal({ 
  professional, 
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteProfessionalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await professionalService.deleteProfessional(professional.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting professional:', error);
      setError('Error al eliminar el profesional. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Eliminación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Está seguro que desea eliminar al profesional{' '}
              <strong>
                {professional.firstName} {professional.firstLastname}
              </strong>
              ?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Información del profesional:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Identificación: {professional.identificationNumber}</li>
                    <li>• Licencia: {professional.licenseNumber}</li>
                    <li>• Email: {professional.email}</li>
                    {professional.specialties && professional.specialties.length > 0 && (
                      <li>• Especialidades: {professional.specialties.map(s => s.name).join(', ')}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">¡Atención!</p>
                  <p>Esta acción realizará una eliminación lógica. El profesional será marcado como inactivo pero sus datos se conservarán en el sistema.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
