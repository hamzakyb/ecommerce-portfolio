import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-wrapper">
          <div className="header-left">
            <Link to="/" className="logo">
              <i className="bi bi-gear-fill"></i>
              <span>Dream Filtre</span>
            </Link>
          </div>
          {user ? (
            <nav className="header-nav">
              <Link to="/" className="nav-link">Anasayfa</Link>
              <Link to="/contact" className="nav-link">İletişim</Link>
            </nav>
          ) : null}
          <div className="header-right">
            {user ? (
              <>
                <Link to="/cart" className="cart-button">
                  <i className="fas fa-shopping-cart"></i>
                </Link>
                <Link to="/profile" className="profile-button">
                  <i className="fas fa-user"></i>
                </Link>
                <button className="logout-button" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            ) : (
              <Link to="/auth" className="login-button">
                <i className="fas fa-sign-in-alt"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 