import axios from 'axios';
import { Patient, CreatePatientDto, UpdatePatientDto, PatientFilters, PatientsResponse } from '@/types/patient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class PatientService {
  private baseURL = `${API_URL}/patients`;

  async getPatients(filters?: PatientFilters): Promise<PatientsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.civilStatus) params.append('civilStatus', filters.civilStatus);
      if (filters?.educationLevel) params.append('educationLevel', filters.educationLevel);
      if (filters?.identificationType) params.append('identificationType', filters.identificationType);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`${this.baseURL}?${params.toString()}`);
      
      console.log('=== PATIENTS API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      console.log('Data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // Si el backend devuelve un objeto con una propiedad data, extraerla
      if (response.data && typeof response.data === 'object' && response.data.data) {
        console.log('Found nested data property:', response.data.data);
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patient> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async searchByDni(dni: string): Promise<Patient | null> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      const response = await axios.get(`${this.baseURL}/search?q=${dni}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error searching patient by DNI:', error);
      return null;
    }
  }

  async createPatient(patientData: CreatePatientDto): Promise<Patient> {
    try {
      const response = await axios.post(this.baseURL, patientData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating patient:', error);
      throw new Error(error.response?.data?.message || 'Error al crear paciente');
    }
  }

  async updatePatient(id: string, patientData: UpdatePatientDto): Promise<Patient> {
    try {
      console.log('Updating patient with ID:', id);
      console.log('Patient data to send:', patientData);
      console.log('Data keys:', Object.keys(patientData));
      
      const response = await axios.patch(`${this.baseURL}/${id}`, patientData);
      
      console.log('Update patient response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Error al actualizar paciente');
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async searchPatientByDni(dni: string): Promise<Patient | null> {
    try {
      const response = await axios.get(`${this.baseURL}/search/dni/${dni}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error searching patient by DNI:', error);
      throw error;
    }
  }

  // Utility method to calculate age from birth date (backend already provides age)
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Utility method to format patient full name (backend already provides fullName)
  getFullName(patient: Patient): string {
    // Use backend provided fullName if available, otherwise construct it
    if (patient.fullName) {
      return patient.fullName;
    }
    
    const names = [
      patient.firstName,
      patient.secondName,
      patient.firstLastname,
      patient.secondLastname
    ].filter(Boolean);
    
    return names.join(' ');
  }

  // Utility method to format identification (backend already provides fullIdentification)
  getFormattedIdentification(patient: Patient): string {
    // Use backend provided fullIdentification if available
    if (patient.fullIdentification) {
      return patient.fullIdentification;
    }
    
    // Fallback to manual formatting
    const typeMap: { [key: string]: string } = {
      'DNI': 'DNI',
      'cedula': 'C.I.',
      'pasaporte': 'Pasaporte',
      'extranjeria': 'Extranjería'
    };
    
    const displayType = typeMap[patient.identificationType] || patient.identificationType;
    return `${displayType}: ${patient.identificationNumber}`;
  }
}

export const patientService = new PatientService();
