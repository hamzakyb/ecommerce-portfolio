import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CouponPage.css';
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const UpdateCouponPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    code: '',
    discountPercent: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await axios.get(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.COUPONS}/${id}`));
        const c = response.data;
        setForm({
          code: c.code,
          discountPercent: c.discountPercent,
        });
        setLoading(false);
      } catch {
        setError('Kupon bilgisi yüklenemedi.');
        setLoading(false);
      }
    };
    fetchCoupon();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.code || !form.discountPercent) {
      setError('Tüm alanları doldurun.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.COUPONS}/${id}`), {
        ...form,
        discountPercent: Number(form.discountPercent)
      });
      navigate('/admin/coupons');
    } catch {
      setError('Kupon güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="coupon-page">
      <div className="page-header">
        <h1>Kuponu Düzenle</h1>
      </div>
      <form className="coupon-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kod</label>
          <input name="code" value={form.code} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>İndirim (%)</label>
          <input name="discountPercent" type="number" min="1" max="100" value={form.discountPercent} onChange={handleChange} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="create-button" disabled={saving}>
          {saving ? 'Güncelleniyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default UpdateCouponPage; 