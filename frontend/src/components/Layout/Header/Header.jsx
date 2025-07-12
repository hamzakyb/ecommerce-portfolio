import { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { CartContext } from "../../../context/CartProvider";
import { Dropdown, Avatar, Badge } from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import "./Header.css";

const Header = () => {
  const { pathname } = useLocation();
  const { cartItems } = useContext(CartContext);
  const { user, logout: logoutUser } = useAuth();
  const [isHeaderShow, setIsHeaderShow] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsHeaderShow(true);
    } else {
      setIsHeaderShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const userMenuItems = [
    {
      key: "1",
      label: <Link to="/profile">Profilim</Link>,
    },
    {
      key: "2",
      label: <span onClick={logoutUser}>Çıkış Yap</span>,
    },
  ];

  return (
    <header className={`${isHeaderShow ? "header-show" : ""}`}>
      <div className="global-notification">
        <p>
          KARGO BEDELSİZ | AYNI GÜN TESLİMAT | 7/24 CANLI DESTEK
        </p>
      </div>
      <div className="header-row">
        <div className="container">
          <div className="header-wrapper">
            <div className="header-mobile">
              <i className="bi bi-list" id="btn-menu"></i>
            </div>
            <div className="header-left">
              <Link to={"/"} className="logo">
                LOGO
              </Link>
            </div>
            {user ? (
              <div className="header-center" id="sidebar">
                <nav className="navigation">
                  <ul className="menu-list">
                    <li className="menu-list-item">
                      <Link
                        to={"/"}
                        className={`menu-link ${pathname === "/" && "active"}`}
                      >
                        Ana Sayfa
                        <i className="bi bi-chevron-down"></i>
                      </Link>
                    </li>
                    <li className="menu-list-item">
                      <Link
                        to={"/contact"}
                        className={`menu-link ${
                          pathname === "/contact" && "active"
                        }`}
                      >
                        İletişim
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            ) : null}
            <div className="header-right">
              <div className="header-right-links">
                {user ? (
                  <>
                    <Dropdown
                      menu={{ items: userMenuItems }}
                      placement="bottomRight"
                      arrow
                    >
                      <div className="header-profile">
                        {user.avatar ? (
                          <Avatar 
                            src={user.avatar.startsWith('http') ? 
                              user.avatar.replace('instagram.fhty2-1.fna.fbcdn.net', 'ui-avatars.com') : 
                              user.avatar} 
                            className="header-avatar"
                            fallback={<UserOutlined />}
                          />
                        ) : (
                          <Avatar 
                            icon={<UserOutlined />} 
                            className="header-avatar"
                          />
                        )}
                        <span className="user-name">{user.username}</span>
                        <DownOutlined style={{ fontSize: '12px' }} />
                      </div>
                    </Dropdown>
                    
                    <div className="header-cart">
                      <Link to={"/cart"} className="header-cart-link">
                        <Badge count={cartItems.length} size="small">
                          <i className="bi bi-bag"></i>
                        </Badge>
                      </Link>
                    </div>
                  </>
                ) : (
                  <Link to={"/auth"} className="header-account">
                    <i className="bi bi-person"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  setIsSearchShow: PropTypes.func,
};

export default Header;
