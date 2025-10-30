'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Company } from '@/types/company';
import { companyService } from '@/services/companyService';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { authService } from '@/lib/auth';
import { Plus, ArrowLeft, Search, Building2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'edit';

export default function CompaniesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withSubscription: 0,
    expiringSoon: 0,
  });

  // Verificar permisos de ADMIN
  useEffect(() => {
    const user = authService.getUser();
    if (!user || user.role !== 'admin') {
      toast.error('No tienes permisos para acceder a esta sección');
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanies(true);
      setCompanies(data);
      
      // Calculate stats
      const active = data.filter(c => c.isActive).length;
      const withSubscription = data.filter(c => c.subscription && c.isSubscriptionActive).length;
      const expiringSoon = data.filter(c => c.daysRemaining > 0 && c.daysRemaining <= 30).length;
      
      setStats({
        total: data.length,
        active,
        withSubscription,
        expiringSoon,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setViewMode('create');
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta empresa?')) return;
    
    try {
      await companyService.deleteCompany(id);
      toast.success('Empresa desactivada exitosamente');
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar empresa');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await companyService.activateCompany(id);
      toast.success('Empresa activada exitosamente');
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar empresa');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCompany(null);
    loadCompanies();
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ruc.includes(searchTerm) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {viewMode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
              </h2>
            </div>
          </div>

          <CompanyForm
            company={selectedCompany}
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Empresas</h2>
            <p className="text-gray-600">Gestiona las empresas clientes y sus suscripciones</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Suscripción</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withSubscription}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, RUC o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Building2 className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No se encontraron empresas' : 'No hay empresas registradas'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Empresa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{company.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {company.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p className="font-medium text-gray-700">RUC</p>
                          <p>{company.ruc}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Contacto</p>
                          <p>{company.contactPerson || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Email</p>
                          <p>{company.email || 'N/A'}</p>
                        </div>
                      </div>

                      {company.subscription && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Suscripción</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {company.subscription.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {company.subscription.formattedPrice} / {company.subscription.durationDescription}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className={`px-3 py-1 rounded-md border ${getStatusColor(company.daysRemaining)}`}>
                              <span className="font-semibold">{company.daysRemaining}</span> días restantes
                            </div>
                            <div className="text-sm text-gray-600">
                              Estado: <span className="font-medium">{company.subscriptionStatus}</span>
                            </div>
                            {company.nextRenewalDate && (
                              <div className="text-sm text-gray-600">
                                Renovación: {new Date(company.nextRenewalDate).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!company.subscription && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            Esta empresa no tiene una suscripción asignada
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        Editar
                      </Button>
                      {company.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(company.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
