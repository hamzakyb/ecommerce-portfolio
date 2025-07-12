import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { notification, message } from 'antd';
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bildirimleri API'den getir
  const fetchNotifications = useCallback(async () => {
    if (!user?.token) return; // Kullanıcı yoksa fetch yapma
    
    setLoading(true);
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.NOTIFICATIONS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Bildirimler getirilemedi');
      }
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      
      // Bildirimleri localStorage'a kaydet
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Bildirimler getirilemedi:', error);
      
      // API'den getirilemezse localStorage'dan yükle
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter(n => !n.read).length);
        } catch (e) {
          console.error('Kaydedilmiş bildirimler yüklenemedi:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // LocalStorage'dan bildirimleri yükle (sayfa yenilendiğinde)
  useEffect(() => {
    if (user) {
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter(n => !n.read).length);
        } catch (e) {
          console.error('Kaydedilmiş bildirimler yüklenemedi:', e);
        }
      }
    }
  }, [user]);

  // Socket.io bağlantısını kur
  useEffect(() => {
    if (user && user.id) {
      // Socket.io bağlantısını oluştur
      const newSocket = io(API_CONFIG.BASE_URL, {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        namespace: '/notifications'
      });
      
      // Bağlantı kurulduğunda
      newSocket.on('connect', () => {
        console.log('Socket.io bağlantısı kuruldu');
        
        // Kullanıcı kimliğini doğrula
        newSocket.emit('authenticate', user.id);
        
        // Bağlantı kurulduğunda bildirimleri yenile
        fetchNotifications();
      });
      
      // Bağlantı kesildiğinde
      newSocket.on('disconnect', () => {
        console.log('Socket.io bağlantısı kesildi');
      });
      
      // Bağlantı hatası
      newSocket.on('connect_error', (error) => {
        console.error('Socket.io bağlantı hatası:', error);
      });
      
      setSocket(newSocket);
      
      // Temizleme fonksiyonu
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user, fetchNotifications]);

  // Bildirimleri dinle
  useEffect(() => {
    if (socket && user) {
      // Yeni bildirim geldiğinde
      socket.on('notification', (newNotification) => {
        // Bildirimi state'e ekle
        setNotifications(prev => {
          const updatedNotifications = [newNotification, ...prev];
          // Bildirimleri localStorage'a kaydet
          localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
        setUnreadCount(prev => prev + 1);
        
        // Sadece admin sayfasında ise sesli ve görsel bildirim göster
        if (window.location.pathname.startsWith('/admin')) {
          // Sesli bildirim
          playNotificationSound();
          
          // Ekran bildirimi
          showNotification(newNotification);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, user]);

  // İlk yükleme ve periyodik yenileme
  useEffect(() => {
    // İlk yükleme
    fetchNotifications();
    
    // Periyodik yenileme (her 30 saniyede bir)
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Bildirim sesi çal
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Ses çalma hatası:', e));
    } catch (error) {
      console.error('Bildirim sesi çalınamadı:', error);
    }
  };

  // Ekran bildirimi göster
  const showNotification = (notificationData) => {
    notification.open({
      message: notificationData.title,
      description: notificationData.message,
      onClick: () => {
        if (notificationData.link) {
          window.location.href = notificationData.link;
        }
        markAsRead(notificationData._id);
      },
    });
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (id) => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.NOTIFICATIONS_MARK_READ)(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Bildirim işaretlenemedi');
      }
      
      // State'i güncelle
      setNotifications(prev => {
        const updatedNotifications = prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true } 
            : notification
        );
        // Bildirimleri localStorage'a kaydet
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Bildirimler işaretlenemedi');
      }
      
      // State'i güncelle
      setNotifications(prev => {
        const updatedNotifications = prev.map(notification => ({ ...notification, read: true }));
        // Bildirimleri localStorage'a kaydet
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('Bildirimler işaretlenemedi:', error);
    }
  };

  // Bildirimi sil
  const deleteNotification = async (id) => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.NOTIFICATIONS_DELETE)(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Bildirim silinemedi');
      }
      
      // State'i güncelle
      setNotifications(prev => {
        const updatedNotifications = prev.filter(notification => notification._id !== id);
        // Bildirimleri localStorage'a kaydet
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      // Okunmamış bildirim sayısını güncelle
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === id);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  };

  // Tüm bildirimleri sil
  const deleteAllNotifications = async () => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Bildirimler silinemedi');
      }
      
      // State'i güncelle
      setNotifications([]);
      setUnreadCount(0);
      // Bildirimleri localStorage'dan sil
      localStorage.removeItem(`notifications_${user.id}`);
    } catch (error) {
      console.error('Bildirimler silinemedi:', error);
    }
  };

  // Bildirimleri yenile (manuel yenileme için)
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Başarı bildirimi
  const showSuccess = (content) => {
    message.success(content);
  };

  // Hata bildirimi
  const showError = (content) => {
    message.error(content);
  };

  // Uyarı bildirimi
  const showWarning = (content) => {
    message.warning(content);
  };

  // Bilgi bildirimi
  const showInfo = (content) => {
    message.info(content);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 