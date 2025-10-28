import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TranscriptionResponse {
  success: boolean;
  data?: {
    transcription: string;
    originalFilename: string;
    fileSize: number;
    language: string;
  };
  error?: string;
}

export const transcriptionService = {
  /**
   * Transcribe audio file using Whisper AI
   */
  async transcribeAudio(audioBlob: Blob, language: string = 'es'): Promise<TranscriptionResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);

      const response = await axios.post(
        `${API_BASE_URL}/ai/transcribe`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for audio processing
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al transcribir audio:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response?.status === 413) {
        throw new Error('El archivo de audio es demasiado grande. Máximo 25MB.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Formato de audio no válido. Use WebM, MP4, MP3, WAV u OGG.');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('La transcripción tomó demasiado tiempo. Intenta con un archivo más corto.');
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Error al transcribir el audio'
      );
    }
  },

  /**
   * Check if browser supports audio recording
   */
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  /**
   * Get user media for audio recording
   */
  async getUserMedia(): Promise<MediaStream> {
    if (!this.isRecordingSupported()) {
      throw new Error('Tu navegador no soporta grabación de audio');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
      }
      if (error.name === 'NotFoundError') {
        throw new Error('No se encontró micrófono. Verifica que tu dispositivo tenga micrófono.');
      }
      throw new Error('Error al acceder al micrófono: ' + error.message);
    }
  }
};
