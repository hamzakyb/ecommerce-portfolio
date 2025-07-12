import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/antd.css';
import './index.css';
import './pages/Admin/OrderPage.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfigProvider } from './context/ConfigContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ConfigProvider>
    <App />
        </ConfigProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
); 