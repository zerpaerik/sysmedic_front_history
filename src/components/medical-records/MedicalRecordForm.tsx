'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Clock, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { medicalRecordService } from '@/services/medicalRecordService';
import { specialtyService } from '@/services/specialtyService';
import { professionalService } from '@/services/professionalService';
import { CreateMedicalRecordDto, MedicalRecordStatus, PatientSearchResult } from '@/types/medicalRecord';
import { Patient } from '@/types/patient';
import { Specialty } from '@/types/specialty';
import { Professional } from '@/types/professional';
import { PatientForm } from '@/components/patients/PatientForm';

interface MedicalRecordFormProps {
  onSuccess: (medicalRecord: any) => void;
  onCancel: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSuccess, onCancel }) => {
  // Estados para búsqueda de paciente
  const [searchDNI, setSearchDNI] = useState('');
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientSearchResult, setPatientSearchResult] = useState<PatientSearchResult | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);

  // Estados para el formulario
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateMedicalRecordDto>({
    patientId: '',
    professionalId: '',
    specialtyId: '',
    appointmentDate: '',
    appointmentTimeFrom: '',
    appointmentTimeTo: '',
    status: MedicalRecordStatus.PENDING
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar especialidades al montar el componente
  useEffect(() => {
    loadSpecialties();
  }, []);

  // Cargar profesionales cuando se selecciona una especialidad
  useEffect(() => {
    if (formData.specialtyId) {
      loadProfessionalsBySpecialty(formData.specialtyId);
    } else {
      setProfessionals([]);
      setFormData(prev => ({ ...prev, professionalId: '' }));
    }
  }, [formData.specialtyId]);

  // Actualizar patientId cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patientId: selectedPatient.id }));
    }
  }, [selectedPatient]);

  const loadSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await specialtyService.getSpecialties({ isActive: true });
      const specialtiesData = Array.isArray(response) ? response : response.data || [];
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Error loading specialties:', error);
      setError('Error al cargar especialidades');
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const loadProfessionalsBySpecialty = async (specialtyId: string) => {
    try {
      setLoadingProfessionals(true);
      const response = await professionalService.getProfessionalsBySpecialty(specialtyId);
      setProfessionals(response);
    } catch (error) {
      console.error('Error loading professionals:', error);
      setError('Error al cargar profesionales');
      setProfessionals([]);
    } finally {
      setLoadingProfessionals(false);
    }
  };

  const handleSearchPatient = async () => {
    if (!searchDNI.trim()) {
      setError('Por favor ingrese un DNI válido');
      return;
    }

    try {
      setSearchingPatient(true);
      setError(null);
      const result = await medicalRecordService.searchPatientByDNI(searchDNI.trim());
      setPatientSearchResult(result);
      
      if (result.found && result.patient) {
        setSelectedPatient(result.patient);
      } else {
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      setError('Error al buscar paciente');
      setPatientSearchResult(null);
      setSelectedPatient(null);
    } finally {
      setSearchingPatient(false);
    }
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setSelectedPatient(newPatient);
    setShowPatientForm(false);
    setPatientSearchResult({
      found: true,
      patient: newPatient
    });
  };

  const handleInputChange = (field: keyof CreateMedicalRecordDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Debe seleccionar un paciente');
      return;
    }

    if (!formData.specialtyId) {
      setError('Debe seleccionar una especialidad');
      return;
    }

    if (!formData.professionalId) {
      setError('Debe seleccionar un profesional');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const medicalRecord = await medicalRecordService.createMedicalRecord(formData);
      onSuccess(medicalRecord);
    } catch (error: any) {
      console.error('Error creating medical record:', error);
      setError(error.response?.data?.message || 'Error al crear la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchDNI('');
    setPatientSearchResult(null);
    setSelectedPatient(null);
    setFormData({
      patientId: '',
      professionalId: '',
      specialtyId: '',
      appointmentDate: '',
      appointmentTimeFrom: '',
      appointmentTimeTo: '',
      status: MedicalRecordStatus.PENDING
    });
    setError(null);
  };

  if (showPatientForm) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrar Nuevo Paciente</h3>
          <p className="text-sm text-gray-600">
            El paciente con DNI {searchDNI} no fue encontrado. Complete el formulario para registrarlo.
          </p>
        </div>
        
        <PatientForm
          onSuccess={handlePatientCreated}
          onCancel={() => setShowPatientForm(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Registrar Historia Clínica</h2>
        <p className="text-gray-600">Complete los datos para crear una nueva historia clínica</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Búsqueda de Paciente */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Paciente por DNI *
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchDNI}
                onChange={(e) => setSearchDNI(e.target.value)}
                placeholder="Ingrese el DNI del paciente"
                className="flex-1"
                maxLength={20}
              />
              <Button
                type="button"
                onClick={handleSearchPatient}
                disabled={searchingPatient || !searchDNI.trim()}
                className="px-4"
              >
                {searchingPatient ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Resultado de búsqueda */}
          {patientSearchResult && (
            <div className={`p-4 rounded-md border ${
              patientSearchResult.found 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              {patientSearchResult.found && patientSearchResult.patient ? (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Paciente Encontrado</h4>
                    <div className="mt-2 text-sm text-green-800">
                      <p><strong>Nombre:</strong> {patientSearchResult.patient.firstName} {patientSearchResult.patient.secondName} {patientSearchResult.patient.firstLastname} {patientSearchResult.patient.secondLastname}</p>
                      <p><strong>DNI:</strong> {patientSearchResult.patient.identificationNumber}</p>
                      <p><strong>Teléfono:</strong> {patientSearchResult.patient.phone || 'No registrado'}</p>
                      <p><strong>Email:</strong> {patientSearchResult.patient.email || 'No registrado'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Paciente No Encontrado</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      No se encontró un paciente con el DNI {searchDNI}
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowPatientForm(true)}
                      className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Registrar Nuevo Paciente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulario principal - solo visible si hay paciente seleccionado */}
        {selectedPatient && (
          <>
            {/* Selección de Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad *
              </label>
              <select
                value={formData.specialtyId}
                onChange={(e) => handleInputChange('specialtyId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSpecialties}
                required
              >
                <option value="">Seleccionar especialidad</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Profesional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profesional *
              </label>
              <select
                value={formData.professionalId}
                onChange={(e) => handleInputChange('professionalId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingProfessionals || !formData.specialtyId}
                required
              >
                <option value="">
                  {!formData.specialtyId 
                    ? 'Primero seleccione una especialidad'
                    : loadingProfessionals 
                    ? 'Cargando profesionales...'
                    : 'Seleccionar profesional'
                  }
                </option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    Dr. {professional.firstName} {professional.firstLastname}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Horario (Opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Cita (Opcional)
                </label>
                <Input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Desde (Opcional)
                </label>
                <Input
                  type="time"
                  value={formData.appointmentTimeFrom}
                  onChange={(e) => handleInputChange('appointmentTimeFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Hasta (Opcional)
                </label>
                <Input
                  type="time"
                  value={formData.appointmentTimeTo}
                  onChange={(e) => handleInputChange('appointmentTimeTo', e.target.value)}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedPatient}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  'Crear Historia Clínica'
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};

export default MedicalRecordForm;
