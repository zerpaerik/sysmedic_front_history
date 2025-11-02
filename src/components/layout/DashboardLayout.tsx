'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type User } from '@/lib/auth';
import { userService } from '@/services/userService';
import { User as UserType } from '@/types/user';
import { Sidebar } from './Sidebar';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      // Verificar autenticación y token
      const token = authService.getToken();
      const userData = authService.getUser();
      
      if (!token || !userData) {
        console.log('No token or user data found, redirecting to login');
        router.push('/');
        return;
      }
      
      // Verificar si el token está expirado
      if (authService.isTokenExpired(token)) {
        console.log('Token expired, redirecting to login');
        authService.logout();
        router.push('/');
        return;
      }
      
      // Si todo está bien, configurar el usuario y los interceptores
      setUser(userData);
      authService.setupAxiosInterceptors();
      
      // Cargar detalles completos del usuario con empresa y suscripción
      try {
        const fullUserData = await userService.getUserById(userData.id);
        setUserDetails(fullUserData);
      } catch (error) {
        console.error('Error loading user details:', error);
      }
      
      setLoading(false);
      console.log('Authentication successful, user:', userData);
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const company = userDetails?.company;
  const hasSubscription = company && company.subscription;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Gestión Médica
                </h1>
                {(user.companyName || company?.name) && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {user.companyName || company?.name}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Bienvenido, {user.username}
              </p>
            </div>

            {/* Subscription Info */}
            {hasSubscription && company?.subscription && (
              <div className="flex items-center gap-3 mr-6">
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Suscripción</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {company.subscription.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-lg border ${getStatusColor(company.daysRemaining)}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs font-medium">Días restantes</p>
                      <p className="text-sm font-bold">
                        {company.daysRemaining} {company.daysRemaining === 1 ? 'día' : 'días'}
                      </p>
                    </div>
                  </div>
                </div>

                {company.daysRemaining <= 7 && company.daysRemaining > 0 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">¡Por vencer!</span>
                  </div>
                )}

                {company.daysRemaining === 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">¡Vencida!</span>
                  </div>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                {company && !hasSubscription && (
                  <p className="text-xs text-yellow-600 font-medium">Sin suscripción</p>
                )}
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
