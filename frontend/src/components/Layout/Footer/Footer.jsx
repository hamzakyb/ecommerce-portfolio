import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { useTheme } from "../../../context/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${theme === 'dark' ? 'footer-dark' : ''}`}>
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-3">
              <div className="footer-brand">
                <div className="logo">
                  <h2>Dream Filtre</h2>
                </div>
                <p>
                  Araç ve endüstriyel filtrede güvenin adresi! Dream Filtre B2B platformunda yağ, hava, yakıt ve polen filtrelerinde en kaliteli markalar ve hızlı tedarik. Toptan ve kurumsal çözümler için bize ulaşın.
                </p>
                <div className="social-links">
                  <a href="https://facebook.com/dreamfiltre" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://instagram.com/dreamfiltre" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="mailto:info@dreamfiltre.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
                    <i className="bi bi-envelope"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-3">
              <div className="footer-links">
                <h4>Kurumsal</h4>
                <ul>
                  <li><Link to="/">Hakkımızda</Link></li>
                  <li><Link to="/contact">İletişim</Link></li>
                  <li><Link to="/">İş Ortakları</Link></li>
                  <li><Link to="/">Markalar</Link></li>
                  <li><Link to="/">Blog</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="col-3">
              <div className="footer-links">
                <h4>Müşteri Hizmetleri</h4>
                <ul>
                  <li><Link to="/">Sık Sorulan Sorular</Link></li>
                  <li><Link to="/">Gizlilik Politikası</Link></li>
                  <li><Link to="/">Kullanım Koşulları</Link></li>
                  <li><Link to="/">Kargo ve Teslimat</Link></li>
                  <li><Link to="/">İade ve Değişim</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="col-3">
              <div className="footer-newsletter">
                <h4>İletişim</h4>
                <p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>
                
                <div className="contact-info">
                  <p><i className="bi bi-telephone"></i> 0212 999 99 99</p>
                  <p><i className="bi bi-envelope"></i> info@dreamfiltre.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-middle">
        <div className="container">
          <div className="features">
            <div className="feature-item">
              <i className="bi bi-truck"></i>
              <div>
                <h5>Hızlı Teslimat</h5>
                <p>24 saat içinde kargoya verilir</p>
              </div>
            </div>
            <div className="feature-item">
              <i className="bi bi-shield-check"></i>
              <div>
                <h5>Güvenli Ödeme</h5>
                <p>256 bit SSL güvenlik</p>
              </div>
            </div>
            <div className="feature-item">
              <i className="bi bi-headset"></i>
              <div>
                <h5>7/24 Destek</h5>
                <p>Her zaman yanınızdayız</p>
              </div>
            </div>
            <div className="feature-item">
              <i className="bi bi-arrow-repeat"></i>
              <div>
                <h5>Kolay İade</h5>
                <p>30 gün iade garantisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Dream Filtre. Tüm hakları saklıdır.</p>
            </div>
            <div className="payment-methods">
              <i className="bi bi-credit-card-2-front-fill" title="Mastercard"></i>
              <i className="bi bi-credit-card-fill" title="Visa"></i>
              <i className="bi bi-paypal" title="PayPal"></i>
              <i className="bi bi-credit-card" title="American Express"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
