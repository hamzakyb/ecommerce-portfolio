import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  // Varsayılan konfigürasyon değerleri
  const [config, setConfig] = useState(() => {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig 
      ? JSON.parse(savedConfig) 
      : {
          language: 'tr',
          currency: 'TRY',
          dateFormat: 'DD.MM.YYYY',
          notificationSound: true,
          autoLogin: true,
          pageSize: 10,
          productViewMode: 'grid',
          // diğer konfigürasyon değerleri buraya eklenebilir
        };
  });

  // Konfigürasyon değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
  }, [config]);

  // Konfigürasyon ayarlarını güncellemek için fonksiyon
  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Belirli bir konfigürasyon değerini güncellemek için fonksiyon
  const updateConfigItem = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Konfigürasyonu varsayılan değerlere sıfırlamak için fonksiyon
  const resetConfig = () => {
    const defaultConfig = {
      language: 'tr',
      currency: 'TRY',
      dateFormat: 'DD.MM.YYYY',
      notificationSound: true,
      autoLogin: true,
      pageSize: 10,
      productViewMode: 'grid',
    };
    setConfig(defaultConfig);
    localStorage.setItem('appConfig', JSON.stringify(defaultConfig));
  };

  return (
    <ConfigContext.Provider value={{ 
      config, 
      updateConfig, 
      updateConfigItem, 
      resetConfig 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Config verilerine erişmek için özel hook
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export default ConfigContext; 