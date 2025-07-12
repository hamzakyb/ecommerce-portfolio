import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { ERROR_TYPES } from '../services/axiosInstance';

// Context oluştur
const AuthContext = createContext();

// Context Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const navigate = useNavigate();

  // Token geçerliliğini kontrol et
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      console.error("Token doğrulama hatası:", error);
      return false;
    }
  };

  // Kullanıcı bilgilerini güncelleme
  const updateUserState = (userData) => {
    if (userData) {
      const userWithId = {
        ...userData,
        id: userData.id || userData._id
      };
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // Sayfa yüklendiğinde localStorage kontrolü
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.token && isTokenValid(parsedUser.token)) {
          updateUserState(parsedUser);
        } else {
          authService.logout();
          if (window.location.pathname !== '/auth') {
            message.warning("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
          }
        }
      } catch (error) {
        console.error("Kullanıcı bilgisi ayrıştırma hatası:", error);
        authService.logout();
      }
    }
    setLoading(false);
  }, [navigate]);

  // Giriş yapma fonksiyonu
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Email'i küçük harfe çevir ve boşlukları temizle
      const formattedEmail = email.toLowerCase().trim();
      
      const userData = await authService.login({ 
        email: formattedEmail, 
        password 
      });
      
      updateUserState(userData);
      message.success('Giriş başarılı!');
      
      // Admin kullanıcısı için admin paneline yönlendir
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      let errorMessage = 'Bir hata oluştu';
      
      switch (error.type) {
        case ERROR_TYPES.AUTH_ERROR:
          errorMessage = 'Geçersiz email veya şifre';
          break;
        case ERROR_TYPES.NETWORK_ERROR:
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
          break;
        case ERROR_TYPES.API_ERROR:
          errorMessage = error.message || 'API hatası oluştu';
          break;
        default:
          errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
      }
      
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Kayıt olma fonksiyonu
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      await authService.register({ username, email, password });
      message.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yapma fonksiyonu
  const logout = () => {
    authService.logout();
    updateUserState(null);
    message.success('Çıkış yapıldı!');
    navigate('/auth');
  };

  // Kullanıcı bilgilerini yenileme
  const refreshUserData = async (forceRefresh = false) => {
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    if (!forceRefresh && (currentTime - lastRefreshTime) < fiveMinutesInMs) {
      return true;
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;

    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.id || !isTokenValid(parsedUser.token)) {
        logout();
        return false;
      }

      const userData = await authService.getUserProfile(parsedUser.id);
      updateUserState({ ...userData, token: parsedUser.token });
      setLastRefreshTime(currentTime);
      return true;
    } catch (error) {
      if (error.message.includes('401')) {
        logout();
      }
      return false;
    }
  };

  // Kullanıcı admin mi?
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUserData,
    updateUserState,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Context hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 