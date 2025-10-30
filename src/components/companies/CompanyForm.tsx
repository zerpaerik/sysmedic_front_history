'use client';

import { useState, useEffect } from 'react';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/company';
import { Subscription } from '@/types/subscription';
import { companyService } from '@/services/companyService';
import { subscriptionService } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CompanyFormProps {
  company?: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSuccess, onCancel }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    subscriptionId: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    status: 'Prueba',
  });

  useEffect(() => {
    loadSubscriptions();
    if (company) {
      setFormData({
        name: company.name,
        ruc: company.ruc,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        contactPerson: company.contactPerson || '',
        subscriptionId: company.subscriptionId || '',
        subscriptionStartDate: company.subscriptionStartDate 
          ? new Date(company.subscriptionStartDate).toISOString().split('T')[0]
          : '',
        subscriptionEndDate: company.subscriptionEndDate
          ? new Date(company.subscriptionEndDate).toISOString().split('T')[0]
          : '',
        status: company.status,
      });
    }
  }, [company]);

  const loadSubscriptions = async () => {
    try {
      const data = await subscriptionService.getSubscriptions(false);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.ruc.trim() || formData.ruc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    if (!/^\d+$/.test(formData.ruc)) {
      toast.error('El RUC debe contener solo números');
      return;
    }

    try {
      setLoading(true);
      
      if (company) {
        const updateData: UpdateCompanyDto = {
          name: formData.name.trim(),
          ruc: formData.ruc.trim(),
          address: formData.address.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          contactPerson: formData.contactPerson.trim() || undefined,
          subscriptionId: formData.subscriptionId || undefined,
          subscriptionStartDate: formData.subscriptionStartDate || undefined,
          subscriptionEndDate: formData.subscriptionEndDate || undefined,
          status: formData.status,
        };
        await companyService.updateCompany(company.id, updateData);
        toast.success('Empresa actualizada exitosamente');
      } else {
        const createData: CreateCompanyDto = {
          name: formData.name.trim(),
          ruc: formData.ruc.trim(),
          address: formData.address.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          contactPerson: formData.contactPerson.trim() || undefined,
          subscriptionId: formData.subscriptionId || undefined,
          subscriptionStartDate: formData.subscriptionStartDate || undefined,
          subscriptionEndDate: formData.subscriptionEndDate || undefined,
          status: formData.status,
        };
        await companyService.createCompany(createData);
        toast.success('Empresa creada exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Name and RUC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">
                RUC <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="20123456789"
                maxLength={11}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección de la empresa"
              rows={2}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="987654321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Persona de Contacto</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          {/* Subscription */}
          <div className="space-y-2">
            <Label htmlFor="subscription">Suscripción</Label>
            <Select
              value={formData.subscriptionId}
              onValueChange={(value) => setFormData({ ...formData, subscriptionId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar suscripción (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin suscripción</SelectItem>
                {subscriptions.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name} - {sub.formattedPrice} / {sub.durationDescription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Dates */}
          {formData.subscriptionId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionStartDate">Fecha de Inicio</Label>
                <Input
                  id="subscriptionStartDate"
                  type="date"
                  value={formData.subscriptionStartDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionEndDate">Fecha de Fin</Label>
                <Input
                  id="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Suspendido">Suspendido</SelectItem>
                <SelectItem value="Prueba">Prueba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : company ? 'Actualizar' : 'Crear'} Empresa
        </Button>
      </div>
    </form>
  );
}
