'use client';

import React, { useState } from 'react';
import { Search, FileText, User, Calendar, Stethoscope } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PatientMedicalHistoryList from '@/components/consultations/PatientMedicalHistoryList';
import MedicalRecordDetailView from '@/components/consultations/MedicalRecordDetailView';
import { Patient } from '@/types/patient';
import { MedicalRecord } from '@/types/medicalRecord';
import { patientService } from '@/services/patientService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { toast } from 'sonner';

const ConsultationsPage = () => {
  const [searchDni, setSearchDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'list' | 'detail'>('search');

  const handleSearch = async () => {
    if (!searchDni.trim()) {
      toast.error('Por favor ingresa un DNI para buscar');
      return;
    }

    setLoading(true);
    try {
      // Buscar paciente por DNI
      const foundPatient = await patientService.searchByDni(searchDni);
      if (!foundPatient) {
        toast.error('No se encontró paciente con ese DNI');
        setPatient(null);
        setMedicalRecords([]);
        return;
      }

      setPatient(foundPatient);

      // Buscar historias clínicas del paciente
      const records = await medicalRecordService.getMedicalRecordsByPatientId(foundPatient.id);
      setMedicalRecords(records);
      
      if (records.length === 0) {
        toast.info('El paciente no tiene historias clínicas registradas');
      } else {
        toast.success(`Se encontraron ${records.length} historia(s) clínica(s)`);
        setCurrentView('list');
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      toast.error('Error al buscar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setSelectedRecord(null);
    setCurrentView('list');
  };

  const handleBackToSearch = () => {
    setPatient(null);
    setMedicalRecords([]);
    setSelectedRecord(null);
    setCurrentView('search');
    setSearchDni('');
  };

  const renderSearchView = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Consulta de Historias Clínicas
          </h2>
          <p className="text-gray-600">
            Ingresa el DNI del paciente para consultar su historial médico
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI del Paciente
            </label>
            <Input
              type="text"
              placeholder="Ej: 12345678"
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-center text-lg"
            />
          </div>

          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Buscando...' : 'Buscar Paciente'}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderListView = () => (
    <div>
      {/* Información del Paciente */}
      {patient && (
        <Card className="p-4 mb-6 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {patient.firstName} {patient.secondName} {patient.firstLastname} {patient.secondLastname}
                </h3>
                <p className="text-sm text-gray-600">
                  DNI: {patient.identificationNumber} • {patient.email} • {patient.phone}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleBackToSearch}
              size="sm"
            >
              Nueva Búsqueda
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Historias Clínicas */}
      <PatientMedicalHistoryList 
        medicalRecords={medicalRecords}
        onViewRecord={handleViewRecord}
      />
    </div>
  );

  const renderDetailView = () => (
    <div>
      {selectedRecord && (
        <MedicalRecordDetailView 
          medicalRecord={selectedRecord}
          patient={patient}
          onBack={handleBackToList}
        />
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
            <p className="text-gray-600">
              Consulta el historial médico de los pacientes
            </p>
          </div>
        </div>

        {currentView === 'search' && renderSearchView()}
        {currentView === 'list' && renderListView()}
        {currentView === 'detail' && renderDetailView()}
      </div>
    </DashboardLayout>
  );
};

export default ConsultationsPage;
