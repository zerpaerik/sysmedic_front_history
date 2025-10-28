import axios from 'axios';
import { 
  MedicalHistoryBase, 
  SpecialtyMedicalHistory, 
  CompletionStatus,
  CreateMedicalHistoryBaseDto,
  CreateSpecialtyMedicalHistoryDto
} from '@/types/medicalHistory';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class MedicalHistoryService {
  private static baseURL = `${API_URL}/medical-records`;
  // === SERVICIOS PARA ANTECEDENTES (HISTORIAL BASE) ===

  static async createMedicalHistoryBase(
    medicalRecordId: string, 
    data: CreateMedicalHistoryBaseDto
  ): Promise<MedicalHistoryBase> {
    const response = await axios.post(`${this.baseURL}/${medicalRecordId}/medical-history-base`, data);
    return response.data;
  }

  static async getMedicalHistoryBase(medicalRecordId: string): Promise<MedicalHistoryBase> {
    const response = await axios.get(`${this.baseURL}/${medicalRecordId}/medical-history-base`);
    return response.data;
  }

  static async updateMedicalHistoryBase(
    medicalRecordId: string, 
    data: Partial<CreateMedicalHistoryBaseDto>
  ): Promise<MedicalHistoryBase> {
    const response = await axios.patch(`${this.baseURL}/${medicalRecordId}/medical-history-base`, data);
    return response.data;
  }

  // === SERVICIOS PARA HISTORIA CLÍNICA POR ESPECIALIDAD ===

  static async createSpecialtyMedicalHistory(
    medicalRecordId: string, 
    data: CreateSpecialtyMedicalHistoryDto
  ): Promise<SpecialtyMedicalHistory> {
    const response = await axios.post(`${this.baseURL}/${medicalRecordId}/specialty-history`, data);
    return response.data;
  }

  static async getSpecialtyMedicalHistory(medicalRecordId: string): Promise<SpecialtyMedicalHistory> {
    const response = await axios.get(`${this.baseURL}/${medicalRecordId}/specialty-history`);
    return response.data;
  }

  static async updateSpecialtyMedicalHistory(
    medicalRecordId: string, 
    data: Partial<CreateSpecialtyMedicalHistoryDto>
  ): Promise<SpecialtyMedicalHistory> {
    const response = await axios.patch(`${this.baseURL}/${medicalRecordId}/specialty-history`, data);
    return response.data;
  }

  // === SERVICIOS PARA ESTADO DE COMPLETITUD ===

  static async getCompletionStatus(medicalRecordId: string): Promise<CompletionStatus> {
    const response = await axios.get(`${this.baseURL}/${medicalRecordId}/completion-status`);
    return response.data;
  }

  // === SERVICIO PARA FINALIZAR HISTORIA CLÍNICA ===

  static async finalizeRecord(medicalRecordId: string): Promise<any> {
    const response = await axios.patch(`${this.baseURL}/${medicalRecordId}/finalize`);
    return response.data;
  }
}
