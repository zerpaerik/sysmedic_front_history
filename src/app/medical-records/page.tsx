'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Activity, Users, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MedicalRecordForm from '@/components/medical-records/MedicalRecordForm';
import MedicalRecordList from '@/components/medical-records/MedicalRecordList';
import TriageForm from '@/components/medical-records/TriageForm';
import MedicalHistoryBaseForm from '@/components/medical-records/MedicalHistoryBaseForm';
import SpecialtyMedicalHistoryForm from '@/components/medical-records/SpecialtyMedicalHistoryForm';
import CompletionStatusForm from '@/components/medical-records/CompletionStatusForm';
import { medicalRecordService } from '@/services/medicalRecordService';
import { MedicalRecord, MedicalRecordStatus } from '@/types/medicalRecord';

type ViewType = 'list' | 'create' | 'edit' | 'triage' | 'medical-history-base' | 'specialty-history' | 'completion-status';

export default function MedicalRecordsPage() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    withTriage: 0,
    withoutTriage: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const statsData = await medicalRecordService.getMedicalRecordsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateSuccess = () => {
    setCurrentView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('edit');
  };

  const handleTriageRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('triage');
  };

  const handleTriageSuccess = () => {
    setCurrentView('list');
    setSelectedRecord(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMedicalHistoryBase = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('medical-history-base');
  };

  const handleSpecialtyHistory = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('specialty-history');
  };

  const handleCompletionStatus = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setCurrentView('completion-status');
  };

  const handleMedicalHistorySuccess = () => {
    setCurrentView('list');
    setSelectedRecord(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMedicalHistoryBaseSuccess = () => {
    // Después de guardar antecedentes médicos, navegar automáticamente
    // al formulario de historia clínica por especialidad
    setCurrentView('specialty-history');
    // Mantener el selectedRecord para continuar con la misma historia
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSpecialtyHistorySuccess = async () => {
    // Después de guardar la historia clínica por especialidad,
    // actualizar el estado del registro a COMPLETED
    if (selectedRecord) {
      try {
        await medicalRecordService.updateMedicalRecord(selectedRecord.id, {
          status: MedicalRecordStatus.COMPLETED
        });
        console.log('Estado actualizado a COMPLETED');
      } catch (error) {
        console.error('Error updating medical record status:', error);
      }
    }
    
    // Volver al listado y refrescar para mostrar el nuevo estado
    setCurrentView('list');
    setSelectedRecord(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedRecord(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRecord(null);
  };

  const renderHeader = () => {
    const titles = {
      list: 'Historias Clínicas',
      create: 'Nueva Historia Clínica',
      edit: 'Editar Historia Clínica',
      triage: 'Registrar Triaje',
      'medical-history-base': 'Antecedentes Médicos',
      'specialty-history': 'Historia por Especialidad',
      'completion-status': 'Estado de Completitud'
    };

    const descriptions = {
      list: 'Gestiona los registros médicos de los pacientes',
      create: 'Complete los datos para crear una nueva historia clínica',
      edit: 'Modifique los datos de la historia clínica',
      triage: 'Registre los signos vitales y datos del triaje',
      'medical-history-base': 'Registre los antecedentes personales, familiares y quirúrgicos',
      'specialty-history': 'Complete la historia clínica específica por especialidad',
      'completion-status': 'Verifique el estado y finalice la historia clínica'
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentView !== 'list' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToList}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              )}
              <div>
                <CardTitle className="text-xl">{titles[currentView]}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{descriptions[currentView]}</p>
              </div>
            </div>
            
            {currentView === 'list' && (
              <Button
                onClick={() => setCurrentView('create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Historia Clínica
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  };

  const renderStats = () => {
    if (currentView !== 'list') return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : stats.total}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {loadingStats ? '...' : stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">
                {loadingStats ? '...' : stats.inProgress}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {loadingStats ? '...' : stats.completed}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Triaje</p>
              <p className="text-2xl font-bold text-green-600">
                {loadingStats ? '...' : stats.withTriage}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Triaje</p>
              <p className="text-2xl font-bold text-gray-600">
                {loadingStats ? '...' : stats.withoutTriage}
              </p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <MedicalRecordForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
          />
        );
      
      case 'triage':
        return selectedRecord ? (
          <TriageForm
            medicalRecord={selectedRecord}
            onSuccess={handleTriageSuccess}
            onCancel={handleCancel}
          />
        ) : null;
      
      case 'medical-history-base':
        return selectedRecord ? (
          <MedicalHistoryBaseForm
            medicalRecord={selectedRecord}
            onSave={handleMedicalHistoryBaseSuccess}
            onCancel={handleCancel}
          />
        ) : null;
      
      case 'specialty-history':
        return selectedRecord ? (
          <SpecialtyMedicalHistoryForm
            medicalRecord={selectedRecord}
            onSave={handleSpecialtyHistorySuccess}
            onCancel={handleCancel}
          />
        ) : null;
      
      case 'completion-status':
        return selectedRecord ? (
          <CompletionStatusForm
            medicalRecord={selectedRecord}
            onSave={handleMedicalHistorySuccess}
            onCancel={handleCancel}
          />
        ) : null;
      
      case 'list':
      default:
        return (
          <MedicalRecordList
            onEdit={handleEditRecord}
            onTriage={handleTriageRecord}
            onMedicalHistoryBase={handleMedicalHistoryBase}
            onSpecialtyHistory={handleSpecialtyHistory}
            onCompletionStatus={handleCompletionStatus}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {renderHeader()}
        {renderStats()}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
