import axios from 'axios';
import { Specialty, CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyFilters, SpecialtiesResponse } from '@/types/specialty';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SpecialtyService {
  private baseURL = `${API_URL}/specialties`;

  async getSpecialties(filters?: SpecialtyFilters): Promise<SpecialtiesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.department) params.append('department', filters.department);
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
      console.error('Error fetching specialties:', error);
      throw error;
    }
  }

  async getSpecialtyById(id: string): Promise<Specialty> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching specialty:', error);
      throw error;
    }
  }

  async getSpecialtyByCode(code: string): Promise<Specialty> {
    try {
      const response = await axios.get(`${this.baseURL}/by-code/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching specialty by code:', error);
      throw error;
    }
  }

  async createSpecialty(specialtyData: CreateSpecialtyDto): Promise<Specialty> {
    try {
      const response = await axios.post(this.baseURL, specialtyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating specialty:', error);
      throw error;
    }
  }

  async updateSpecialty(id: string, specialtyData: Partial<CreateSpecialtyDto>): Promise<Specialty> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, specialtyData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating specialty:', error);
      throw error;
    }
  }

  async deleteSpecialty(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting specialty:', error);
      throw error;
    }
  }

  async reactivateSpecialty(id: string): Promise<Specialty> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating specialty:', error);
      throw error;
    }
  }

  async searchSpecialties(searchTerm: string): Promise<Specialty[]> {
    try {
      const response = await axios.get(`${this.baseURL}/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching specialties:', error);
      throw error;
    }
  }
}

export const specialtyService = new SpecialtyService();
