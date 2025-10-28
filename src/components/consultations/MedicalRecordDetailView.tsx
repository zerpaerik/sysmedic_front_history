'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Stethoscope, 
  Activity, 
  FileText, 
  Heart, 
  Thermometer,
  Weight,
  Ruler,
  Droplets,
  Clock,
  CheckCircle,
  AlertCircle,
  Pill,
  Users,
  Scissors,
  History,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MedicalRecord, MedicalRecordStatus } from '@/types/medicalRecord';
import { Patient } from '@/types/patient';
import { medicalRecordService } from '@/services/medicalRecordService';
import { pdfService } from '@/services/pdfService';
import { toast } from 'sonner';

interface MedicalRecordDetailViewProps {
  medicalRecord: MedicalRecord;
  patient: Patient | null;
  onBack: () => void;
}

const MedicalRecordDetailView: React.FC<MedicalRecordDetailViewProps> = ({
  medicalRecord,
  patient,
  onBack
}) => {
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [specialtyHistory, setSpecialtyHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    loadDetailedData();
  }, [medicalRecord.id]);

  const loadDetailedData = async () => {
    setLoading(true);
    try {
      // Cargar historial base (antecedentes médicos)
      try {
        const historyData = await medicalRecordService.getMedicalHistory(medicalRecord.id);
        setMedicalHistory(historyData);
      } catch (error) {
        console.log('No medical history found');
      }

      // Cargar historia clínica por especialidad
      try {
        const specialtyData = await medicalRecordService.getSpecialtyMedicalHistory(medicalRecord.id);
        setSpecialtyHistory(specialtyData);
      } catch (error) {
        console.log('No specialty history found');
      }
    } catch (error) {
      console.error('Error loading detailed data:', error);
      toast.error('Error al cargar los detalles de la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPdf(true);
    try {
      await pdfService.generateMedicalRecordPDF(
        medicalRecord,
        patient,
        medicalHistory,
        specialtyHistory
      );
      toast.success('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getStatusBadge = (status: MedicalRecordStatus) => {
    const statusConfig = {
      [MedicalRecordStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const },
      [MedicalRecordStatus.IN_PROGRESS]: { label: 'En Proceso', variant: 'default' as const },
      [MedicalRecordStatus.COMPLETED]: { label: 'Completada', variant: 'default' as const },
      [MedicalRecordStatus.CANCELLED]: { label: 'Cancelada', variant: 'destructive' as const },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Listado
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historia Clínica HC-{medicalRecord.recordNumber}
            </h1>
            <p className="text-gray-600">
              Detalle completo de la historia clínica
            </p>
          </div>
        </div>
        
        {/* Botón Generar PDF */}
        <Button 
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
        >
          <Download className="w-4 h-4" />
          {generatingPdf ? 'Generando PDF...' : 'Generar PDF'}
        </Button>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Paciente</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {patient ? (
                  <span>
                    {patient.firstName} {patient.secondName} {patient.firstLastname} {patient.secondLastname}
                  </span>
                ) : (
                  <span>
                    {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                DNI: {patient?.identificationNumber || medicalRecord.patient.identificationNumber}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Especialidad y Profesional</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Stethoscope className="w-4 h-4" />
                  <span>{medicalRecord.specialty.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Dr. {medicalRecord.professional.firstName} {medicalRecord.professional.firstLastname}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fecha y Hora</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {medicalRecord.appointmentDate ? (
                    formatDate(medicalRecord.appointmentDate)
                  ) : (
                    'Fecha no especificada'
                  )}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Estado</h4>
              <div className="flex items-center gap-2">
                {getStatusBadge(medicalRecord.status)}
                {hasTriageData(medicalRecord) && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Con Triaje
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Triaje */}
      {hasTriageData(medicalRecord) && medicalRecord.triage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Triaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {medicalRecord.triage.weight && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Weight className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Peso</p>
                    <p className="font-medium">{medicalRecord.triage.weight} kg</p>
                  </div>
                </div>
              )}

              {medicalRecord.triage.height && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Ruler className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Talla</p>
                    <p className="font-medium">{medicalRecord.triage.height} cm</p>
                  </div>
                </div>
              )}

              {medicalRecord.triage.bloodPressure && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Heart className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600">Presión Arterial</p>
                    <p className="font-medium">{medicalRecord.triage.bloodPressure}</p>
                  </div>
                </div>
              )}

              {medicalRecord.triage.oxygenSaturation && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Droplets className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Saturación O₂</p>
                    <p className="font-medium">{medicalRecord.triage.oxygenSaturation}%</p>
                  </div>
                </div>
              )}

              {medicalRecord.triage.heartRate && (
                <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-4 h-4 text-pink-600" />
                  <div>
                    <p className="text-xs text-gray-600">Frecuencia Cardíaca</p>
                    <p className="font-medium">{medicalRecord.triage.heartRate} lpm</p>
                  </div>
                </div>
              )}

              {medicalRecord.triage.temperature && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Thermometer className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Temperatura</p>
                    <p className="font-medium">{medicalRecord.triage.temperature}°C</p>
                  </div>
                </div>
              )}
            </div>

            {medicalRecord.triage.observations && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Observaciones</h5>
                <p className="text-sm text-gray-700">{medicalRecord.triage.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Antecedentes Médicos */}
      {medicalHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Antecedentes Médicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalHistory.personalHistory && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Antecedentes Personales
                </h5>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {medicalHistory.personalHistory}
                </p>
              </div>
            )}

            {medicalHistory.surgicalHistory && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Antecedentes Quirúrgicos
                </h5>
                <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg">
                  {medicalHistory.surgicalHistory}
                </p>
              </div>
            )}

            {medicalHistory.medications && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medicamentos
                </h5>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                  {medicalHistory.medications}
                </p>
              </div>
            )}

            {medicalHistory.familyHistory && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Antecedentes Familiares
                </h5>
                <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                  {medicalHistory.familyHistory}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historia Clínica por Especialidad */}
      {specialtyHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Historia Clínica - {medicalRecord.specialty.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {specialtyHistory.chiefComplaint && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Motivo de Consulta</h5>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                  {specialtyHistory.chiefComplaint}
                </p>
              </div>
            )}

            {specialtyHistory.currentIllness && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Enfermedad Actual</h5>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {specialtyHistory.currentIllness}
                </p>
              </div>
            )}

            {specialtyHistory.systemsReview && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Revisión por Sistemas</h5>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                  {specialtyHistory.systemsReview}
                </p>
              </div>
            )}

            {specialtyHistory.generalPhysicalExam && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Examen Físico General</h5>
                <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                  {specialtyHistory.generalPhysicalExam}
                </p>
              </div>
            )}

            {specialtyHistory.diagnoses && Array.isArray(specialtyHistory.diagnoses) && specialtyHistory.diagnoses.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Diagnósticos</h5>
                <div className="space-y-2">
                  {specialtyHistory.diagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {diagnosis.type || 'Diagnóstico'}
                        </Badge>
                        <Badge variant={diagnosis.certainty === 'definitivo' ? 'default' : 'secondary'}>
                          {diagnosis.certainty || 'Sin especificar'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{diagnosis.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {specialtyHistory.treatmentPlan && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Plan de Tratamiento</h5>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                  {specialtyHistory.treatmentPlan}
                </p>
              </div>
            )}

            {specialtyHistory.observations && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Observaciones</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {specialtyHistory.observations}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Información de Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Creado:</strong> {formatDate(medicalRecord.createdAt)}</p>
            </div>
            <div>
              <p><strong>Última actualización:</strong> {formatDate(medicalRecord.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecordDetailView;
