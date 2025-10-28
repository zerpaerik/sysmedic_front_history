'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugAuthPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const info = authService.getTokenInfo();
    const authenticated = authService.isAuthenticated();
    
    setTokenInfo(info);
    setIsAuthenticated(authenticated);
    
    console.log('Token Info:', info);
    console.log('Is Authenticated:', authenticated);
    console.log('Raw Token:', authService.getToken());
    console.log('User:', authService.getUser());
  }, []);

  const handleNewLogin = async () => {
    try {
      const response = await authService.login({
        email: 'admin@sysmedic.com',
        password: '123456'
      });
      
      console.log('New login response:', response);
      
      // Diagnosticar el token recibido
      const receivedToken = response.accessToken;
      console.log('Response keys:', Object.keys(response));
      console.log('AccessToken field:', response.accessToken);
      console.log('User field:', response.user);
      
      // Verificar qué se está guardando en localStorage
      console.log('=== LOCALSTORAGE CHECK ===');
      console.log('Token in localStorage after login:', localStorage.getItem('accessToken'));
      console.log('User in localStorage after login:', localStorage.getItem('sysmedic_user'));
      console.log('=== TOKEN DIAGNOSIS ===');
      console.log('Raw token:', receivedToken);
      console.log('Token type:', typeof receivedToken);
      console.log('Token length:', receivedToken?.length);
      
      if (receivedToken) {
        const parts = receivedToken.split('.');
        console.log('Token parts count:', parts.length);
        console.log('Part 1 (header):', parts[0]);
        console.log('Part 2 (payload):', parts[1]);
        console.log('Part 3 (signature):', parts[2]);
        
        // Intentar decodificar manualmente
        if (parts.length === 3) {
          try {
            // Probar decodificación directa
            const directDecode = atob(parts[1]);
            console.log('Direct decode success:', directDecode);
          } catch (directError) {
            console.log('Direct decode failed:', directError);
            
            // Probar con padding
            try {
              let paddedPayload = parts[1];
              while (paddedPayload.length % 4) {
                paddedPayload += '=';
              }
              const paddedDecode = atob(paddedPayload);
              console.log('Padded decode success:', paddedDecode);
            } catch (paddedError) {
              console.log('Padded decode failed:', paddedError);
            }
          }
        }
      }
      
      // Refresh the info
      const info = authService.getTokenInfo();
      const authenticated = authService.isAuthenticated();
      
      setTokenInfo(info);
      setIsAuthenticated(authenticated);
      
      alert('Login exitoso! Revisa la consola para diagnóstico del token.');
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error en login: ' + (error as any).message);
    }
  };

  const handleTestPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/patients', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Patients response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Patients data:', data);
        alert('¡Solicitud exitosa! Revisa la consola para ver los datos.');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error de red: ' + (error as any).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Diagnóstico de Autenticación</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>¿Está autenticado?</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'SÍ' : 'NO'}
                </span>
              </div>
              
              {tokenInfo && (
                <div className="space-y-2">
                  <div><strong>Usuario:</strong> {tokenInfo.email}</div>
                  <div><strong>Rol:</strong> {tokenInfo.role}</div>
                  <div><strong>Expira:</strong> {tokenInfo.expiresAt?.toLocaleString()}</div>
                  <div>
                    <strong>¿Expirado?</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      tokenInfo.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tokenInfo.isExpired ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                  {!tokenInfo.isExpired && (
                    <div><strong>Tiempo restante:</strong> {Math.round(tokenInfo.timeUntilExpiry / 60)} minutos</div>
                  )}
                </div>
              )}
              
              {!tokenInfo && (
                <div className="text-red-600">No hay token disponible</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleNewLogin} className="w-full">
              Hacer Login Nuevo (admin@sysmedic.com)
            </Button>
            
            <Button onClick={handleTestPatients} variant="outline" className="w-full">
              Probar Solicitud a /patients
            </Button>
            
            <Button 
              onClick={() => {
                authService.logout();
                window.location.reload();
              }} 
              variant="destructive" 
              className="w-full"
            >
              Cerrar Sesión y Limpiar Token
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono bg-gray-100 p-4 rounded">
              <div><strong>Token Raw:</strong></div>
              <div className="break-all">{authService.getToken() || 'No token'}</div>
              
              <div className="mt-4"><strong>Token Info:</strong></div>
              <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
              
              <div className="mt-4"><strong>User Info:</strong></div>
              <pre>{JSON.stringify(authService.getUser(), null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
