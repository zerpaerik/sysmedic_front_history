'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfessionalForm } from '@/components/professionals/ProfessionalForm';
import { ProfessionalList } from '@/components/professionals/ProfessionalList';
import { DeleteProfessionalModal } from '@/components/professionals/DeleteProfessionalModal';
import { Professional, ProfessionalStatus } from '@/types/professional';
import { professionalService } from '@/services/professionalService';
import { UserCheck, Plus, ArrowLeft, TrendingUp, Users } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function ProfessionalsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    withSpecialties: 0,
  });

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await professionalService.getProfessionals({ limit: 1000 });
        const professionals = response.data || [];
        
        if (Array.isArray(professionals)) {
          const active = professionals.filter(p => p.status === ProfessionalStatus.ACTIVE).length;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const newThisMonth = professionals.filter(p => {
            const createdDate = new Date(p.createdAt);
            return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
          }).length;
          const withSpecialties = professionals.filter(p => p.specialties && p.specialties.length > 0).length;
          
          setStats({
            total: professionals.length,
            active,
            newThisMonth,
            withSpecialties,
          });
        }
      } catch (error) {
        console.error('Error loading professional stats:', error);
        setStats({ total: 0, active: 0, newThisMonth: 0, withSpecialties: 0 });
      }
    };

    loadStats();
  }, [refreshTrigger]);

  const handleCreateProfessional = () => {
    setSelectedProfessional(null);
    setViewMode('create');
  };

  const handleEditProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setViewMode('edit');
  };

  const handleDeleteProfessional = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedProfessional(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProfessional(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {viewMode === 'list' ? 'Gestión de Profesionales' : 
               viewMode === 'create' ? 'Nuevo Profesional' : 'Editar Profesional'}
            </h2>
            <p className="text-gray-600">
              {viewMode === 'list' ? 'Administra los profesionales médicos del sistema' :
               viewMode === 'create' ? 'Registra un nuevo profesional médico' :
               'Modifica los datos del profesional'}
            </p>
          </div>
          <div className="flex gap-2">
            {viewMode !== 'list' && (
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            )}
            {viewMode === 'list' && (
              <Button onClick={handleCreateProfessional}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Profesional
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Solo mostrar en vista de lista */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profesionales</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Profesionales registrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Profesionales activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newThisMonth}</div>
                <p className="text-xs text-muted-foreground">Nuevos este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Especialidades</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withSpecialties}</div>
                <p className="text-xs text-muted-foreground">Con especialidades asignadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'list' && (
          <ProfessionalList
            onEdit={handleEditProfessional}
            onDelete={handleDeleteProfessional}
            refreshTrigger={refreshTrigger}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <ProfessionalForm
            professional={selectedProfessional || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        )}

        {/* Delete Modal */}
        {professionalToDelete && (
          <DeleteProfessionalModal
            professional={professionalToDelete}
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setProfessionalToDelete(null);
            }}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
