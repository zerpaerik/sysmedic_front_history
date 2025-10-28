import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface MedicalSuggestions {
  differentialDiagnosis: string[];
  recommendedTests: string[];
  treatmentSuggestions: string[];
  redFlags: string[];
  physicalExamFocus: string[];
  followUpRecommendations: string[];
}

export interface MedicalSuggestionsRequest {
  symptoms: string;
  specialty: string;
  patientAge?: number;
  patientGender?: string;
  currentFindings?: string;
  vitalSigns?: string;
}

class AIService {
  private baseURL = `${API_URL}`;

  async generateMedicalSuggestions(request: MedicalSuggestionsRequest): Promise<MedicalSuggestions> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      const response = await axios.post(
        `${this.baseURL}/ai/medical-suggestions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al generar sugerencias médicas');
      }
    } catch (error) {
      console.error('Error generating medical suggestions:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
