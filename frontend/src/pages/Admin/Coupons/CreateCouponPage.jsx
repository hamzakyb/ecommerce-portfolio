import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './CouponPage.css';
import './CreateCouponPage.css';
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const CreateCouponPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    discountPercent: '',
    description: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateRandomCode = () => {
    // Rastgele 8 karakter uzunluğunda bir kupon kodu oluştur
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setForm(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Temel validasyon
    if (!form.code || !form.discountPercent) {
      setError('Kupon kodu ve indirim oranı alanları zorunludur.');
      return;
    }
    
    if (form.discountPercent < 1 || form.discountPercent > 100) {
      setError('İndirim oranı 1-100 arasında olmalıdır.');
      return;
    }
    
    setLoading(true);
    
    try {
      const couponData = {
        ...form,
        discountPercent: Number(form.discountPercent),
        minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : undefined,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined
      };
      
      // Boş alanları kaldır
      Object.keys(couponData).forEach(key => {
        if (couponData[key] === '' || couponData[key] === undefined) {
          delete couponData[key];
        }
      });
      
      await axios.post(getFullApiUrl(API_CONFIG.API_ENDPOINTS.COUPONS), couponData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/admin/coupons');
      }, 1500);
    } catch (error) {
      console.error('Kupon oluşturma hatası:', error);
      setError(
        error.response?.data?.message || 
        'Kupon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-create-page">
      <div className="page-header">
        <h1><i className="fas fa-plus-circle"></i> Yeni Kupon Oluştur</h1>
        <Link to="/admin/coupons" className="back-button">
          <i className="fas fa-arrow-left"></i> Kuponlara Dön
        </Link>
      </div>
      {showSuccess && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <p>Kupon başarıyla oluşturuldu! Yönlendiriliyorsunuz...</p>
        </div>
      )}
      <form className="coupon-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code"><i className="fas fa-ticket-alt"></i> Kupon Kodu</label>
            <div className="input-with-button">
              <input 
                id="code"
                name="code" 
                value={form.code} 
                onChange={handleChange} 
                placeholder="Örn: BAHAR2023" 
                required 
              />
              <button 
                type="button" 
                className="generate-button" 
                onClick={generateRandomCode}
                title="Rastgele kod oluştur"
              >
                <i className="fas fa-random"></i>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="discountPercent"><i className="fas fa-percentage"></i> İndirim Oranı (%)</label>
            <input 
              id="discountPercent"
              name="discountPercent" 
              type="number" 
              min="1" 
              max="100" 
              value={form.discountPercent} 
              onChange={handleChange} 
              placeholder="Örn: 10" 
              required 
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description"><i className="fas fa-align-left"></i> Açıklama</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Kupon ile ilgili detaylar..."
            rows="2"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="expiryDate"><i className="far fa-calendar-alt"></i> Son Kullanma Tarihi</label>
          <input 
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
          />
        </div>
        {error && <div className="error-message"><i className="fas fa-exclamation-triangle"></i> {error}</div>}
        <div className="action-buttons">
          <button type="submit" className="create-button" disabled={loading}>
            {loading ? 'Oluşturuluyor...' : 'Kuponu Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCouponPage; 