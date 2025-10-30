'use client';

import { useState, useEffect } from 'react';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '@/types/user';
import { Company } from '@/types/company';
import { userService } from '@/services/userService';
import { companyService } from '@/services/companyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'receptionist' as UserRole,
    companyId: '',
  });

  useEffect(() => {
    loadCompanies();
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        companyId: user.companyId || '',
      });
    }
  }, [user]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies(false);
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }

    if (!user && !formData.password) {
      toast.error('La contraseña es requerida');
      return;
    }

    if (!user && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      
      if (user) {
        const updateData: UpdateUserDto = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          companyId: formData.companyId || undefined,
        };
        
        // Solo incluir password si se proporcionó
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await userService.updateUser(user.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        const createData: CreateUserDto = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          companyId: formData.companyId || undefined,
        };
        await userService.createUser(createData);
        toast.success('Usuario creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Username and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Nombre de Usuario <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña {!user && <span className="text-red-500">*</span>}
              {user && <span className="text-sm text-gray-500">(dejar en blanco para no cambiar)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={user ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
              required={!user}
              minLength={6}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Enfermera</SelectItem>
                <SelectItem value="receptionist">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Empresa (Opcional)</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => setFormData({ ...formData, companyId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin empresa asignada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin empresa</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} - RUC: {company.ruc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info about role */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los roles determinan los permisos del usuario en el sistema.
              Solo los administradores pueden gestionar configuraciones y usuarios.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  );
}
