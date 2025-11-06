'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/toast';
import { MedicalHistoryService } from '@/services/medicalHistoryService';
import { BloodType, CreateMedicalHistoryBaseDto, MedicalHistoryBase } from '@/types/medicalHistory';
import { MedicalRecord } from '@/types/medicalRecord';
import { Gender } from '@/types/patient';

const medicalHistoryBaseSchema = z.object({
  bloodType: z.nativeEnum(BloodType).optional(),
  personalHistory: z.string().optional(),
  chronicDiseases: z.string().optional(),
  allergies: z.string().optional(),
  immunizations: z.string().optional(),
  surgicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  adverseReactions: z.string().optional(),
  familyHistory: z.string().optional(),
  smokingHistory: z.string().optional(),
  alcoholHistory: z.string().optional(),
  drugHistory: z.string().optional(),
  physicalActivity: z.string().optional(),
  diet: z.string().optional(),
  occupation: z.string().optional(),
  occupationalRisks: z.string().optional(),
  workEnvironment: z.string().optional(),
  travelHistory: z.string().optional(),
  observations: z.string().optional(),
  // Campos gineco-obstétricos
  lastMenstrualPeriod: z.string().optional(),
  pregnancies: z.string().optional(),
  births: z.string().optional(),
  pap: z.string().optional(),
  mac: z.string().optional(),
  andria: z.string().optional(),
  // Campos boolean para controlar la visibilidad
  hasAllergies: z.boolean().optional(),
  hasChronicDiseases: z.boolean().optional(),
  hasSurgicalHistory: z.boolean().optional(),
  takesMedications: z.boolean().optional(),
  hasFamilyHistory: z.boolean().optional(),
  smoker: z.boolean().optional(),
  alcoholConsumer: z.boolean().optional(),
  drugUser: z.boolean().optional(),
});

type MedicalHistoryBaseFormData = z.infer<typeof medicalHistoryBaseSchema>;

interface MedicalHistoryBaseFormProps {
  medicalRecord: MedicalRecord;
  onSave: () => void;
  onCancel: () => void;
}

export default function MedicalHistoryBaseForm({ 
  medicalRecord, 
  onSave, 
  onCancel 
}: MedicalHistoryBaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<MedicalHistoryBase | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<MedicalHistoryBaseFormData>({
    resolver: zodResolver(medicalHistoryBaseSchema),
    defaultValues: {
      hasAllergies: false,
      hasChronicDiseases: false,
      hasSurgicalHistory: false,
      takesMedications: false,
      hasFamilyHistory: false,
      smoker: false,
      alcoholConsumer: false,
      drugUser: false,
    }
  });

  useEffect(() => {
    loadExistingData();
  }, [medicalRecord.id]);

  const loadExistingData = async () => {
    try {
      const data = await MedicalHistoryService.getMedicalHistoryBase(medicalRecord.id);
      if (data) {
        setExistingData(data);
        console.log('Datos cargados del backend:', data);
        
        // Mapear datos específicos del backend al formulario
        if (data.bloodType) {
          setValue('bloodType', data.bloodType);
        }
        setValue('personalHistory', data.personalHistory || '');
        setValue('chronicDiseases', data.chronicDiseases || '');
        setValue('allergies', data.allergies || '');
        setValue('immunizations', data.immunizations || '');
        setValue('surgicalHistory', data.surgicalHistory || '');
        setValue('currentMedications', data.currentMedications || '');
        setValue('adverseReactions', data.adverseReactions || '');
        setValue('familyHistory', data.familyHistory || '');
        setValue('smokingHistory', data.smokingHistory || '');
        setValue('alcoholHistory', data.alcoholHistory || '');
        setValue('drugHistory', data.drugHistory || '');
        setValue('physicalActivity', data.physicalActivity || '');
        setValue('diet', data.diet || '');
        setValue('occupation', data.occupation || '');
        setValue('occupationalRisks', data.occupationalRisks || '');
        setValue('workEnvironment', data.workEnvironment || '');
        setValue('travelHistory', data.travelHistory || '');
        setValue('observations', data.observations || '');
        
        // Campos gineco-obstétricos
        setValue('lastMenstrualPeriod', data.lastMenstrualPeriod || '');
        setValue('pregnancies', data.pregnancies?.toString() || '');
        setValue('births', data.births?.toString() || '');
        setValue('pap', data.pap || '');
        setValue('mac', data.mac || '');
        setValue('andria', data.andria || '');
        
        // Mapear campos boolean
        setValue('smoker', data.smoker || false);
        setValue('alcoholConsumer', data.alcoholConsumer || false);
        setValue('drugUser', data.drugUser || false);
        
        // Campos boolean derivados (si hay texto, marcar como true)
        setValue('hasAllergies', !!(data.allergies && data.allergies.trim()));
        setValue('hasChronicDiseases', !!(data.chronicDiseases && data.chronicDiseases.trim()));
        setValue('hasSurgicalHistory', !!(data.surgicalHistory && data.surgicalHistory.trim()));
        setValue('takesMedications', !!(data.currentMedications && data.currentMedications.trim()));
        setValue('hasFamilyHistory', !!(data.familyHistory && data.familyHistory.trim()));
      }
    } catch (error: any) {
      // Si es un error 404, significa que no hay antecedentes aún (es normal)
      if (error?.response?.status === 404) {
        console.log('No hay antecedentes médicos registrados aún para esta historia clínica');
        setExistingData(null);
      } else {
        console.error('Error loading existing data:', error);
        toast.error('Error al cargar los antecedentes médicos existentes');
      }
    }
  };

  const onSubmit = async (data: MedicalHistoryBaseFormData) => {
    setLoading(true);
    try {
      // No incluir medicalRecordId en el payload, se pasa como parámetro separado
      // Solo enviar los campos que el backend espera (sin los campos booleanos de control)
      const payload: CreateMedicalHistoryBaseDto = {
        bloodType: data.bloodType,
        personalHistory: data.personalHistory,
        chronicDiseases: data.chronicDiseases,
        allergies: data.allergies,
        immunizations: data.immunizations,
        surgicalHistory: data.surgicalHistory,
        currentMedications: data.currentMedications,
        adverseReactions: data.adverseReactions,
        familyHistory: data.familyHistory,
        smokingHistory: data.smokingHistory,
        alcoholHistory: data.alcoholHistory,
        drugHistory: data.drugHistory,
        physicalActivity: data.physicalActivity,
        diet: data.diet,
        occupation: data.occupation,
        occupationalRisks: data.occupationalRisks,
        workEnvironment: data.workEnvironment,
        travelHistory: data.travelHistory,
        observations: data.observations,
        // Campos gineco-obstétricos
        lastMenstrualPeriod: data.lastMenstrualPeriod,
        pregnancies: data.pregnancies ? parseInt(data.pregnancies) : undefined,
        births: data.births ? parseInt(data.births) : undefined,
        pap: data.pap,
        mac: data.mac,
        andria: data.andria,
        // Campos booleanos que sí existen en el backend
        smoker: data.smoker,
        alcoholConsumer: data.alcoholConsumer,
        drugUser: data.drugUser
      };

      if (existingData) {
        await MedicalHistoryService.updateMedicalHistoryBase(medicalRecord.id, payload);
        toast.success('Antecedentes médicos actualizados correctamente');
      } else {
        await MedicalHistoryService.createMedicalHistoryBase(medicalRecord.id, payload);
        toast.success('Antecedentes médicos registrados correctamente');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving medical history base:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al guardar los antecedentes médicos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const renderCheckboxField = (
    label: string, 
    name: keyof MedicalHistoryBaseFormData, 
    relatedField?: keyof MedicalHistoryBaseFormData
  ) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={watch(name) as boolean}
          onCheckedChange={(checked) => setValue(name, checked as any)}
        />
        <Label htmlFor={name}>{label}</Label>
      </div>
      {watch(name) && relatedField && (
        <Textarea
          {...register(relatedField)}
          placeholder={`Especifique detalles sobre ${label.toLowerCase()}`}
          className="min-h-[80px] ml-6"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Antecedentes Médicos Base</CardTitle>
          <p className="text-sm text-gray-600">
            Paciente: {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Antecedentes Personales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Antecedentes Personales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckboxField('¿Tiene alergias?', 'hasAllergies', 'allergies')}
                {renderCheckboxField('¿Tiene enfermedades crónicas?', 'hasChronicDiseases', 'chronicDiseases')}
                
                <div className="space-y-2">
                  <Label htmlFor="personalHistory">Historia Personal</Label>
                  <Textarea
                    {...register('personalHistory')}
                    placeholder="Ingrese historia personal"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Antecedentes Quirúrgicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Antecedentes Quirúrgicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckboxField('¿Ha tenido cirugías?', 'hasSurgicalHistory', 'surgicalHistory')}
              </CardContent>
            </Card>

            {/* Medicamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medicamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckboxField('¿Toma medicamentos actualmente?', 'takesMedications', 'currentMedications')}
              </CardContent>
            </Card>

            {/* Antecedentes Familiares */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Antecedentes Familiares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckboxField('¿Tiene antecedentes familiares relevantes?', 'hasFamilyHistory', 'familyHistory')}
              </CardContent>
            </Card>

            {/* Hábitos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hábitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckboxField('¿Es fumador?', 'smoker', 'smokingHistory')}
                {renderCheckboxField('¿Consume alcohol?', 'alcoholConsumer', 'alcoholHistory')}
                {renderCheckboxField('¿Usa drogas?', 'drugUser', 'drugHistory')}
              </CardContent>
            </Card>

            {/* Antecedentes Gineco-Obstétricos - Solo para pacientes femeninos */}
            {medicalRecord.patient.gender === Gender.FEMENINO && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Antecedentes Gineco-Obstétricos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastMenstrualPeriod">FUR (dd/mm/aaaa)</Label>
                      <Input
                        {...register('lastMenstrualPeriod')}
                        placeholder="dd/mm/aaaa"
                        type="text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pap">PAP</Label>
                      <Input
                        {...register('pap')}
                        placeholder="RF"
                        type="text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mac">MAC</Label>
                      <Input
                        {...register('mac')}
                        placeholder="FR"
                        type="text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="andria">Andria</Label>
                      <Input
                        {...register('andria')}
                        placeholder="FR"
                        type="text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pregnancies">G (Gestas)</Label>
                      <Input
                        {...register('pregnancies')}
                        placeholder="FR"
                        type="text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="births">P (Partos)</Label>
                      <Input
                        {...register('births')}
                        placeholder="FR"
                        type="text"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    {...register('observations')}
                    placeholder="Ingrese observaciones adicionales"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Ocupación</Label>
                  <Textarea
                    {...register('occupation')}
                    placeholder="Ingrese ocupación"
                    className="min-h-[80px]"
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
              >
                {loading ? 'Guardando...' : existingData ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
