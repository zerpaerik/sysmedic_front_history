'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpecialtyForm } from '@/components/specialties/SpecialtyForm';
import { SpecialtyList } from '@/components/specialties/SpecialtyList';
import { DeleteSpecialtyModal } from '@/components/specialties/DeleteSpecialtyModal';
import { Specialty } from '@/types/specialty';
import { specialtyService } from '@/services/specialtyService';
import { Stethoscope, Plus, ArrowLeft, TrendingUp } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function SpecialtiesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withProfessionals: 0,
  });

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await specialtyService.getSpecialties({ limit: 1000 });
        const specialties = response.data || [];
        
        if (Array.isArray(specialties)) {
          const active = specialties.filter(s => s.isActive).length;
          setStats({
            total: specialties.length,
            active,
            withProfessionals: 0, // TODO: Implementar cuando tengamos la relación
          });
        }
      } catch (error) {
        console.error('Error loading specialty stats:', error);
        setStats({ total: 0, active: 0, withProfessionals: 0 });
      }
    };

    loadStats();
  }, [refreshTrigger]);

  const handleCreateSpecialty = () => {
    setSelectedSpecialty(null);
    setViewMode('create');
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setViewMode('edit');
  };

  const handleDeleteSpecialty = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedSpecialty(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSpecialty(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {viewMode === 'list' ? 'Gestión de Especialidades' : 
               viewMode === 'create' ? 'Nueva Especialidad' : 'Editar Especialidad'}
            </h2>
            <p className="text-gray-600">
              {viewMode === 'list' ? 'Administra las especialidades médicas disponibles' :
               viewMode === 'create' ? 'Registra una nueva especialidad médica' :
               'Modifica los datos de la especialidad'}
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
              <Button onClick={handleCreateSpecialty}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Especialidad
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Solo mostrar en vista de lista */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Especialidades</CardTitle>
                <Stethoscope className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Especialidades registradas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <Stethoscope className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Especialidades activas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Especialistas</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withProfessionals}</div>
                <p className="text-xs text-muted-foreground">Con profesionales asignados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'list' && (
          <SpecialtyList
            onEdit={handleEditSpecialty}
            onDelete={handleDeleteSpecialty}
            refreshTrigger={refreshTrigger}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <SpecialtyForm
            specialty={selectedSpecialty || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        )}

        {/* Delete Modal */}
        {specialtyToDelete && (
          <DeleteSpecialtyModal
            specialty={specialtyToDelete}
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSpecialtyToDelete(null);
            }}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
