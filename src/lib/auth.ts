import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    companyId?: string;
    companyName?: string;
    companyRuc?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyId?: string;
  companyName?: string;
  companyRuc?: string;
}

class AuthService {
  private tokenKey = 'sysmedic_token';
  private userKey = 'sysmedic_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const authData = response.data;
      
      console.log('=== LOGIN DEBUG ===');
      console.log('Raw response data:', authData);
      console.log('Token from response:', authData.accessToken);
      console.log('User from response:', authData.user);
      
      // Guardar token y usuario en localStorage
      this.setToken(authData.accessToken);
      this.setUser(authData.user);
      
      // Verificar que se guardaron correctamente
      const savedToken = this.getToken();
      const savedUser = this.getUser();
      console.log('Token saved:', savedToken);
      console.log('User saved:', savedUser);
      console.log('Are they equal?', savedToken === authData.accessToken);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error de autenticación');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!token && !!user && !this.isTokenExpired(token);
  }

  // Verificar si el token está expirado
  isTokenExpired(token: string): boolean {
    try {
      // Validar que el token tenga el formato JWT correcto
      if (!token || typeof token !== 'string') {
        console.warn('Token is not a valid string');
        return true;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token does not have 3 parts (not a valid JWT)');
        return true;
      }
      
      // Intentar decodificar la parte del payload (segunda parte)
      let payload;
      try {
        // Agregar padding si es necesario para base64
        let base64Payload = parts[1];
        while (base64Payload.length % 4) {
          base64Payload += '=';
        }
        
        const decodedPayload = atob(base64Payload);
        payload = JSON.parse(decodedPayload);
      } catch (decodeError) {
        console.error('Error decoding token payload:', decodeError);
        console.log('Token parts:', parts);
        console.log('Payload part:', parts[1]);
        return true;
      }
      
      // Verificar si tiene campo de expiración
      if (!payload.exp) {
        console.warn('Token does not have expiration field');
        return false; // Si no tiene exp, asumimos que no expira
      }
      
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Si no se puede parsear, consideramos que está expirado
    }
  }

  // Obtener información del token
  getTokenInfo(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Validar que el token tenga el formato JWT correcto
      if (!token || typeof token !== 'string') {
        console.warn('Token is not a valid string');
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token does not have 3 parts (not a valid JWT)');
        return null;
      }
      
      // Intentar decodificar la parte del payload (segunda parte)
      let payload;
      try {
        // Agregar padding si es necesario para base64
        let base64Payload = parts[1];
        while (base64Payload.length % 4) {
          base64Payload += '=';
        }
        
        const decodedPayload = atob(base64Payload);
        payload = JSON.parse(decodedPayload);
      } catch (decodeError) {
        console.error('Error decoding token payload in getTokenInfo:', decodeError);
        console.log('Token parts:', parts);
        console.log('Payload part:', parts[1]);
        return null;
      }
      
      return {
        ...payload,
        isExpired: this.isTokenExpired(token),
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        timeUntilExpiry: payload.exp ? payload.exp - (Date.now() / 1000) : null
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  // Configurar axios con el token
  setupAxiosInterceptors(): void {
    // Limpiar interceptores existentes para evitar duplicados
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    
    // Interceptor de request
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          // Verificar si el token está expirado antes de enviarlo
          if (this.isTokenExpired(token)) {
            console.warn('Token expired, logging out');
            this.logout();
            window.location.href = '/';
            return Promise.reject(new Error('Token expired'));
          }
          
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Request with token to:', config.url);
        } else {
          console.warn('No token available for request to:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de response
    axios.interceptors.response.use(
      (response) => {
        console.log('Successful response from:', response.config.url);
        return response;
      },
      (error) => {
        console.error('Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.log('401 Unauthorized - logging out and redirecting');
          this.logout();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
