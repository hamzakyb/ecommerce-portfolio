import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const AuthPage = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  // Kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Giriş işlemi
    await login(data.email, data.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <i className="bi bi-gear-fill"></i>
          <span>Step Filtre</span>
        </div>
        <h2>Hoş Geldiniz</h2>
        <p className="auth-subtitle">Lütfen hesabınıza giriş yapın</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span>E-posta Adresi</span>
              <div className="input-with-icon">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </label>
          </div>
          <div className="form-group">
            <label>
              <span>Şifre</span>
              <div className="input-with-icon">
                <i className="bi bi-lock"></i>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Şifrenizi girin"
                />
              </div>
            </label>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <span className="button-content">
                <i className="bi bi-arrow-clockwise spinning"></i>
                Giriş Yapılıyor...
              </span>
            ) : (
              <span className="button-content">
                <i className="bi bi-box-arrow-in-right"></i>
                Giriş Yap
              </span>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Step Filtre </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 