'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { AIAssistant } from './AIAssistant';
import { AudioRecorder } from '../transcription/AudioRecorder';
import { Bot, Mic } from 'lucide-react';
import { MedicalHistoryService } from '@/services/medicalHistoryService';
import { 
  SpecialtyHistoryType, 
  CreateSpecialtyMedicalHistoryDto, 
  SpecialtyMedicalHistory 
} from '@/types/medicalHistory';
import { MedicalRecord } from '@/types/medicalRecord';

const specialtyMedicalHistorySchema = z.object({
  specialtyType: z.string(),
  chiefComplaint: z.string().min(1, 'El motivo de consulta es obligatorio'),
  currentIllness: z.string().min(1, 'La enfermedad actual es obligatoria'),
  systemsReview: z.string().optional(),
  generalPhysicalExam: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.any().optional(),
  respiratoryRate: z.any().optional(),
  temperature: z.any().optional(),
  oxygenSaturation: z.any().optional(),
  weight: z.any().optional(),
  height: z.any().optional(),
  bmi: z.any().optional(),
  // Campos específicos por especialidad
  generalMedicine: z.string().optional(),
  dermatology: z.string().optional(),
  pediatrics: z.string().optional(),
  urology: z.string().optional(),
  obstetrics: z.string().optional(),
  traumatology: z.string().optional(),
  internalMedicine: z.string().optional(),
  // Diagnósticos
  primaryDiagnosis: z.string().optional(),
  secondaryDiagnosis: z.string().optional(),
  differentialDiagnosis: z.string().optional(),
  // Plan de tratamiento
  medications: z.string().optional(),
  nonPharmacological: z.string().optional(),
  followUp: z.string().optional(),
  referrals: z.string().optional(),
  observations: z.string().optional(),
});

type SpecialtyMedicalHistoryFormData = z.infer<typeof specialtyMedicalHistorySchema>;

interface SpecialtyMedicalHistoryFormProps {
  medicalRecord: MedicalRecord;
  onSave: () => void;
  onCancel: () => void;
}

export default function SpecialtyMedicalHistoryForm({ 
  medicalRecord, 
  onSave, 
  onCancel 
}: SpecialtyMedicalHistoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<SpecialtyMedicalHistory | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors }
  } = useForm<SpecialtyMedicalHistoryFormData>({
    resolver: zodResolver(specialtyMedicalHistorySchema),
    defaultValues: {
      specialtyType: getSpecialtyTypeFromRecord(medicalRecord),
    }
  });

  const specialtyType = getSpecialtyTypeFromRecord(medicalRecord);
  console.log('🎯 Assigned specialtyType:', specialtyType);

  const specialtyTypeWatch = watch('specialtyType');

  useEffect(() => {
    loadExistingData();
  }, [medicalRecord.id]);

  function getSpecialtyTypeFromRecord(record: MedicalRecord): string {
    // Mapear la especialidad del record a los valores que espera el backend
    const specialtyName = record.specialty?.name?.toLowerCase();
    console.log('🔍 Specialty name received:', record.specialty?.name, '-> lowercase:', specialtyName);
    
    switch (specialtyName) {
      case 'medicina general':
        return 'Medicina General';
      case 'dermatología':
        return 'Dermatología';
      case 'pediatría':
        return 'Pediatría';
      case 'urología':
        return 'Urología';
      case 'obstetricia':
        return 'Obstetricia';
      case 'traumatología':
        return 'Traumatología';
      case 'medicina interna':
        return 'Medicina Interna';
      default:
        return 'Medicina General';
    }
  }

  const loadExistingData = async () => {
    try {
      const data = await MedicalHistoryService.getSpecialtyMedicalHistory(medicalRecord.id);
      if (data) {
        setExistingData(data);
        console.log('Datos de especialidad cargados del backend:', data);
        
        // Mapear datos del backend al formulario
        setValue('specialtyType', data.specialtyType);
        setValue('chiefComplaint', data.chiefComplaint || '');
        setValue('currentIllness', data.currentIllness || '');
        setValue('systemsReview', data.systemsReview || '');
        setValue('generalPhysicalExam', data.generalPhysicalExam || '');
        
        // Signos vitales
        if (data.vitalSigns) {
          setValue('bloodPressure', data.vitalSigns.bloodPressure || '');
          setValue('heartRate', data.vitalSigns?.heartRate?.toString() || '');
          setValue('respiratoryRate', data.vitalSigns?.respiratoryRate?.toString() || '');
          setValue('temperature', data.vitalSigns?.temperature?.toString() || '');
          setValue('oxygenSaturation', data.vitalSigns?.oxygenSaturation?.toString() || '');
          setValue('weight', data.vitalSigns?.weight?.toString() || '');
          setValue('height', data.vitalSigns?.height?.toString() || '');
          setValue('bmi', data.vitalSigns?.bmi?.toString() || '');
        }
        
        // Campos específicos por especialidad
        setValue('generalMedicine', data.generalMedicine || '');
        setValue('dermatology', data.dermatology || '');
        setValue('pediatrics', data.pediatrics || '');
        setValue('urology', data.urology || '');
        setValue('obstetrics', data.obstetrics || '');
        setValue('traumatology', data.traumatology || '');
        setValue('internalMedicine', data.internalMedicine || '');
        
        // Diagnósticos
        if (data.diagnoses && data.diagnoses.length > 0) {
          const primary = data.diagnoses.find(d => d.type === 'principal');
          const secondary = data.diagnoses.find(d => d.type === 'secundario');
          const differential = data.diagnoses.find(d => d.type === 'diferencial');
          
          setValue('primaryDiagnosis', primary?.description || '');
          setValue('secondaryDiagnosis', secondary?.description || '');
          setValue('differentialDiagnosis', differential?.description || '');
        }
        
        setValue('observations', data.observations || '');
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log('No hay historia clínica por especialidad registrada aún');
        setExistingData(null);
      } else {
        console.error('Error loading existing specialty data:', error);
        toast.error('Error al cargar la historia clínica por especialidad');
      }
    }
  };

  const onSubmit = async (data: SpecialtyMedicalHistoryFormData) => {
    console.log('🚀 onSubmit called with data:', data);
    setLoading(true);
    try {
      console.log('📦 Payload specialtyType being sent:', data.specialtyType);
      const payload: CreateSpecialtyMedicalHistoryDto = {
        specialtyType: data.specialtyType as any,
        chiefComplaint: data.chiefComplaint,
        currentIllness: data.currentIllness,
        systemsReview: data.systemsReview,
        generalPhysicalExam: data.generalPhysicalExam,
        vitalSigns: {
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate ? Number(data.heartRate) : undefined,
          respiratoryRate: data.respiratoryRate ? Number(data.respiratoryRate) : undefined,
          temperature: data.temperature ? Number(data.temperature) : undefined,
          oxygenSaturation: data.oxygenSaturation ? Number(data.oxygenSaturation) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
          height: data.height ? Number(data.height) : undefined,
          bmi: data.bmi ? Number(data.bmi) : undefined,
        },
        diagnoses: [
          ...(data.primaryDiagnosis ? [{
            type: 'principal' as const,
            description: data.primaryDiagnosis,
            certainty: 'definitivo' as const
          }] : []),
          ...(data.secondaryDiagnosis ? [{
            type: 'secundario' as const,
            description: data.secondaryDiagnosis,
            certainty: 'definitivo' as const
          }] : []),
          ...(data.differentialDiagnosis ? [{
            type: 'diferencial' as const,
            description: data.differentialDiagnosis,
            certainty: 'presuntivo' as const
          }] : [])
        ],
        observations: data.observations,
        // Campos específicos por especialidad
        ...(data.generalMedicine && { generalMedicine: data.generalMedicine }),
        ...(data.dermatology && { dermatology: data.dermatology }),
        ...(data.pediatrics && { pediatrics: data.pediatrics }),
        ...(data.urology && { urology: data.urology }),
        ...(data.obstetrics && { obstetrics: data.obstetrics }),
        ...(data.traumatology && { traumatology: data.traumatology }),
        ...(data.internalMedicine && { internalMedicine: data.internalMedicine }),
      };

      if (existingData) {
        await MedicalHistoryService.updateSpecialtyMedicalHistory(medicalRecord.id, payload);
        toast.success('Historia clínica por especialidad actualizada correctamente');
      } else {
        await MedicalHistoryService.createSpecialtyMedicalHistory(medicalRecord.id, payload);
        toast.success('Historia clínica por especialidad registrada correctamente');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving specialty medical history:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al guardar la historia clínica por especialidad');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleAISuggestionInsert = (field: string, value: string) => {
    // Mapear los campos del asistente a los campos del formulario
    const fieldMapping: { [key: string]: string } = {
      'diagnosis': 'primaryDiagnosis',
      'tests': 'systemsReview',
      'treatment': 'medications',
      'redFlags': 'observations',
      'physicalExam': 'generalPhysicalExam',
      'followUp': 'observations'
    };

    const formField = fieldMapping[field] || field;
    
    // Obtener el valor actual del campo
    const currentValue = getValues(formField as any) || '';
    
    // Agregar la sugerencia al valor existente
    const newValue = currentValue 
      ? `${currentValue}\n\n• ${value}` 
      : `• ${value}`;
    
    setValue(formField as any, newValue);
    toast.success(`Sugerencia agregada a ${formField}`);
  };

  const handleTranscriptionComplete = (transcription: string) => {
    // Procesar la transcripción de manera inteligente
    const processedTranscription = processTranscription(transcription);
    
    // Insertar automáticamente en los campos más relevantes
    if (processedTranscription.chiefComplaint) {
      const currentValue = getValues('chiefComplaint') || '';
      setValue('chiefComplaint', currentValue ? `${currentValue}\n\n${processedTranscription.chiefComplaint}` : processedTranscription.chiefComplaint);
    }
    
    if (processedTranscription.currentIllness) {
      const currentValue = getValues('currentIllness') || '';
      setValue('currentIllness', currentValue ? `${currentValue}\n\n${processedTranscription.currentIllness}` : processedTranscription.currentIllness);
    }
    
    if (processedTranscription.physicalExam) {
      const currentValue = getValues('generalPhysicalExam') || '';
      setValue('generalPhysicalExam', currentValue ? `${currentValue}\n\n${processedTranscription.physicalExam}` : processedTranscription.physicalExam);
    }
    
    if (processedTranscription.systemsReview) {
      const currentValue = getValues('systemsReview') || '';
      setValue('systemsReview', currentValue ? `${currentValue}\n\n${processedTranscription.systemsReview}` : processedTranscription.systemsReview);
    }
    
    // Cerrar el grabador después de procesar
    setShowAudioRecorder(false);
    toast.success('Transcripción procesada y agregada a los campos correspondientes');
  };

  const processTranscription = (transcription: string) => {
    // Procesar la transcripción usando palabras clave para identificar secciones
    const result: any = {};
    
    // Convertir a minúsculas para análisis
    const lowerTranscription = transcription.toLowerCase();
    
    // Identificar motivo de consulta
    if (lowerTranscription.includes('motivo') || lowerTranscription.includes('consulta') || 
        lowerTranscription.includes('viene por') || lowerTranscription.includes('refiere')) {
      result.chiefComplaint = transcription;
    }
    
    // Identificar enfermedad actual
    else if (lowerTranscription.includes('desde') || lowerTranscription.includes('hace') || 
             lowerTranscription.includes('inició') || lowerTranscription.includes('presenta')) {
      result.currentIllness = transcription;
    }
    
    // Identificar examen físico
    else if (lowerTranscription.includes('examen') || lowerTranscription.includes('inspección') || 
             lowerTranscription.includes('palpación') || lowerTranscription.includes('auscultación')) {
      result.physicalExam = transcription;
    }
    
    // Identificar revisión por sistemas
    else if (lowerTranscription.includes('sistema') || lowerTranscription.includes('síntoma') || 
             lowerTranscription.includes('dolor') || lowerTranscription.includes('molestia')) {
      result.systemsReview = transcription;
    }
    
    // Si no se identifica una sección específica, agregar a enfermedad actual por defecto
    else {
      result.currentIllness = transcription;
    }
    
    return result;
  };

  const renderSpecialtySpecificFields = () => {
    switch (specialtyType) {
      case SpecialtyHistoryType.GENERAL_MEDICINE:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medicina General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalMedicine">Examen Físico Específico</Label>
                <Textarea
                  {...register('generalMedicine')}
                  placeholder="Descripción del examen físico específico de medicina general"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.DERMATOLOGY:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dermatología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dermatology">Examen Dermatológico</Label>
                <Textarea
                  {...register('dermatology')}
                  placeholder="Descripción de lesiones cutáneas, distribución, características, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.PEDIATRICS:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pediatría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pediatrics">Evaluación Pediátrica</Label>
                <Textarea
                  {...register('pediatrics')}
                  placeholder="Desarrollo psicomotor, crecimiento, vacunas, alimentación, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.UROLOGY:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Urología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urology">Examen Urológico</Label>
                <Textarea
                  {...register('urology')}
                  placeholder="Examen genitourinario, síntomas miccionales, función renal, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.OBSTETRICS:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Obstetricia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="obstetrics">Evaluación Obstétrica</Label>
                <Textarea
                  {...register('obstetrics')}
                  placeholder="Examen obstétrico, edad gestacional, altura uterina, FCF, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.TRAUMATOLOGY:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traumatología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="traumatology">Examen Traumatológico</Label>
                <Textarea
                  {...register('traumatology')}
                  placeholder="Examen musculoesquelético, movilidad, fuerza, deformidades, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case SpecialtyHistoryType.INTERNAL_MEDICINE:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medicina Interna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="internalMedicine">Evaluación de Medicina Interna</Label>
                <Textarea
                  {...register('internalMedicine')}
                  placeholder="Examen por sistemas, evaluación integral, comorbilidades, etc."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historia Clínica por Especialidad</CardTitle>
              <p className="text-sm text-gray-600">
                Paciente: {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname} - 
                Especialidad: {medicalRecord.specialty?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setShowAudioRecorder(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Grabar Consulta
              </Button>
              <Button
                type="button"
                onClick={() => setShowAIAssistant(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                Asistente IA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('❌ Validation errors:', errors);
          })} className="space-y-6">
            {/* Motivo de Consulta y Enfermedad Actual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anamnesis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chiefComplaint">Motivo de Consulta *</Label>
                  <Textarea
                    {...register('chiefComplaint')}
                    placeholder="¿Por qué consulta el paciente?"
                    className="min-h-[80px]"
                  />
                  {errors.chiefComplaint && (
                    <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentIllness">Enfermedad Actual *</Label>
                  <Textarea
                    {...register('currentIllness')}
                    placeholder="Descripción detallada de la enfermedad actual"
                    className="min-h-[100px]"
                  />
                  {errors.currentIllness && (
                    <p className="text-sm text-red-500">{errors.currentIllness.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="systemsReview">Revisión por Sistemas</Label>
                  <Textarea
                    {...register('systemsReview')}
                    placeholder="Revisión por sistemas relevante"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signos Vitales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signos Vitales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Presión Arterial</Label>
                    <Input
                      {...register('bloodPressure')}
                      placeholder="120/80"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Frecuencia Cardíaca</Label>
                    <Input
                      type="number"
                      {...register('heartRate', { valueAsNumber: true })}
                      placeholder="80"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate">Frecuencia Respiratoria</Label>
                    <Input
                      type="number"
                      {...register('respiratoryRate', { valueAsNumber: true })}
                      placeholder="20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperatura (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register('temperature', { valueAsNumber: true })}
                      placeholder="36.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">Saturación O2 (%)</Label>
                    <Input
                      type="number"
                      {...register('oxygenSaturation', { valueAsNumber: true })}
                      placeholder="98"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register('weight', { valueAsNumber: true })}
                      placeholder="70"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Talla (cm)</Label>
                    <Input
                      type="number"
                      {...register('height', { valueAsNumber: true })}
                      placeholder="170"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bmi">IMC</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register('bmi', { valueAsNumber: true })}
                      placeholder="24.2"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examen Físico General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Examen Físico General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="generalPhysicalExam">Descripción del Examen Físico</Label>
                  <Textarea
                    {...register('generalPhysicalExam')}
                    placeholder="Descripción del examen físico general"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campos Específicos por Especialidad */}
            {renderSpecialtySpecificFields()}

            {/* Diagnósticos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnósticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryDiagnosis">Diagnóstico Principal</Label>
                  <Textarea
                    {...register('primaryDiagnosis')}
                    placeholder="Diagnóstico principal con código CIE-10 si es posible"
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryDiagnosis">Diagnóstico Secundario</Label>
                  <Textarea
                    {...register('secondaryDiagnosis')}
                    placeholder="Diagnósticos secundarios"
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="differentialDiagnosis">Diagnóstico Diferencial</Label>
                  <Textarea
                    {...register('differentialDiagnosis')}
                    placeholder="Diagnósticos diferenciales a considerar"
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observaciones y Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones Adicionales</Label>
                  <Textarea
                    {...register('observations')}
                    placeholder="Plan de tratamiento, seguimiento, observaciones adicionales"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={() => console.log('🔘 Submit button clicked!')}
              >
                {loading ? 'Guardando...' : existingData ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Grabador de Audio */}
      {showAudioRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Grabación de Consulta Médica</h2>
              <Button
                onClick={() => setShowAudioRecorder(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              onTranscriptionStart={() => toast.info('Iniciando transcripción...')}
              language="es"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Asistente de IA */}
      <AIAssistant
        specialty={medicalRecord.specialty?.name || ''}
        patientAge={medicalRecord.patient.birthDate ? 
          new Date().getFullYear() - new Date(medicalRecord.patient.birthDate).getFullYear() : undefined
        }
        patientGender={medicalRecord.patient.gender}
        currentFindings={watch('generalPhysicalExam') || ''}
        vitalSigns={`PA: ${watch('bloodPressure') || 'N/A'}, FC: ${watch('heartRate') || 'N/A'}, FR: ${watch('respiratoryRate') || 'N/A'}, T: ${watch('temperature') || 'N/A'}, SatO2: ${watch('oxygenSaturation') || 'N/A'}`}
        onSuggestionInsert={handleAISuggestionInsert}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
}
