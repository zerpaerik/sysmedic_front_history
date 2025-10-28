'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { medicalRecordService } from '@/services/medicalRecordService';
import { MedicalRecord, CreateTriageDto } from '@/types/medicalRecord';

interface TriageFormProps {
  medicalRecord: MedicalRecord;
  onSuccess: (updatedRecord: MedicalRecord) => void;
  onCancel: () => void;
}

const TriageForm: React.FC<TriageFormProps> = ({
  medicalRecord,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateTriageDto>({
    weight: '',
    height: '',
    bloodPressure: '',
    oxygenSaturation: '',
    heartRate: '',
    temperature: '',
    observations: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos existentes del triaje si los hay
  useEffect(() => {
    if (medicalRecord.triage) {
      setFormData({
        weight: medicalRecord.triage.weight || '',
        height: medicalRecord.triage.height || '',
        bloodPressure: medicalRecord.triage.bloodPressure || '',
        oxygenSaturation: medicalRecord.triage.oxygenSaturation || '',
        heartRate: medicalRecord.triage.heartRate || '',
        temperature: medicalRecord.triage.temperature || '',
        observations: medicalRecord.triage.observations || ''
      });
    }
  }, [medicalRecord.triage]);

  const handleInputChange = (field: keyof CreateTriageDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que al menos un campo tenga datos
    const hasData = Object.values(formData).some(value => value && value.trim() !== '');
    if (!hasData) {
      setError('Debe completar al menos un campo del triaje');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedRecord = await medicalRecordService.updateTriageData(
        medicalRecord.id,
        formData
      );
      
      onSuccess(updatedRecord);
    } catch (error: any) {
      console.error('Error updating triage data:', error);
      setError(error.response?.data?.message || 'Error al actualizar los datos del triaje');
    } finally {
      setLoading(false);
    }
  };

  const hasExistingData = medicalRecord.triage && Object.values(medicalRecord.triage).some(
    value => value && typeof value === 'string' && value.trim() !== ''
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {hasExistingData ? 'Actualizar Triaje' : 'Registrar Triaje'}
          </h2>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Historia Clínica:</strong> HC-{medicalRecord.recordNumber}</p>
          <p><strong>Paciente:</strong> {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname}</p>
          <p><strong>Especialidad:</strong> {medicalRecord.specialty.name}</p>
          <p><strong>Profesional:</strong> Dr. {medicalRecord.professional.firstName} {medicalRecord.professional.firstLastname}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Signos Vitales Principales */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signos Vitales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <Input
                type="text"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Ej: 70.5"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talla (cm)
              </label>
              <Input
                type="text"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Ej: 175"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tensión Arterial (mmHg)
              </label>
              <Input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                placeholder="Ej: 120/80"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saturación de Oxígeno (%)
              </label>
              <Input
                type="text"
                value={formData.oxygenSaturation}
                onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                placeholder="Ej: 98"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia Cardíaca (lpm)
              </label>
              <Input
                type="text"
                value={formData.heartRate}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                placeholder="Ej: 72"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <Input
                type="text"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="Ej: 36.5"
                maxLength={20}
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones del Triaje
          </label>
          <textarea
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            placeholder="Observaciones adicionales sobre el estado del paciente..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.observations?.length || 0}/1000 caracteres
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información Importante</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Todos los campos son opcionales, pero se recomienda completar al menos los signos vitales básicos.</li>
            <li>• Los datos del triaje se actualizarán en la historia clínica existente.</li>
            <li>• Una vez registrado el triaje, se habilitará la opción para completar la historia clínica.</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {hasExistingData ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {hasExistingData ? 'Actualizar Triaje' : 'Registrar Triaje'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TriageForm;
