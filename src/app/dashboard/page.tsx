'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  Clock,
  BarChart3,
  PieChart,
  Award,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { dashboardService, DashboardMetrics } from '@/services/dashboardService';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getTodayMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast.error('Error al cargar las métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadMetrics();
    toast.success('Dashboard actualizado');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando métricas del día...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard - Métricas del Día
            </h2>
            <p className="text-gray-600">
              {dashboardService.getCurrentDateFormatted()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Pacientes Hoy
              </CardTitle>
              <Users className="h-6 w-6 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.totalPatientsToday || 0}</div>
              <div className="flex items-center text-xs text-blue-100 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                Día actual
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Historias Completadas
              </CardTitle>
              <CheckCircle className="h-6 w-6 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.completedRecordsToday || 0}</div>
              <div className="flex items-center text-xs text-green-100 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Completadas hoy
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Con Triaje
              </CardTitle>
              <Stethoscope className="h-6 w-6 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.patientsWithTriage || 0}</div>
              <div className="flex items-center text-xs text-purple-100 mt-1">
                <Activity className="h-3 w-3 mr-1" />
                Triaje realizado
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Sin Triaje
              </CardTitle>
              <AlertCircle className="h-6 w-6 text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.patientsWithoutTriage || 0}</div>
              <div className="flex items-center text-xs text-orange-100 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Pendientes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pacientes por Especialidad */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-blue-600" />
                Pacientes por Especialidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={metrics?.patientsBySpecialty || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ specialty, count }: any) => `${specialty}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metrics?.patientsBySpecialty || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Horas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Pacientes por Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.hourlyDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de Registros y Top Especialistas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado de Registros */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-purple-600" />
                Estado de Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={metrics?.recordStatusDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }: any) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metrics?.recordStatusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Especialistas del Día */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                Top Especialistas del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(metrics?.topProfessionalsToday || []).length > 0 ? (
                  metrics?.topProfessionalsToday.map((professional, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{professional.name}</p>
                          <p className="text-sm text-gray-600">{professional.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{professional.patientsAttended}</p>
                        <p className="text-xs text-gray-500">pacientes</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay datos de especialistas para hoy</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen Rápido */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
              Resumen del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((metrics?.patientsWithTriage || 0) / Math.max(metrics?.totalPatientsToday || 1, 1) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Pacientes con Triaje</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((metrics?.completedRecordsToday || 0) / Math.max(metrics?.totalPatientsToday || 1, 1) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Historias Completadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics?.patientsBySpecialty?.length || 0}
                </div>
                <p className="text-sm text-gray-600 mt-1">Especialidades Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
