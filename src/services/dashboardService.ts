import axios from 'axios';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DashboardMetrics {
  totalPatientsToday: number;
  patientsBySpecialty: Array<{
    specialty: string;
    count: number;
    color: string;
  }>;
  completedRecordsToday: number;
  patientsWithTriage: number;
  patientsWithoutTriage: number;
  topProfessionalsToday: Array<{
    name: string;
    specialty: string;
    patientsAttended: number;
    avatar?: string;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    patients: number;
  }>;
  recordStatusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

class DashboardService {
  private baseURL = `${API_URL}`;

  async getTodayMetrics(): Promise<DashboardMetrics> {
    try {
      const token = localStorage.getItem('sysmedic_token');
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      const today = new Date();
      const startDate = format(startOfDay(today), 'yyyy-MM-dd');
      const endDate = format(endOfDay(today), 'yyyy-MM-dd');

      // Obtener todas las historias clínicas del día
      const medicalRecordsResponse = await axios.get(`${this.baseURL}/medical-records`, {
        params: {
          appointmentDate: startDate,
          limit: 1000 // Obtener todos los registros del día
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const todayRecords = medicalRecordsResponse.data.data || medicalRecordsResponse.data || [];

      // Obtener todos los pacientes
      const patientsResponse = await axios.get(`${this.baseURL}/patients`, {
        params: {
          limit: 1000
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const allPatients = patientsResponse.data.data || patientsResponse.data || [];

      // Obtener todas las especialidades
      const specialtiesResponse = await axios.get(`${this.baseURL}/specialties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const specialties = specialtiesResponse.data.data || specialtiesResponse.data || [];

      // Obtener todos los profesionales
      const professionalsResponse = await axios.get(`${this.baseURL}/professionals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const professionals = professionalsResponse.data.data || professionalsResponse.data || [];

      return this.processMetrics(todayRecords, allPatients, specialties, professionals);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Retornar métricas vacías en caso de error
      return this.getEmptyMetrics();
    }
  }

  private processMetrics(
    todayRecords: any[], 
    allPatients: any[], 
    specialties: any[], 
    professionals: any[]
  ): DashboardMetrics {
    // Colores para las gráficas
    const specialtyColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    const statusColors = {
      'PENDING': '#F59E0B',
      'IN_PROGRESS': '#3B82F6', 
      'COMPLETED': '#10B981',
      'CANCELLED': '#EF4444'
    };

    // 1. Total de pacientes atendidos hoy
    const totalPatientsToday = todayRecords.length;

    // 2. Pacientes por especialidad
    const specialtyCount = new Map();
    todayRecords.forEach(record => {
      const specialtyName = record.specialty?.name || 'Sin especialidad';
      specialtyCount.set(specialtyName, (specialtyCount.get(specialtyName) || 0) + 1);
    });

    const patientsBySpecialty = Array.from(specialtyCount.entries())
      .map(([specialty, count], index) => ({
        specialty,
        count: count as number,
        color: specialtyColors[index % specialtyColors.length]
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Historias completadas hoy
    const completedRecordsToday = todayRecords.filter(
      record => record.status === 'COMPLETED'
    ).length;

    // 4. Pacientes con y sin triaje
    const patientsWithTriage = todayRecords.filter(record => 
      record.triage && (
        record.triage.weight || 
        record.triage.height || 
        record.triage.bloodPressure || 
        record.triage.oxygenSaturation
      )
    ).length;
    const patientsWithoutTriage = totalPatientsToday - patientsWithTriage;

    // 5. Top especialistas del día
    const professionalCount = new Map();
    todayRecords.forEach(record => {
      const professionalId = record.professional?.id;
      if (professionalId) {
        const current = professionalCount.get(professionalId) || {
          name: `${record.professional.firstName} ${record.professional.firstLastname}`,
          specialty: record.specialty?.name || 'Sin especialidad',
          patientsAttended: 0
        };
        current.patientsAttended++;
        professionalCount.set(professionalId, current);
      }
    });

    const topProfessionalsToday = Array.from(professionalCount.values())
      .sort((a, b) => b.patientsAttended - a.patientsAttended)
      .slice(0, 5); // Top 5 especialistas

    // 6. Distribución por horas (simulada para el día actual)
    const hourlyDistribution = this.generateHourlyDistribution(todayRecords);

    // 7. Distribución por estado de registros
    const statusCount = new Map();
    todayRecords.forEach(record => {
      const status = record.status || 'PENDING';
      statusCount.set(status, (statusCount.get(status) || 0) + 1);
    });

    const recordStatusDistribution = Array.from(statusCount.entries())
      .map(([status, count]) => ({
        status: this.translateStatus(status),
        count: count as number,
        color: statusColors[status as keyof typeof statusColors] || '#6B7280'
      }));

    return {
      totalPatientsToday,
      patientsBySpecialty,
      completedRecordsToday,
      patientsWithTriage,
      patientsWithoutTriage,
      topProfessionalsToday,
      hourlyDistribution,
      recordStatusDistribution
    };
  }

  private generateHourlyDistribution(records: any[]): Array<{hour: string, patients: number}> {
    const hourCounts = new Map();
    
    // Inicializar todas las horas del día
    for (let i = 8; i <= 18; i++) {
      hourCounts.set(i, 0);
    }

    // Contar registros por hora (simulado basado en createdAt)
    records.forEach(record => {
      if (record.createdAt) {
        const hour = new Date(record.createdAt).getHours();
        if (hour >= 8 && hour <= 18) {
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      }
    });

    return Array.from(hourCounts.entries())
      .map(([hour, patients]) => ({
        hour: `${hour}:00`,
        patients: patients as number
      }));
  }

  private translateStatus(status: string): string {
    const translations = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Proceso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return translations[status as keyof typeof translations] || status;
  }

  private getEmptyMetrics(): DashboardMetrics {
    return {
      totalPatientsToday: 0,
      patientsBySpecialty: [],
      completedRecordsToday: 0,
      patientsWithTriage: 0,
      patientsWithoutTriage: 0,
      topProfessionalsToday: [],
      hourlyDistribution: [],
      recordStatusDistribution: []
    };
  }

  // Método para obtener fecha actual formateada
  getCurrentDateFormatted(): string {
    return format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  }
}

export const dashboardService = new DashboardService();
