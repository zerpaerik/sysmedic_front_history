import axios from 'axios';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class UserService {
  private baseURL = `${API_URL}/users`;

  private getAuthHeaders() {
    const token = localStorage.getItem('sysmedic_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getUsers(includeInactive = false): Promise<User[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}?includeInactive=${includeInactive}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  async searchUsers(term: string): Promise<User[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/search?term=${encodeURIComponent(term)}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar usuarios');
    }
  }

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const response = await axios.post(this.baseURL, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`, this.getAuthHeaders());
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }

  async activateUser(id: string): Promise<User> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/${id}/activate`,
        {},
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error activating user:', error);
      throw new Error(error.response?.data?.message || 'Error al activar usuario');
    }
  }
}

export const userService = new UserService();
