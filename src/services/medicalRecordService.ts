import axios from 'axios';
import { 
  MedicalRecord, 
  CreateMedicalRecordDto, 
  UpdateMedicalRecordDto, 
  MedicalRecordFilters, 
  MedicalRecordsResponse,
  PatientSearchResult,
  CreateTriageDto
} from '@/types/medicalRecord';
import { Patient } from '@/types/patient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class MedicalRecordService {
  private baseURL = `${API_URL}/medical-records`;
  private patientsURL = `${API_URL}/patients`;

  // Buscar paciente por DNI
  async searchPatientByDNI(dni: string): Promise<PatientSearchResult> {
    try {
      console.log('=== BÚSQUEDA DE PACIENTE POR DNI ===');
      console.log('DNI buscado:', dni);
      console.log('URL de búsqueda:', `${this.patientsURL}/search?q=${dni}`);
      
      // Verificar si hay token disponible
      const token = localStorage.getItem('sysmedic_token');
      console.log('Token disponible:', !!token);
      if (token) {
        console.log('Token length:', token.length);
      }
      
      const response = await axios.get(`${this.patientsURL}/search?q=${dni}`);
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Data type:', typeof response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const patient = response.data[0];
        console.log('Paciente encontrado:', patient);
        return {
          found: true,
          patient: patient
        };
      } else {
        console.log('No se encontró paciente con DNI:', dni);
        return {
          found: false,
          patient: undefined
        };
      }
    } catch (error: any) {
      console.error('Error en búsqueda de paciente:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        return {
          found: false,
          patient: undefined
        };
      }
      
      throw new Error(error.response?.data?.message || 'Error al buscar paciente');
    }
  }

  // Obtener historias clínicas por paciente ID
  async getMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
      // Usar el endpoint principal con filtro de patientId
      const response = await this.getMedicalRecords({ patientId });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching medical records by patient:', error);
      throw error;
    }
  }

  // Obtener antecedentes médicos
  async getMedicalHistory(medicalRecordId: string): Promise<any> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      const response = await axios.get(`${this.baseURL}/${medicalRecordId}/medical-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching medical history:', error);
      throw error;
    }
  }

  // Obtener historia clínica por especialidad
  async getSpecialtyMedicalHistory(medicalRecordId: string): Promise<any> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      const response = await axios.get(`${this.baseURL}/${medicalRecordId}/specialty-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching specialty medical history:', error);
      throw error;
    }
  }

  // Obtener historias clínicas con filtros
  async getMedicalRecords(filters?: MedicalRecordFilters): Promise<MedicalRecordsResponse> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters?.professionalId) params.append('professionalId', filters.professionalId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`${this.baseURL}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          limit: response.data.length,
          totalPages: 1
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  }

  // Obtener historia clínica por ID
  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  }

  // Crear nueva historia clínica
  async createMedicalRecord(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }

  // Actualizar historia clínica
  async updateMedicalRecord(id: string, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }

  // Actualizar solo el triaje de una historia clínica
  async updateTriageData(id: string, triageData: CreateTriageDto): Promise<MedicalRecord> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/triage`, triageData);
      return response.data;
    } catch (error) {
      console.error('Error updating triage data:', error);
      throw error;
    }
  }

  // Eliminar historia clínica (eliminación lógica)
  async deleteMedicalRecord(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }

  // Obtener estadísticas de historias clínicas
  async getMedicalRecordsStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    withTriage: number;
    withoutTriage: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      return {
        ...response.data,
        inProgress: response.data.inProgress || 0 // Add default value if backend doesn't provide it
      };
    } catch (error) {
      console.error('Error fetching medical records stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        withTriage: 0,
        withoutTriage: 0
      };
    }
  }

  // Obtener historias clínicas por profesional
  async getMedicalRecordsByProfessional(professionalId: string): Promise<MedicalRecord[]> {
    try {
      const response = await axios.get(`${this.baseURL}/professional/${professionalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records by professional:', error);
      throw error;
    }
  }

  // Obtener historias clínicas por especialidad
  async getMedicalRecordsBySpecialty(specialtyId: string): Promise<MedicalRecord[]> {
    try {
      const response = await axios.get(`${this.baseURL}/specialty/${specialtyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records by specialty:', error);
      throw error;
    }
  }
}

export const medicalRecordService = new MedicalRecordService();
