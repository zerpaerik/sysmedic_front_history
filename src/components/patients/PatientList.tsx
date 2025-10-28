'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient, PatientFilters } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onView?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  refreshTrigger?: number;
}

export function PatientList({ onEdit, onView, onDelete, refreshTrigger }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PatientFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatients(filters);
      
      console.log('PatientList - Response received:', response);
      
      // Manejar diferentes estructuras de respuesta
      let patientsData: Patient[] = [];
      let totalCount = 0;
      let totalPagesCount = 1;
      
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        patientsData = response;
        totalCount = response.length;
        totalPagesCount = Math.ceil(totalCount / (filters.limit || 10));
      } else if (response && response.data && Array.isArray(response.data)) {
        // Si la respuesta tiene una propiedad data con el array
        patientsData = response.data;
        totalCount = response.total || response.data.length;
        totalPagesCount = response.totalPages || Math.ceil(totalCount / (filters.limit || 10));
      } else {
        console.warn('Unexpected response structure:', response);
      }
      
      setPatients(patientsData);
      setTotalPages(totalPagesCount);
      setTotal(totalCount);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
      setPatients([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [filters, refreshTrigger]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof PatientFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading && patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPatients} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Buscar por nombre, DNI o email..."
                    defaultValue={filters.search}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button type="submit">Buscar</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.civilStatus || ''}
                onChange={(e) => handleFilterChange('civilStatus', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados civiles</option>
                <option value="soltero">Soltero(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viudo">Viudo(a)</option>
                <option value="union_libre">Unión Libre</option>
              </select>

              <select
                value={filters.educationLevel || ''}
                onChange={(e) => handleFilterChange('educationLevel', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los niveles educativos</option>
                <option value="ninguno">Ninguno</option>
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
                <option value="tecnico">Técnico</option>
                <option value="universitario">Universitario</option>
                <option value="postgrado">Postgrado</option>
              </select>

              <select
                value={filters.identificationType || ''}
                onChange={(e) => handleFilterChange('identificationType', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos de ID</option>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="extranjeria">Extranjería</option>
              </select>

              <select
                value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando {patients.length} de {total} pacientes
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Página {filters.page} de {totalPages}</span>
        </div>
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron pacientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre Completo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Identificación</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Edad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contacto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Estado Civil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {patientService.getFullName(patient)}
                          </div>
                          {patient.email && (
                            <div className="text-sm text-gray-500">{patient.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {patientService.getFormattedIdentification(patient)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {patientService.calculateAge(patient.birthDate)} años
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {patient.phone || 'No registrado'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm capitalize">
                          {patient.maritalStatus || 'No especificado'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            patient.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {patient.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {onView && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onView(patient)}
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEdit(patient)}
                              className="p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDelete(patient)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page! - 1)}
            disabled={filters.page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={filters.page === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page! + 1)}
            disabled={filters.page === totalPages || loading}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
