'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Stethoscope, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { medicalRecordService } from '@/services/medicalRecordService';
import { MedicalRecord, MedicalRecordFilters, MedicalRecordStatus } from '@/types/medicalRecord';

interface MedicalRecordListProps {
  onEdit?: (medicalRecord: MedicalRecord) => void;
  onTriage?: (medicalRecord: MedicalRecord) => void;
  onDelete?: (medicalRecord: MedicalRecord) => void;
  onMedicalHistoryBase?: (medicalRecord: MedicalRecord) => void;
  onSpecialtyHistory?: (medicalRecord: MedicalRecord) => void;
  onCompletionStatus?: (medicalRecord: MedicalRecord) => void;
  refreshTrigger?: number;
}

const MedicalRecordList: React.FC<MedicalRecordListProps> = ({
  onEdit,
  onTriage,
  onDelete,
  onMedicalHistoryBase,
  onSpecialtyHistory,
  onCompletionStatus,
  refreshTrigger
}) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState<MedicalRecordFilters>({
    page: 1,
    limit: 10,
    isActive: true
  });
  
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para filtros UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MedicalRecordStatus | ''>('');
  const [triageFilter, setTriageFilter] = useState<'with' | 'without' | ''>('');

  useEffect(() => {
    loadMedicalRecords();
  }, [filters, refreshTrigger]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicalRecordService.getMedicalRecords(filters);
      
      if (response) {
        // La respuesta siempre debe ser de tipo MedicalRecordsResponse
        if ('data' in response && Array.isArray(response.data)) {
          setMedicalRecords(response.data);
          setTotalItems(response.total);
          setTotalPages(response.totalPages);
          setCurrentPage(response.page);
        } else if (Array.isArray(response)) {
          // Fallback para respuesta directa como array
          setMedicalRecords(response as MedicalRecord[]);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / (filters.limit || 10)));
          setCurrentPage(1);
        } else {
          console.warn('Unexpected response format:', response);
          setMedicalRecords([]);
          setTotalItems(0);
          setTotalPages(1);
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      setError('Error al cargar las historias clínicas');
      setMedicalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({
      ...prev,
      search: term || undefined,
      page: 1
    }));
  };

  const handleStatusFilter = (status: MedicalRecordStatus | '') => {
    setStatusFilter(status);
    setFilters(prev => ({
      ...prev,
      status: status || undefined,
      page: 1
    }));
  };

  const handleTriageFilter = (filter: 'with' | 'without' | '') => {
    setTriageFilter(filter);
    setFilters(prev => ({
      ...prev,
      hasTriageData: filter === 'with' ? true : filter === 'without' ? false : undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status: MedicalRecordStatus) => {
    const statusConfig = {
      [MedicalRecordStatus.PENDING]: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      [MedicalRecordStatus.IN_PROGRESS]: { label: 'En Proceso', className: 'bg-blue-100 text-blue-800' },
      [MedicalRecordStatus.COMPLETED]: { label: 'Completada', className: 'bg-green-100 text-green-800' },
      [MedicalRecordStatus.CANCELLED]: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const hasTriageData = (medicalRecord: MedicalRecord): boolean => {
    return !!(medicalRecord.triage && (
      medicalRecord.triage.weight ||
      medicalRecord.triage.height ||
      medicalRecord.triage.bloodPressure ||
      medicalRecord.triage.oxygenSaturation ||
      medicalRecord.triage.heartRate ||
      medicalRecord.triage.temperature ||
      medicalRecord.triage.observations
    ));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-PE');
  };

  const formatTime = (time: string) => {
    return time || '--:--';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando historias clínicas...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Buscar por paciente, DNI, N° historia..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <select
              onChange={(e) => handleStatusFilter(e.target.value as MedicalRecordStatus || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value={MedicalRecordStatus.PENDING}>Pendientes</option>
              <option value={MedicalRecordStatus.IN_PROGRESS}>En Proceso</option>
              <option value={MedicalRecordStatus.COMPLETED}>Completadas</option>
              <option value={MedicalRecordStatus.CANCELLED}>Canceladas</option>
            </select>
          </div>

          <div>
            <select
              onChange={(e) => handleTriageFilter(e.target.value as 'with' | 'without' || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos (Triaje)</option>
              <option value="with">Con Triaje</option>
              <option value="without">Sin Triaje</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {totalItems} registro{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Card>

      {/* Lista de Historias Clínicas */}
      <div className="space-y-4">
        {error && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {medicalRecords.length === 0 && !loading ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay historias clínicas</h3>
              <p>No se encontraron historias clínicas con los filtros aplicados.</p>
            </div>
          </Card>
        ) : (
          medicalRecords.map((medicalRecord) => (
            <Card key={medicalRecord.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Información Principal */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        HC-{medicalRecord.recordNumber}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {medicalRecord.patient.firstName} {medicalRecord.patient.firstLastname}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {medicalRecord.specialty.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(medicalRecord.status)}
                      {hasTriageData(medicalRecord) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Con Triaje
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Sin Triaje
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información de Cita - Simplificada */}
                  {medicalRecord.appointmentDate && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(medicalRecord.appointmentDate)}
                      </span>
                    </div>
                  )}

                  {/* Información de Triaje - Compacta */}
                  {hasTriageData(medicalRecord) && medicalRecord.triage && (
                    <div className="bg-green-50 p-2 rounded-md mb-2">
                      <div className="grid grid-cols-4 gap-2 text-xs text-green-800">
                        {medicalRecord.triage.weight && (
                          <span>Peso: {medicalRecord.triage.weight}</span>
                        )}
                        {medicalRecord.triage.height && (
                          <span>Talla: {medicalRecord.triage.height}</span>
                        )}
                        {medicalRecord.triage.bloodPressure && (
                          <span>TA: {medicalRecord.triage.bloodPressure}</span>
                        )}
                        {medicalRecord.triage.oxygenSaturation && (
                          <span>Sat: {medicalRecord.triage.oxygenSaturation}%</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información Adicional - Mínima */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      DNI: {medicalRecord.patient.identificationNumber}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 ml-4">
                  {/* Solo mostrar botones si NO está completado */}
                  {medicalRecord.status !== MedicalRecordStatus.COMPLETED ? (
                    <>
                      <div className="flex items-center gap-1">
                        {onTriage && (
                          <Button
                            onClick={() => onTriage(medicalRecord)}
                            size="sm"
                            className={`px-3 py-1 text-xs ${
                              hasTriageData(medicalRecord)
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            {hasTriageData(medicalRecord) ? 'Triaje' : 'Triaje'}
                          </Button>
                        )}
                        
                        {onEdit && (
                          <Button
                            onClick={() => onEdit(medicalRecord)}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-xs"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {onDelete && (
                          <Button
                            onClick={() => onDelete(medicalRecord)}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Botón para Historia Clínica Completa - Solo si ya tiene triaje */}
                      {hasTriageData(medicalRecord) && onMedicalHistoryBase && (
                        <Button
                          onClick={() => onMedicalHistoryBase(medicalRecord)}
                          size="sm"
                          className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 w-full"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Historia Completa
                        </Button>
                      )}
                    </>
                  ) : (
                    /* No mostrar botones cuando está completado - el badge "Completada" en la parte superior ya indica el estado */
                    <div className="flex items-center justify-center w-full text-xs text-gray-500">
                      <span className="italic">Historia completada</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * (filters.limit || 10)) + 1} - {Math.min(currentPage * (filters.limit || 10), totalItems)} de {totalItems} registros
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedicalRecordList;
