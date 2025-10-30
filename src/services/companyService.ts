import axios from 'axios';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/company';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class CompanyService {
  private baseURL = `${API_URL}/companies`;

  private getAuthHeaders() {
    const token = localStorage.getItem('sysmedic_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getCompanies(includeInactive = false): Promise<Company[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}?includeInactive=${includeInactive}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener empresas');
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching company:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener empresa');
    }
  }

  async searchCompanies(term: string): Promise<Company[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/search?term=${encodeURIComponent(term)}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error searching companies:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar empresas');
    }
  }

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    try {
      const response = await axios.post(this.baseURL, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      throw new Error(error.response?.data?.message || 'Error al crear empresa');
    }
  }

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error updating company:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar empresa');
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`, this.getAuthHeaders());
    } catch (error: any) {
      console.error('Error deleting company:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar empresa');
    }
  }

  async activateCompany(id: string): Promise<Company> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/${id}/activate`,
        {},
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error activating company:', error);
      throw new Error(error.response?.data?.message || 'Error al activar empresa');
    }
  }
}

export const companyService = new CompanyService();
