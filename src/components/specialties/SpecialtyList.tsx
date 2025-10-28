'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Specialty, SpecialtyFilters } from '@/types/specialty';
import { specialtyService } from '@/services/specialtyService';
import { Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, Building2 } from 'lucide-react';

interface SpecialtyListProps {
  onEdit?: (specialty: Specialty) => void;
  onView?: (specialty: Specialty) => void;
  onDelete?: (specialty: Specialty) => void;
  refreshTrigger?: number;
}

export function SpecialtyList({ onEdit, onView, onDelete, refreshTrigger }: SpecialtyListProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SpecialtyFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await specialtyService.getSpecialties(filters);
      
      // Manejar diferentes estructuras de respuesta
      let specialtiesData: Specialty[] = [];
      let totalCount = 0;
      let totalPagesCount = 1;
      
      if (Array.isArray(response)) {
        specialtiesData = response;
        totalCount = response.length;
        totalPagesCount = Math.ceil(totalCount / (filters.limit || 10));
      } else if (response && response.data && Array.isArray(response.data)) {
        specialtiesData = response.data;
        totalCount = response.total || response.data.length;
        totalPagesCount = response.totalPages || Math.ceil(totalCount / (filters.limit || 10));
      }
      
      setSpecialties(specialtiesData);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
    } catch (err: any) {
      console.error('Error loading specialties:', err);
      setError('Error al cargar las especialidades');
      setSpecialties([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, [filters, refreshTrigger]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof SpecialtyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando especialidades...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  name="search"
                  type="text"
                  placeholder="Nombre o código..."
                  defaultValue={filters.search}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por departamento..."
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.isActive?.toString() || ''}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ page: 1, limit: 10, search: '' });
                  const form = document.querySelector('form') as HTMLFormElement;
                  form?.reset();
                }}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de especialidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Especialidades ({total})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {specialties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron especialidades
            </div>
          ) : (
            <div className="space-y-4">
              {specialties.map((specialty) => (
                <div
                  key={specialty.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {specialty.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {specialty.code}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          specialty.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {specialty.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {specialty.department && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Departamento:</strong> {specialty.department}
                        </p>
                      )}
                      
                      {specialty.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {specialty.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Creado: {new Date(specialty.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(specialty)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(specialty)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(specialty)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando {((filters.page || 1) - 1) * (filters.limit || 10) + 1} a{' '}
            {Math.min((filters.page || 1) * (filters.limit || 10), total)} de {total} especialidades
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={filters.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-2 text-sm">
              Página {filters.page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={filters.page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
