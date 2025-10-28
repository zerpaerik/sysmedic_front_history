/**
 * Authentication utilities for SYSMEDIC frontend
 */

const TOKEN_KEY = 'accessToken';

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Decode JWT token (basic implementation)
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get user info from token
 */
export const getUserFromToken = (): any => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    removeAuthToken();
    return null;
  }
  
  return decodeToken(token);
};
