'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimplePatientForm } from '@/components/patients/SimplePatientForm';
import { PatientList } from '@/components/patients/PatientList';
import { DeletePatientModal } from '@/components/patients/DeletePatientModal';
import { Patient } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { Users, Plus, ArrowLeft, TrendingUp } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load all patients to calculate stats
        const response = await patientService.getPatients({ limit: 1000 });
        console.log('Patients response:', response);
        
        // Validar que response.data existe y es un array
        const patients = response.data || [];
        if (!Array.isArray(patients)) {
          console.warn('Patients data is not an array:', patients);
          setStats({ total: 0, active: 0, newThisMonth: 0 });
          return;
        }
        
        const active = patients.filter(p => p.isActive).length;
        
        // Calculate new patients this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = patients.filter(p => 
          p.createdAt && new Date(p.createdAt) >= startOfMonth
        ).length;
        
        setStats({
          total: patients.length,
          active,
          newThisMonth,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Set default stats on error
        setStats({ total: 0, active: 0, newThisMonth: 0 });
      }
    };

    loadStats();
  }, [refreshTrigger]);

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setViewMode('create');
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedPatient(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Lista
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {viewMode === 'create' ? 'Nuevo Paciente' : 'Editar Paciente'}
              </h2>
              <p className="text-gray-600">
                {viewMode === 'create' 
                  ? 'Registra un nuevo paciente en el sistema'
                  : 'Modifica la información del paciente'
                }
              </p>
            </div>
          </div>

          {/* Form */}
          <SimplePatientForm
            patient={selectedPatient || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h2>
            <p className="text-gray-600">Administra la información de los pacientes</p>
          </div>
          <Button onClick={handleCreatePatient} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Pacientes registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Pacientes activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">Registros recientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <PatientList
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          refreshTrigger={refreshTrigger}
        />

        {/* Delete Modal */}
        {patientToDelete && (
          <DeletePatientModal
            patient={patientToDelete}
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setPatientToDelete(null);
            }}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
