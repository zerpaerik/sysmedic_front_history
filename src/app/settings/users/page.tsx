'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/user';
import { userService } from '@/services/userService';
import { UserForm } from '@/components/users/UserForm';
import { authService } from '@/lib/auth';
import { Plus, ArrowLeft, Search, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'edit';

export default function UsersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    doctors: 0,
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
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(true);
      setUsers(data);
      
      // Calculate stats
      const active = data.filter(u => u.isActive).length;
      const admins = data.filter(u => u.role === 'admin').length;
      const doctors = data.filter(u => u.role === 'doctor').length;
      
      setStats({
        total: data.length,
        active,
        admins,
        doctors,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
    
    try {
      await userService.deleteUser(id);
      toast.success('Usuario desactivado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar usuario');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await userService.activateUser(id);
      toast.success('Usuario activado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar usuario');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
    loadUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nurse':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'receptionist':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      doctor: 'Doctor',
      nurse: 'Enfermera',
      receptionist: 'Recepcionista',
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                {viewMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </h2>
            </div>
          </div>

          <UserForm
            user={selectedUser}
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
            <h2 className="text-3xl font-bold text-gray-900">Usuarios</h2>
            <p className="text-gray-600">Gestiona los usuarios del sistema y sus permisos</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.doctors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
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
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Usuario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className={`px-3 py-1 rounded-md border text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  {user.company && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Empresa</p>
                      <p className="text-sm font-medium">{user.company.name}</p>
                      <p className="text-xs text-gray-600">RUC: {user.company.ruc}</p>
                      {user.company.subscription && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Suscripción: {user.company.subscription.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {user.company.daysRemaining} días restantes
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!user.company && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        Sin empresa asignada
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    {user.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        Desactivar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(user.id)}
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
