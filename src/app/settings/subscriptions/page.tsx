'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subscription } from '@/types/subscription';
import { subscriptionService } from '@/services/subscriptionService';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { authService } from '@/lib/auth';
import { Plus, ArrowLeft, Search, CreditCard, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'edit';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalRevenue: 0,
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
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getSubscriptions(true);
      setSubscriptions(data);
      
      // Calculate stats
      const active = data.filter(s => s.isActive).length;
      const totalRevenue = data
        .filter(s => s.isActive)
        .reduce((sum, s) => sum + s.price, 0);
      
      setStats({
        total: data.length,
        active,
        totalRevenue,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSubscription(null);
    setViewMode('create');
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta suscripción?')) return;
    
    try {
      await subscriptionService.deleteSubscription(id);
      toast.success('Suscripción desactivada exitosamente');
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar suscripción');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await subscriptionService.activateSubscription(id);
      toast.success('Suscripción activada exitosamente');
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar suscripción');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSubscription(null);
    loadSubscriptions();
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                {viewMode === 'create' ? 'Nueva Suscripción' : 'Editar Suscripción'}
              </h2>
            </div>
          </div>

          <SubscriptionForm
            subscription={selectedSubscription}
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
            <h2 className="text-3xl font-bold text-gray-900">Suscripciones</h2>
            <p className="text-gray-600">Gestiona los planes de suscripción del sistema</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suscripciones</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Potenciales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar suscripciones..."
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
        ) : filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No se encontraron suscripciones' : 'No hay suscripciones registradas'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Suscripción
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{subscription.name}</CardTitle>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {subscription.formattedPrice}
                      </p>
                      <p className="text-sm text-gray-500">{subscription.durationDescription}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{subscription.description}</p>
                  
                  {subscription.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Características:</p>
                      <ul className="space-y-1">
                        {subscription.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                        {subscription.features.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{subscription.features.length - 3} más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subscription)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    {subscription.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscription.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        Desactivar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(subscription.id)}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        Activar
                      </Button>
                    )}
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
