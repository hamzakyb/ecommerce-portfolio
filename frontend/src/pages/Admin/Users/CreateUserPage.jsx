import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserPage.css';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(getFullApiUrl(API_CONFIG.API_ENDPOINTS.USER_PROFILE), formData);
      navigate('/admin/users');
    } catch {
      setError('Kullanıcı oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <div className="user-page">
      <div className="page-header">
        <h1>Yeni Kullanıcı Oluştur</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Ad Soyad:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-posta:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Şifre:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Telefon:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Adres:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="create-button">Oluştur</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/admin/users')}
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage; 