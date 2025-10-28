'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { MedicalHistoryService } from '@/services/medicalHistoryService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { CompletionStatus } from '@/types/medicalHistory';
import { MedicalRecord } from '@/types/medicalRecord';

interface CompletionStatusFormProps {
  medicalRecord: MedicalRecord;
  onSave: () => void;
  onCancel: () => void;
}

export default function CompletionStatusForm({ 
  medicalRecord, 
  onSave, 
  onCancel 
}: CompletionStatusFormProps) {
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);

  useEffect(() => {
    loadCompletionStatus();
  }, [medicalRecord.id]);

  const loadCompletionStatus = async () => {
    try {
      setLoading(true);
      const status = await MedicalHistoryService.getCompletionStatus(medicalRecord.id);
      setCompletionStatus(status);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log('No hay estado de completitud disponible aún');
      } else {
        console.error('Error loading completion status:', error);
        toast.error('Error al cargar el estado de completitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!completionStatus?.canFinalize) {
      toast.error('No se puede finalizar la historia clínica. Faltan secciones por completar.');
      return;
    }

    setFinalizing(true);
    try {
      await MedicalHistoryService.finalizeRecord(medicalRecord.id);
      toast.success('Historia clínica finalizada correctamente');
      onSave();
    } catch (error) {
      console.error('Error finalizing medical record:', error);
      toast.error('Error al finalizar la historia clínica');
    } finally {
      setFinalizing(false);
    }
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (completed: boolean) => {
    return completed ? 'Completado' : 'Pendiente';
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? 'text-green-600' : 'text-red-500';
  };

  const getTotalSections = () => {
    return 4; // Datos básicos, triaje, antecedentes médicos, historia por especialidad
  };

  const getCompletedCount = (status: CompletionStatus) => {
    let count = 1; // Datos básicos siempre están completos
    if (status.hasTriage) count++;
    if (status.hasMedicalHistoryBase) count++;
    if (status.hasSpecialtyHistory) count++;
    return count;
  };

  const getCompletionPercentage = (status: CompletionStatus) => {
    const completed = getCompletedCount(status);
    const total = getTotalSections();
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Completitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Clock className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Cargando estado...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Completitud de Historia Clínica</CardTitle>
          <p className="text-sm text-gray-600">
            Paciente: {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname} - 
            Registro: {medicalRecord.recordNumber}
          </p>
        </CardHeader>
        <CardContent>
          {completionStatus ? (
            <div className="space-y-6">
              {/* Resumen General */}
              <Card className={`border-2 ${completionStatus.canFinalize ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {completionStatus.canFinalize ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">
                          {completionStatus.canFinalize ? 'Lista para Finalizar' : 'Incomplete'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {completionStatus.canFinalize 
                            ? 'Todas las secciones requeridas están completas'
                            : 'Faltan secciones por completar'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {getCompletionPercentage(completionStatus)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCompletedCount(completionStatus)} de {getTotalSections()} secciones
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de Progreso */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          completionStatus.canFinalize ? 'bg-green-600' : 'bg-yellow-500'
                        }`}
                        style={{ 
                          width: `${getCompletionPercentage(completionStatus)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalle por Sección */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Datos Básicos */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      {getStatusIcon(true)}
                      <span>Datos Básicos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm font-medium ${getStatusColor(true)}`}>
                      {getStatusText(true)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Información del paciente y registro inicial
                    </p>
                  </CardContent>
                </Card>

                {/* Triaje */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      {getStatusIcon(completionStatus.hasTriage)}
                      <span>Triaje</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm font-medium ${getStatusColor(completionStatus.hasTriage)}`}>
                      {getStatusText(completionStatus.hasTriage)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Signos vitales y evaluación inicial
                    </p>
                  </CardContent>
                </Card>

                {/* Antecedentes Médicos */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      {getStatusIcon(completionStatus.hasMedicalHistoryBase)}
                      <span>Antecedentes Médicos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm font-medium ${getStatusColor(completionStatus.hasMedicalHistoryBase)}`}>
                      {getStatusText(completionStatus.hasMedicalHistoryBase)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Historia médica personal y familiar
                    </p>
                  </CardContent>
                </Card>

                {/* Historia por Especialidad */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      {getStatusIcon(completionStatus.hasSpecialtyHistory)}
                      <span>Historia por Especialidad</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm font-medium ${getStatusColor(completionStatus.hasSpecialtyHistory)}`}>
                      {getStatusText(completionStatus.hasSpecialtyHistory)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Evaluación específica de {medicalRecord.specialty?.name}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Información Adicional */}
              {completionStatus.missingSteps && completionStatus.missingSteps.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base text-red-800 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Pasos Faltantes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {completionStatus.missingSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={finalizing}
                >
                  Volver
                </Button>
                
                <Button
                  type="button"
                  onClick={handleFinalize}
                  disabled={!completionStatus.canFinalize || finalizing}
                  className={`${
                    completionStatus.canFinalize 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {finalizing ? 'Finalizando...' : 'Finalizar Historia Clínica'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se pudo cargar el estado de completitud
              </h3>
              <p className="text-gray-500 mb-4">
                Asegúrate de que la historia clínica tenga datos básicos registrados.
              </p>
              <Button onClick={loadCompletionStatus} variant="outline">
                Intentar de Nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
