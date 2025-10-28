import axios from 'axios';
import { Professional, CreateProfessionalDto, UpdateProfessionalDto, ProfessionalFilters, ProfessionalsResponse } from '@/types/professional';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ProfessionalService {
  private baseURL = `${API_URL}/professionals`;

  async getProfessionals(filters?: ProfessionalFilters): Promise<ProfessionalsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`${this.baseURL}?${params.toString()}`);
      
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          totalPages: Math.ceil(response.data.length / (filters?.limit || 10))
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching professionals:', error);
      throw error;
    }
  }

  async getProfessionalById(id: string): Promise<Professional> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching professional:', error);
      throw error;
    }
  }

  async getProfessionalsBySpecialty(specialtyId: string): Promise<Professional[]> {
    try {
      const response = await axios.get(`${this.baseURL}/by-specialty/${specialtyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching professionals by specialty:', error);
      throw error;
    }
  }

  async createProfessional(professionalData: CreateProfessionalDto): Promise<Professional> {
    try {
      const response = await axios.post(this.baseURL, professionalData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating professional:', error);
      throw error;
    }
  }

  async updateProfessional(id: string, professionalData: Partial<CreateProfessionalDto>): Promise<Professional> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, professionalData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating professional:', error);
      throw error;
    }
  }

  async deleteProfessional(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting professional:', error);
      throw error;
    }
  }

  async reactivateProfessional(id: string): Promise<Professional> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating professional:', error);
      throw error;
    }
  }

  async searchProfessionals(searchTerm: string): Promise<Professional[]> {
    try {
      const response = await axios.get(`${this.baseURL}/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching professionals:', error);
      throw error;
    }
  }

  async searchProfessionalByLicense(licenseNumber: string): Promise<Professional | null> {
    try {
      const response = await axios.get(`${this.baseURL}/search/license/${licenseNumber}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error searching professional by license:', error);
      throw error;
    }
  }
}

export const professionalService = new ProfessionalService();
