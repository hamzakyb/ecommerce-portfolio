import { Layout, Menu, Typography, Avatar, Breadcrumb, Badge, Dropdown } from "antd";
import PropTypes from "prop-types";
import {
  UserOutlined,
  LaptopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  BarsOutlined,
  SunOutlined,
  MoonOutlined,
  DownOutlined,
  AppstoreOutlined,
  TagOutlined,
  UsergroupAddOutlined,
  ShoppingOutlined,
  NotificationOutlined,
  HomeFilled
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import "./AdminLayout.css";

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

// Mobil cihazlarda header dropdown menüsü için içerik
const MobileMenu = ({ menuItems, location, closeMenu }) => (
  <div className="mobile-menu">
    {menuItems.map(item => (
      <div key={item.key} className={`mobile-menu-item ${item.key === location.pathname ? 'active' : ''}`}>
        {item.children ? (
          <div className="mobile-submenu">
            <div className="mobile-menu-title">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div className="mobile-menu-children">
              {item.children.map(child => (
                <div 
                  key={child.key} 
                  className={`mobile-menu-child ${child.key === location.pathname ? 'active' : ''}`}
                  onClick={() => {
                    if(child.onClick) child.onClick();
                    closeMenu();
                  }}
                >
                  <span>{child.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="mobile-menu-link" 
            onClick={() => {
              if(item.onClick) item.onClick();
              closeMenu();
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        )}
      </div>
    ))}
  </div>
);

MobileMenu.propTypes = {
  menuItems: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  closeMenu: PropTypes.func.isRequired
};

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const bellRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(window.innerWidth <= 480);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsVerySmallScreen(window.innerWidth <= 480)
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Tema sınıfını body'ye ekle
    document.body.className = theme === 'dark' ? 'theme-dark' : '';
    
    return () => {
      // Component unmount olduğunda tema sınıfını temizle
      document.body.className = '';
    };
  }, [theme]);

  // Yeni bildirim geldiğinde zil animasyonu
  useEffect(() => {
    if (unreadCount > 0 && bellRef.current) {
      bellRef.current.classList.add('animate');
      
      const timer = setTimeout(() => {
        if (bellRef.current) {
          bellRef.current.classList.remove('animate');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // TouchSwipe için işlev
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const swipeThreshold = 50;
      // Soldan sağa kaydırma (sidebar'ı aç)
      if (touchEndX - touchStartX > swipeThreshold && touchStartX < 50) {
        setCollapsed(false);
      }
      // Sağdan sola kaydırma (sidebar'ı kapat)
      else if (touchStartX - touchEndX > swipeThreshold && !collapsed) {
        setCollapsed(true);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [collapsed, setCollapsed]);

  const menuItems = [
    {
      key: "1",
      icon: <AppstoreOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: "Dashboard",
      path: "/admin",
      onClick: () => {
        navigate(`/admin`);
      },
    },
    {
      key: "5",
      icon: <LaptopOutlined style={{ fontSize: '18px', color: '#13c2c2' }} />,
      label: "Ürünler",
      path: "/",
      children: [
        {
          key: "6",
          label: "Ürün Listesi",
          path: "/admin/products",
          onClick: () => {
            navigate(`/admin/products`);
          },
        },
        {
          key: "7",
          label: "Yeni Ürün Oluştur",
          path: "/admin/products/create",
          onClick: () => {
            navigate("/admin/products/create");
          },
        },
      ],
    },
    {
      key: "8",
      icon: <TagOutlined style={{ fontSize: '18px', color: '#722ed1' }} />,
      label: "Kuponlar",
      path: "/admin/coupons",
      children: [
        {
          key: "9",
          label: "Kupon Listesi",
          path: "/admin/coupons",
          onClick: () => {
            navigate(`/admin/coupons`);
          },
        },
        {
          key: "10",
          label: "Yeni Kupon Oluştur",
          path: "/admin/coupons/create",
          onClick: () => {
            navigate("/admin/coupons/create");
          },
        },
      ],
    },
    {
      key: "11",
      icon: <UsergroupAddOutlined style={{ fontSize: '18px', color: '#eb2f96' }} />,
      label: "Müşteriler",
      path: "/admin/users",
      onClick: () => {
        navigate(`/admin/users`);
      },
    },
    {
      key: "12",
      icon: <ShoppingOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />,
      label: "Siparişler",
      path: "/admin/orders",
      onClick: () => {
        navigate(`/admin/orders`);
      },
    },
    {
      key: "13",
      icon: <NotificationOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
      label: "Bildirimler",
      path: "/admin/notifications",
      onClick: () => {
        navigate(`/admin/notifications`);
      },
    },
    {
      key: "14",
      icon: <HomeFilled style={{ fontSize: '18px', color: '#f5222d' }} />,
      label: "Ana Sayfaya Git",
      onClick: () => {
        navigate("/");
      },
    },
  ];

  const getActiveKey = () => {
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === location.pathname) {
            return child.key;
          }
        }
      } else {
        if (item.path === location.pathname) {
          return item.key;
        }
      }
    }
  };

  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === location.pathname) {
            return child.label;
          }
        }
      } else {
        if (item.path === location.pathname) {
          return item.label;
        }
      }
    }
  };

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [
      {
        title: "Admin",
        path: "/admin",
      }
    ];
    
    const pageTitle = getPageTitle();
    if (pageTitle && path !== "/admin") {
      items.push({
        title: pageTitle,
        path: path,
      });
    }
    
    return items;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if(user?.role === "admin"){
    return (
      <Layout className="admin-layout">
        <Header className="admin-header">
          <div className="header-left">
            {isMobile && (
              <button 
                className="trigger-button"
                onClick={() => {
                  if (isVerySmallScreen) {
                    setShowMobileMenu(!showMobileMenu);
                  } else {
                    setCollapsed(!collapsed);
                  }
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            )}
            <div className="page-header">
              <div className="header-content" style={{ paddingTop: "5px" }}>
                <Title level={4} className="page-title">{getPageTitle()}</Title>
                <Breadcrumb 
                  className="breadcrumb"
                  items={getBreadcrumbItems().map((item, index) => ({
                    key: index,
                    title: item.title,
                    onClick: () => item.path && navigate(item.path)
                  }))}
                />
              </div>
            </div>
          </div>
          
          {/* Çok küçük ekranlarda açılan mobil menü */}
          {isVerySmallScreen && showMobileMenu && (
            <div className="mobile-menu-container">
              <MobileMenu 
                menuItems={menuItems} 
                location={location} 
                closeMenu={() => setShowMobileMenu(false)}
              />
            </div>
          )}
          
          <div className="header-right">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Aydınlık tema' : 'Karanlık tema'}
            >
              {theme === 'dark' ? <SunOutlined className="theme-toggle-icon" /> : <MoonOutlined className="theme-toggle-icon" />}
            </button>
            
            {isVerySmallScreen && (
              <button
                className="trigger-button mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <BarsOutlined />
              </button>
            )}
            
            <Badge count={unreadCount} size="small">
              <div 
                className="notification-bell" 
                ref={bellRef} 
                onClick={() => navigate('/admin/notifications')}
                style={{ cursor: "pointer" }}
              >
                <BellOutlined className="bell-icon" />
              </div>
            </Badge>
            
            <Dropdown 
              overlay={
                <Menu>
                  <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                    Çıkış Yap
                  </Menu.Item>
                </Menu>
              }
            >
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Avatar
                  size="medium"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <DownOutlined style={{ fontSize: "12px", marginLeft: "5px" }} />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Layout>
          <Sider 
            width={200} 
            theme="light" 
            collapsible 
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            breakpoint="lg"
            collapsedWidth={isMobile ? 0 : 80}
            className="admin-sidebar"
          >
            <div className="admin-logo">
              {!collapsed && <span>Step Filtre</span>}
            </div>
            <Menu
              mode="vertical"
              style={{
                height: "100%",
              }}
              items={menuItems}
              defaultSelectedKeys={[getActiveKey()]}
            />
          </Sider>
            <Content className="admin-content">
              <div
                className="site-layout-background content-container"
                style={{
                  padding: isMobile ? "16px" : "24px 50px",
                  minHeight: 360,
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                {children}
              </div>
            </Content>
          </Layout>
        </Layout>
    );
  } else {
    navigate("/");
    return null;
  }
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminLayout;
