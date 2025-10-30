import axios from 'axios';
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto } from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SubscriptionService {
  private baseURL = `${API_URL}/subscriptions`;

  private getAuthHeaders() {
    const token = localStorage.getItem('sysmedic_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getSubscriptions(includeInactive = false): Promise<Subscription[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}?includeInactive=${includeInactive}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener suscripciones');
    }
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener suscripción');
    }
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    try {
      const response = await axios.post(this.baseURL, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error(error.response?.data?.message || 'Error al crear suscripción');
    }
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data, this.getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar suscripción');
    }
  }

  async deleteSubscription(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`, this.getAuthHeaders());
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar suscripción');
    }
  }

  async activateSubscription(id: string): Promise<Subscription> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/${id}/activate`,
        {},
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error activating subscription:', error);
      throw new Error(error.response?.data?.message || 'Error al activar suscripción');
    }
  }
}

export const subscriptionService = new SubscriptionService();
