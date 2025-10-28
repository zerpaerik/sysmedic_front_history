'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Professional, 
  ProfessionalFilters, 
  ProfessionalStatus,
  IdentificationType
} from '@/types/professional';
import { professionalService } from '@/services/professionalService';
import { 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Badge,
  MapPin,
  Stethoscope
} from 'lucide-react';

interface ProfessionalListProps {
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  refreshTrigger: number;
}

export function ProfessionalList({ onEdit, onDelete, refreshTrigger }: ProfessionalListProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<ProfessionalFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    specialtyId: undefined,
  });

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await professionalService.getProfessionals(filters);
      
      if (response) {
        // La respuesta siempre debe ser de tipo ProfessionalsResponse
        if ('data' in response && Array.isArray(response.data)) {
          setProfessionals(response.data);
          setTotalItems(response.total);
          setTotalPages(response.totalPages);
          setCurrentPage(response.page);
        } else if (Array.isArray(response)) {
          // Fallback para respuesta directa como array
          setProfessionals(response as Professional[]);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / (filters.limit || 10)));
          setCurrentPage(1);
        } else {
          console.warn('Unexpected response format:', response);
          setProfessionals([]);
          setTotalItems(0);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else {
        setProfessionals([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
      setError('Error al cargar los profesionales');
      setProfessionals([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, [filters, refreshTrigger]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    setCurrentPage(newPage);
  };

  const handleStatusFilter = (status: ProfessionalStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1
    }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ProfessionalStatus) => {
    const statusConfig = {
      [ProfessionalStatus.ACTIVE]: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      [ProfessionalStatus.INACTIVE]: { label: 'Inactivo', className: 'bg-red-100 text-red-800' },
      [ProfessionalStatus.SUSPENDED]: { label: 'Suspendido', className: 'bg-yellow-100 text-yellow-800' },
      [ProfessionalStatus.RETIRED]: { label: 'Retirado', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getIdentificationTypeLabel = (type: IdentificationType) => {
    const typeLabels = {
      [IdentificationType.DNI]: 'DNI',
      [IdentificationType.PASAPORTE]: 'Pasaporte',
      [IdentificationType.CARNET_EXTRANJERIA]: 'C. Extranjería',
      [IdentificationType.CEDULA]: 'Cédula',
    };
    return typeLabels[type] || type;
  };



  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando profesionales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProfessionals} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profesionales Médicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros y Búsqueda */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, identificación o licencia..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <select
              onChange={(e) => handleStatusFilter(e.target.value as ProfessionalStatus || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value={ProfessionalStatus.ACTIVE}>Activos</option>
              <option value={ProfessionalStatus.INACTIVE}>Inactivos</option>
              <option value={ProfessionalStatus.SUSPENDED}>Suspendidos</option>
              <option value={ProfessionalStatus.RETIRED}>Retirados</option>
            </select>
          </div>
        </div>

        {/* Lista de Profesionales */}
        {professionals.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron profesionales</p>
            <p className="text-sm text-gray-500">
              {filters.search ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando un nuevo profesional'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Información Principal */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {professional.firstName} {professional.secondName} {professional.firstLastname} {professional.secondLastname}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Badge className="w-4 h-4" />
                            {getIdentificationTypeLabel(professional.identificationType)}: {professional.identificationNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Lic: {professional.licenseNumber}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(professional.status)}
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{professional.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{professional.phone}</span>
                      </div>
                      {professional.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{professional.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Especialidades */}
                    {professional.specialties && professional.specialties.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <div className="flex flex-wrap gap-1">
                          {professional.specialties.map((specialty) => (
                            <span
                              key={specialty.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                            >
                              {specialty.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Información Adicional */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {professional.licenseExpiryDate && (
                        <span>
                          Licencia expira: {new Date(professional.licenseExpiryDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Registrado: {new Date(professional.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(professional)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDelete(professional)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * (filters.limit || 10)) + 1} a{' '}
              {Math.min(currentPage * (filters.limit || 10), totalItems)} de {totalItems} profesionales
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Anterior
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
