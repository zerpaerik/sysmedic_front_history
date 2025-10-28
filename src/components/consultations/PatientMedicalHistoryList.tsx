'use client';

import React from 'react';
import { 
  Calendar, 
  User, 
  Stethoscope, 
  Activity, 
  CheckCircle, 
  Eye,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalRecord, MedicalRecordStatus } from '@/types/medicalRecord';

interface PatientMedicalHistoryListProps {
  medicalRecords: MedicalRecord[];
  onViewRecord: (record: MedicalRecord) => void;
}

const PatientMedicalHistoryList: React.FC<PatientMedicalHistoryListProps> = ({
  medicalRecords,
  onViewRecord
}) => {
  const getStatusBadge = (status: MedicalRecordStatus) => {
    const statusConfig = {
      [MedicalRecordStatus.PENDING]: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      [MedicalRecordStatus.IN_PROGRESS]: { label: 'En Proceso', className: 'bg-blue-100 text-blue-800' },
      [MedicalRecordStatus.COMPLETED]: { label: 'Completada', className: 'bg-green-100 text-green-800' },
      [MedicalRecordStatus.CANCELLED]: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const hasTriageData = (medicalRecord: MedicalRecord): boolean => {
    return !!(medicalRecord.triage && (
      medicalRecord.triage.weight ||
      medicalRecord.triage.height ||
      medicalRecord.triage.bloodPressure ||
      medicalRecord.triage.oxygenSaturation ||
      medicalRecord.triage.heartRate ||
      medicalRecord.triage.temperature ||
      medicalRecord.triage.observations
    ));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (medicalRecords.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay historias clínicas
        </h3>
        <p className="text-gray-600">
          Este paciente no tiene historias clínicas registradas.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Historial Médico ({medicalRecords.length} registro{medicalRecords.length !== 1 ? 's' : ''})
        </h2>
      </div>

      <div className="grid gap-4">
        {medicalRecords.map((medicalRecord) => (
          <Card key={medicalRecord.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Información Principal */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      HC-{medicalRecord.recordNumber}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {medicalRecord.specialty.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Dr. {medicalRecord.professional.firstName} {medicalRecord.professional.firstLastname}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(medicalRecord.status)}
                    {hasTriageData(medicalRecord) ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Con Triaje
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Sin Triaje
                      </span>
                    )}
                  </div>
                </div>

                {/* Información de Fecha */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {medicalRecord.appointmentDate ? (
                      <>
                        {formatDate(medicalRecord.appointmentDate)}
                      </>
                    ) : (
                      'Fecha no especificada'
                    )}
                  </span>
                </div>

                {/* Información de Triaje - Compacta */}
                {hasTriageData(medicalRecord) && medicalRecord.triage && (
                  <div className="bg-green-50 p-2 rounded-md mb-2">
                    <div className="grid grid-cols-4 gap-2 text-xs text-green-800">
                      {medicalRecord.triage.weight && (
                        <span>Peso: {medicalRecord.triage.weight}</span>
                      )}
                      {medicalRecord.triage.height && (
                        <span>Talla: {medicalRecord.triage.height}</span>
                      )}
                      {medicalRecord.triage.bloodPressure && (
                        <span>TA: {medicalRecord.triage.bloodPressure}</span>
                      )}
                      {medicalRecord.triage.oxygenSaturation && (
                        <span>Sat: {medicalRecord.triage.oxygenSaturation}%</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Información Adicional */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    Creado: {formatDate(medicalRecord.createdAt)}
                  </span>
                </div>
              </div>

              {/* Botón Ver */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  onClick={() => onViewRecord(medicalRecord)}
                  size="sm"
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver Detalle
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientMedicalHistoryList;
