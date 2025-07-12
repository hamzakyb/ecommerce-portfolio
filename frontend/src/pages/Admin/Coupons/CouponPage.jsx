import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CouponPage.css';
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(getFullApiUrl(API_CONFIG.API_ENDPOINTS.COUPONS));
        setCoupons(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Kupon yükleme hatası:', error);
        setError('Kuponlar yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bu kuponu silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.COUPONS}/${id}`));
        setCoupons(coupons.filter(coupon => coupon._id !== id));
      } catch (error) {
        console.error('Kupon silme hatası:', error);
        setError('Kupon silinirken bir hata oluştu.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Filtreleme işlemi
  const filteredCoupons = coupons
    .filter(coupon => 
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const renderCouponStatus = (coupon) => {
    // Kuponun geçerlilik durumunu kontrol eden işlev
    const isActive = !coupon.expiryDate || new Date(coupon.expiryDate) > new Date();
    return (
      <span className={`status ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? <><i className="fas fa-check-circle"></i> Aktif</> : <><i className="fas fa-times-circle"></i> Süresi Dolmuş</>}
      </span>
    );
  };

  if (loading) return (
    <div className="coupon-page">
      <div className="page-header">
        <h1>Kuponlar</h1>
        <Link to="/admin/coupons/create" className="create-button">
          <i className="fas fa-plus-circle"></i> Yeni Kupon Oluştur
        </Link>
      </div>
      <div className="coupons-table loading-container">
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <p>Kuponlar yükleniyor...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="coupon-page">
      <div className="page-header">
        <h1>Kuponlar</h1>
        <Link to="/admin/coupons/create" className="create-button">
          <i className="fas fa-plus-circle"></i> Yeni Kupon Oluştur
        </Link>
      </div>
      <div className="error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Yeniden Dene
        </button>
      </div>
    </div>
  );

  return (
    <div className="coupon-page">
      <div className="page-header">
        <h1><i className="fas fa-ticket-alt"></i> Kuponlar</h1>
      </div>

      <div className="coupon-tools">
        <div className="search-box">
          <input
            type="text"
            placeholder="Kupon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              title="Aramayı temizle"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <div className="coupon-stats">
          <div className="stat-item">
            <span className="stat-label">Toplam Kupon:</span>
            <span className="stat-value">{coupons.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Aktif Kupon:</span>
            <span className="stat-value">
              {coupons.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length}
            </span>
          </div>
        </div>
      </div>

      <div className="coupon-cards-grid">
        {filteredCoupons.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-ticket-alt"></i></div>
            <p>Hiç kupon bulunamadı.</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <div className="coupon-card" key={coupon._id}>
              <div className="coupon-card-header">
                <span className="code-value">{coupon.code}</span>
                {renderCouponStatus(coupon)}
              </div>
              <div className="coupon-card-body">
                <div className="discount-value">%{coupon.discountPercent} indirim</div>
                <div className="coupon-date">Oluşturulma: {formatDate(coupon.createdAt)}</div>
                {coupon.expiryDate && <div className="coupon-date">Son Kullanma: {formatDate(coupon.expiryDate)}</div>}
                {coupon.description && <div className="coupon-desc">{coupon.description}</div>}
              </div>
              <div className="coupon-card-actions">
                <Link to={`/admin/coupons/update/${coupon._id}`} className="edit-button">Düzenle</Link>
                <button className="delete-button" onClick={() => handleDelete(coupon._id)}>Sil</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CouponPage; 