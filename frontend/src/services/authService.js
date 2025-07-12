import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

class AuthService {
  async login(credentials) {
    console.group('🔐 Login İşlemi');
    try {
      console.log('Giriş bilgileri:', { email: credentials.email });
      
      const response = await axiosInstance.post(API_CONFIG.API_ENDPOINTS.LOGIN, credentials);
      
      console.log('Login başarılı:', {
        userId: response.data.id,
        role: response.data.role
      });
      
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.groupEnd();
      return userData;
    } catch (error) {
      console.error('Login işlemi başarısız:', {
        type: error.type,
        message: error.message
      });
      
      console.groupEnd();
      throw error;
    }
  }

  async register(userData) {
    console.group('📝 Kayıt İşlemi');
    try {
      const response = await axiosInstance.post(API_CONFIG.API_ENDPOINTS.REGISTER, userData);
      console.log('Kayıt başarılı');
      console.groupEnd();
      return response.data;
    } catch (error) {
      console.error('Kayıt işlemi başarısız:', {
        type: error.type,
        message: error.message
      });
      console.groupEnd();
      throw error;
    }
  }

  async getUserProfile(userId) {
    console.group('👤 Profil Bilgileri Getiriliyor');
    try {
      const response = await axiosInstance.get(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${userId}`);
      console.log('Profil bilgileri alındı');
      console.groupEnd();
      return response.data;
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', {
        type: error.type,
        message: error.message
      });
      console.groupEnd();
      throw error;
    }
  }

  handleError(error) {
    if (error.response) {
      // Sunucudan gelen hata yanıtı
      const message = error.response.data.error || 'Bir hata oluştu';
      return new Error(message);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      return new Error('Sunucuya ulaşılamıyor');
    } else {
      // İstek oluşturulurken hata oluştu
      return new Error('İstek oluşturulamadı');
    }
  }

  logout() {
    console.log('🚪 Çıkış yapılıyor...');
    localStorage.removeItem('user');
  }
}

export default new AuthService(); 