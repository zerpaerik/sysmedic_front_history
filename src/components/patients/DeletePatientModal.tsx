'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeletePatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePatientModal({ patient, isOpen, onClose, onSuccess }: DeletePatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await patientService.deletePatient(patient.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setError(err.response?.data?.message || 'Error al eliminar el paciente');
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
              className="p-2"
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

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar al paciente?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">
                {patientService.getFullName(patient)}
              </p>
              <p className="text-sm text-gray-600">
                {patientService.getFormattedIdentification(patient)}
              </p>
            </div>
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer. El paciente será marcado como inactivo.
            </p>
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
              className="flex-1 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
