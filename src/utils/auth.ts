import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Interface untuk user data
export interface User {
  id: number;
  username: string;
  role: 'admin';
  posyandu_name: string;
}

// Interface untuk response login
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

// Konfigurasi axios dengan interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle token expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      clearAuthData();
      
      // Redirect ke login jika bukan di halaman login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Fungsi untuk mendapatkan access token
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Fungsi untuk mendapatkan refresh token
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

// Fungsi untuk mendapatkan user data
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Fungsi untuk menyimpan auth data
export const setAuthData = (tokens: { accessToken: string; refreshToken: string }, user: User) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

// Fungsi untuk menghapus auth data
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Fungsi untuk cek apakah user sudah login
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getUser();
};

// Fungsi untuk cek apakah user adalah admin
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};



// Fungsi login dengan username/password
export const loginWithCredentials = async (
  username: string, 
  password: string, 
  rememberMe: boolean = false
): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
    rememberMe,
    deviceInfo: navigator.userAgent
  });
  
  if (response.data.success) {
    setAuthData(response.data.data.tokens, response.data.data.user);
  }
  
  return response.data;
};

// Fungsi login dengan PIN
export const loginWithPin = async (
  pin: string, 
  rememberMe: boolean = false
): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login-pin', {
    pin,
    rememberMe,
    deviceInfo: navigator.userAgent
  });
  
  if (response.data.success) {
    setAuthData(response.data.data.tokens, response.data.data.user);
  }
  
  return response.data;
};

// Fungsi logout
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

// Fungsi logout dari semua device
export const logoutAll = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout-all');
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    clearAuthData();
  }
};

// Fungsi untuk mendapatkan info user yang sedang login
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data.user;
};

// Fungsi untuk verifikasi token
export const verifyToken = async (): Promise<boolean> => {
  try {
    await apiClient.get('/auth/verify');
    return true;
  } catch (error) {
    return false;
  }
};

// Export axios client untuk digunakan di komponen lain
export { apiClient };
