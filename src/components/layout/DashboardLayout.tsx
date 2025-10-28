'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type User } from '@/lib/auth';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
    setLoading(false);
    
    console.log('Authentication successful, user:', userData);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestión Médica
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
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
