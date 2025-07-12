import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// Hata tiplerini tanımlayalım
export const ERROR_TYPES = {
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR'
};

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const requestId = Date.now().toString();
    console.group(`🚀 API İsteği (${requestId})`);
    console.log('URL:', config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.groupEnd();

    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ İstek Hatası:', error);
    return Promise.reject({
      type: ERROR_TYPES.NETWORK_ERROR,
      message: 'İstek oluşturulurken bir hata oluştu',
      originalError: error
    });
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.group('✅ API Yanıtı');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group('❌ API Hatası');
    console.error('Hata Detayları:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    console.groupEnd();

    // 401 hatası
    if (error.response?.status === 401) {
      return Promise.reject({
        type: ERROR_TYPES.AUTH_ERROR,
        message: 'Oturum süresi doldu veya geçersiz kimlik bilgileri',
        originalError: error
      });
    }

    // Network hatası
    if (error.message === 'Network Error') {
      return Promise.reject({
        type: ERROR_TYPES.NETWORK_ERROR,
        message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        originalError: error
      });
    }

    // Diğer API hataları
    return Promise.reject({
      type: ERROR_TYPES.API_ERROR,
      message: error.response?.data?.error || 'Bir hata oluştu',
      originalError: error
    });
  }
);

export default axiosInstance; 