'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Professional, 
  CreateProfessionalDto, 
  UpdateProfessionalDto,
  ProfessionalStatus,
  IdentificationType
} from '@/types/professional';
import { Specialty } from '@/types/specialty';
import { professionalService } from '@/services/professionalService';
import { specialtyService } from '@/services/specialtyService';
import { User, Save, X, Trash2 } from 'lucide-react';

interface ProfessionalFormProps {
  professional?: Professional;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProfessionalForm({ professional, onSuccess, onCancel }: ProfessionalFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProfessionalDto | UpdateProfessionalDto>({
    firstName: '',
    secondName: '',
    firstLastname: '',
    secondLastname: '',
    identificationType: IdentificationType.DNI,
    identificationNumber: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    status: ProfessionalStatus.ACTIVE,
    licenseExpiryDate: '',
    observations: '',
    signatureUrl: '',
    specialtyIds: [],
  });

  // Cargar especialidades disponibles
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await specialtyService.getSpecialties({ limit: 1000 });
        const specialtiesData = response.data || [];
        if (Array.isArray(specialtiesData)) {
          setSpecialties(specialtiesData.filter(s => s.isActive));
        }
      } catch (error) {
        console.error('Error loading specialties:', error);
      }
    };

    loadSpecialties();
  }, []);

  // Cargar datos del profesional si estamos editando
  useEffect(() => {
    if (professional) {
      setFormData({
        firstName: professional.firstName,
        secondName: professional.secondName || '',
        firstLastname: professional.firstLastname,
        secondLastname: professional.secondLastname || '',
        identificationType: professional.identificationType,
        identificationNumber: professional.identificationNumber,
        licenseNumber: professional.licenseNumber,
        email: professional.email,
        phone: professional.phone,
        address: professional.address || '',
        status: professional.status,
        licenseExpiryDate: professional.licenseExpiryDate || '',
        observations: professional.observations || '',
        signatureUrl: professional.signatureUrl || '',
        specialtyIds: professional.specialties?.map(s => s.id) || [],
      });
      // Cargar preview de firma existente
      if (professional.signatureUrl) {
        setSignaturePreview(professional.signatureUrl);
      }
    }
  }, [professional]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    setFormData(prev => ({
      ...prev,
      specialtyIds: prev.specialtyIds?.includes(specialtyId)
        ? prev.specialtyIds.filter(id => id !== specialtyId)
        : [...(prev.specialtyIds || []), specialtyId]
    }));
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|svg\+xml)/)) {
      alert('Solo se permiten imágenes (JPG, PNG, GIF, SVG)');
      return;
    }

    setUploadingSignature(true);

    try {
      // Subir firma al backend
      const { signatureUrl } = await professionalService.uploadSignature(file);
      
      // Actualizar formData con la URL
      setFormData(prev => ({ ...prev, signatureUrl }));
      
      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Error al subir la firma. Por favor, intente nuevamente.');
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleRemoveSignature = () => {
    setFormData(prev => ({ ...prev, signatureUrl: '' }));
    setSignaturePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (professional) {
        await professionalService.updateProfessional(professional.id, formData as UpdateProfessionalDto);
      } else {
        await professionalService.createProfessional(formData as CreateProfessionalDto);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving professional:', error);
      alert('Error al guardar el profesional. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {professional ? 'Editar Profesional' : 'Nuevo Profesional'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primer Nombre *
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segundo Nombre
              </label>
              <Input
                type="text"
                value={formData.secondName || ''}
                onChange={(e) => handleInputChange('secondName', e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primer Apellido *
              </label>
              <Input
                type="text"
                value={formData.firstLastname}
                onChange={(e) => handleInputChange('firstLastname', e.target.value)}
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segundo Apellido
              </label>
              <Input
                type="text"
                value={formData.secondLastname || ''}
                onChange={(e) => handleInputChange('secondLastname', e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          {/* Identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Identificación *
              </label>
              <select
                value={formData.identificationType}
                onChange={(e) => handleInputChange('identificationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={IdentificationType.DNI}>DNI</option>
                <option value={IdentificationType.PASAPORTE}>Pasaporte</option>
                <option value={IdentificationType.CARNET_EXTRANJERIA}>Carné de Extranjería</option>
                <option value={IdentificationType.CEDULA}>Cédula</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Identificación *
              </label>
              <Input
                type="text"
                value={formData.identificationNumber}
                onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                required
                maxLength={20}
              />
            </div>
          </div>

          {/* Información Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Licencia *
              </label>
              <Input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                required
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Expiración de Licencia
              </label>
              <Input
                type="date"
                value={formData.licenseExpiryDate || ''}
                onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                maxLength={15}
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={ProfessionalStatus.ACTIVE}>Activo</option>
              <option value={ProfessionalStatus.INACTIVE}>Inactivo</option>
              <option value={ProfessionalStatus.SUSPENDED}>Suspendido</option>
              <option value={ProfessionalStatus.RETIRED}>Retirado</option>
            </select>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <Input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Especialidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {specialties.map((specialty) => (
                <label key={specialty.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specialtyIds?.includes(specialty.id) || false}
                    onChange={() => handleSpecialtyToggle(specialty.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{specialty.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Firma Digital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma Digital
            </label>
            <div className="space-y-3">
              {signaturePreview ? (
                <div className="relative inline-block">
                  <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                    <img
                      src={signaturePreview.startsWith('data:') || signaturePreview.startsWith('http') 
                        ? signaturePreview 
                        : `${process.env.NEXT_PUBLIC_API_URL || 'https://back-history-production.up.railway.app'}${signaturePreview}`}
                      alt="Firma"
                      className="object-contain max-w-[200px] max-h-[100px]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSignature}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar Firma
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                    onChange={handleSignatureUpload}
                    disabled={uploadingSignature}
                    className="max-w-md"
                  />
                  {uploadingSignature && (
                    <span className="text-sm text-gray-500">Subiendo...</span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos permitidos: JPG, PNG, GIF, SVG. Tamaño máximo: 2MB
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
