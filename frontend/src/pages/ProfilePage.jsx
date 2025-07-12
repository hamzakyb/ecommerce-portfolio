import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Spin, Tabs, Avatar, Tag, Table, Empty, message, Card, Statistic, Row, Col, Timeline, Divider, Form, Input, Button } from "antd";
import { UserOutlined, ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, DollarOutlined, InboxOutlined, EditOutlined, SaveOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import "./ProfilePage.css";
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Kullanıcı bilgisi varsa kullanıcının siparişlerini getir, yoksa tüm siparişleri getir
        let response;
        
        if (user && user._id) {
          console.log("Kullanıcı ID ile siparişler getiriliyor:", user._id);
          response = await fetch(getFullApiUrl(`/orders/user/${user._id}`));
        } else {
          console.log("Tüm siparişler getiriliyor");
          response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.ORDERS));
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API yanıtı başarısız:", response.status, errorText);
          throw new Error(`Siparişler alınamadı: ${response.status} ${errorText}`);
        }
        
        let data = await response.json();
        
        // Eğer tüm siparişleri getiriyorsak ve kullanıcı bilgisi varsa, sadece kullanıcının siparişlerini filtrele
        if (!user?._id && data.length > 0 && data[0].userId) {
          console.log("Tüm siparişler alındı, kullanıcı siparişleri filtreleniyor");
          // Kullanıcı email'i ile eşleşen siparişleri filtrele
          if (user?.email) {
            data = data.filter(order => order.userEmail === user.email);
          }
        }
        
        console.log("Alınan siparişler:", data);
        setOrders(data);
        
        // İstatistikleri hesapla
        calculateStats(data);
      } catch (error) {
        console.error("Sipariş getirme hatası:", error);
        setError(error.message);
        message.error("Siparişleriniz yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // İstatistikleri hesaplama
  const calculateStats = (orderData) => {
    const totalOrders = orderData.length;
    const totalSpent = orderData.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orderData.filter(order => 
      order.status === "Beklemede" || order.status === "Onaylandı" || order.status === "Kargoya Verildi" ||
      order.status === "pending" || order.status === "processing"
    ).length;
    const completedOrders = orderData.filter(order => 
      order.status === "Tamamlandı" || order.status === "delivered"
    ).length;

    setStats({
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
    });
  };

  // Sipariş durumuna göre renk belirleme
  const getStatusColor = (status) => {
    switch (status) {
      case "Beklemede":
      case "pending":
        return "orange";
      case "Onaylandı":
      case "processing":
        return "blue";
      case "Kargoya Verildi":
        return "purple";
      case "Tamamlandı":
      case "delivered":
        return "green";
      case "İptal Edildi":
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // Sipariş durumunu Türkçe'ye çevirme
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "processing":
        return "Onaylandı";
      case "delivered":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  // Sipariş durumuna göre icon belirleme
  const getStatusIcon = (status) => {
    switch (status) {
      case "Beklemede":
      case "pending":
        return <ClockCircleOutlined style={{ color: "orange" }} />;
      case "Onaylandı":
      case "processing":
        return <CheckCircleOutlined style={{ color: "blue" }} />;
      case "Kargoya Verildi":
        return <InboxOutlined style={{ color: "purple" }} />;
      case "Tamamlandı":
      case "delivered":
        return <CheckCircleOutlined style={{ color: "green" }} />;
      case "İptal Edildi":
      case "cancelled":
        return <ClockCircleOutlined style={{ color: "red" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Sipariş tablosu için sütunlar
  const orderColumns = [
    {
      title: "Sipariş No",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <span>
          <span className="order-cell-label">Sipariş No: </span>
          <span className="order-id">{id.substring(0, 8)}...</span>
        </span>
      ),
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span>
          <span className="order-cell-label">Tarih: </span>
          {new Date(date).toLocaleDateString("tr-TR")}
        </span>
      ),
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: "Tutar",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <span>
          <span className="order-cell-label">Tutar: </span>
          {amount.toFixed(2)} ₺
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Ürün Sayısı",
      dataIndex: "items",
      key: "itemCount",
      render: (items) => (
        <span>
          <span className="order-cell-label">Ürün Sayısı: </span>
          {items.length}
        </span>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span>
          <span className="order-cell-label">Durum: </span>
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
        </span>
      ),
      filters: [
        { text: 'Beklemede', value: 'Beklemede' },
        { text: 'Beklemede', value: 'pending' },
        { text: 'Onaylandı', value: 'Onaylandı' },
        { text: 'Onaylandı', value: 'processing' },
        { text: 'Kargoya Verildi', value: 'Kargoya Verildi' },
        { text: 'Tamamlandı', value: 'Tamamlandı' },
        { text: 'Tamamlandı', value: 'delivered' },
        { text: 'İptal Edildi', value: 'İptal Edildi' },
        { text: 'İptal Edildi', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Sipariş detayları için sütunlar
  const orderDetailColumns = [
    {
      title: "Ürün",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="product-cell">
          <span className="order-cell-label">Ürün: </span>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>
          <span className="order-cell-label">Fiyat: </span>
          {price.toFixed(2)} ₺
        </span>
      ),
    },
    {
      title: "Adet",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <span>
          <span className="order-cell-label">Adet: </span>
          {quantity}
        </span>
      ),
    },
    {
      title: "Toplam",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total, record) => (
        <span>
          <span className="order-cell-label">Toplam: </span>
          {(record.price * record.quantity).toFixed(2)} ₺
        </span>
      ),
    },
  ];

  // Sipariş detaylarını genişletilebilir şekilde gösterme
  const expandedRowRender = (record) => {
    const statusText = getStatusText(record.status);
    
    return (
      <div className="order-details">
        <div className="order-status-timeline">
          <h4>Sipariş Durumu</h4>
          <Timeline
            items={[
              {
                color: statusText === "Beklemede" || statusText === "Onaylandı" || statusText === "Kargoya Verildi" || statusText === "Tamamlandı" ? "green" : "gray",
                children: 'Sipariş Alındı',
                dot: <CheckCircleOutlined />,
              },
              {
                color: statusText === "Onaylandı" || statusText === "Kargoya Verildi" || statusText === "Tamamlandı" ? "green" : "gray",
                children: 'Sipariş Onaylandı',
                dot: statusText === "Onaylandı" || statusText === "Kargoya Verildi" || statusText === "Tamamlandı" ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
              {
                color: statusText === "Kargoya Verildi" || statusText === "Tamamlandı" ? "green" : "gray",
                children: 'Kargoya Verildi',
                dot: statusText === "Kargoya Verildi" || statusText === "Tamamlandı" ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
              {
                color: statusText === "Tamamlandı" ? "green" : "gray",
                children: 'Teslim Edildi',
                dot: statusText === "Tamamlandı" ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
            ]}
          />
        </div>
        
        <Divider />
        
        <h4>Sipariş Detayları</h4>
        <Table
          columns={orderDetailColumns}
          dataSource={record.items}
          pagination={false}
          rowKey={(item) => item._id || `${item.productId}-${Math.random()}`}
        />
        <div className="order-summary">
          <div className="summary-item">
            <span>Ara Toplam:</span>
            <span>{(record.totalAmount - (record.coupon?.discountAmount || 0)).toFixed(2)} ₺</span>
          </div>
          {record.coupon && (
            <div className="summary-item">
              <span>İndirim ({record.coupon.code}):</span>
              <span>-{record.coupon.discountAmount.toFixed(2)} ₺ (%{record.coupon.discountPercent})</span>
            </div>
          )}
          <div className="summary-item total">
            <span>Genel Toplam:</span>
            <span>{record.totalAmount.toFixed(2)} ₺</span>
          </div>
        </div>
      </div>
    );
  };

  // Son 5 siparişi göster
  const recentOrders = orders.slice(0, 5);

  // Profil formunu başlat
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        companyName: user.companyName || '',
        taxNumber: user.taxNumber || '',
        taxOffice: user.taxOffice || '',
      });
    }
  }, [user, profileForm]);

  // Profil bilgilerini güncelleme
  const handleProfileUpdate = async (values) => {
    setProfileLoading(true);
    try {
      const success = await updateUserProfile(values);
      if (success) {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      message.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setProfileLoading(false);
    }
  };

  const items = [
    {
      key: "1",
      label: "Sipariş Özeti",
      children: (
        <div className="order-summary-container">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="error-container">
              <Empty
                description={
                  <div>
                    <p>Siparişleriniz yüklenirken bir hata oluştu</p>
                    <p className="error-message">{error}</p>
                    <p>Kullanıcı ID: {user?._id || "Bulunamadı"}</p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]} className="stats-row">
                <Col xs={12} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Toplam Sipariş"
                      value={stats.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Toplam Harcama"
                      value={stats.totalSpent.toFixed(2)}
                      suffix="₺"
                      prefix={<DollarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Aktif Siparişler"
                      value={stats.pendingOrders}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Tamamlanan Siparişler"
                      value={stats.completedOrders}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">Son Siparişlerim</Divider>
              
              {recentOrders.length > 0 ? (
                <div className="recent-orders">
                  {recentOrders.map((order) => (
                    <Card key={order._id} className="recent-order-card">
                      <div className="recent-order-header">
                        <div>
                          <span className="order-id">#{order._id.substring(0, 8)}...</span>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                      </div>
                      <div className="recent-order-items">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="recent-order-item">
                            {item.img ? (
                              <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=100`}
                                alt={item.name} 
                                className="item-image" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=100`;
                                }}
                              />
                            ) : (
                              <div className="no-image-small">Resim Yok</div>
                            )}
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-price">{item.quantity} x {item.price.toFixed(2)} ₺</div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="more-items">+{order.items.length - 2} daha fazla ürün</div>
                        )}
                      </div>
                      <div className="recent-order-total">
                        <span>Toplam:</span>
                        <span className="total-amount">{order.totalAmount.toFixed(2)} ₺</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="Henüz siparişiniz bulunmamaktadır" />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: "Tüm Siparişlerim",
      children: (
        <div className="orders-container">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="error-container">
              <Empty
                description={
                  <div>
                    <p>Siparişleriniz yüklenirken bir hata oluştu</p>
                    <p className="error-message">{error}</p>
                    <p>Kullanıcı ID: {user?._id || "Bulunamadı"}</p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : orders.length > 0 ? (
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="_id"
              expandable={{
                expandedRowRender,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <button
                    className="expand-details-btn"
                    onClick={e => onExpand(record, e)}
                    style={{
                      background: expanded ? '#1890ff' : '#f0f1f5',
                      color: expanded ? '#fff' : '#222',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 18px',
                      fontWeight: 600,
                      fontSize: '1em',
                      cursor: 'pointer',
                      boxShadow: expanded ? '0 2px 8px rgba(24,144,255,0.13)' : 'none',
                      transition: 'all 0.2s',
                      margin: '8px 0',
                      outline: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {expanded ? <DownOutlined style={{marginRight:4}} /> : <RightOutlined style={{marginRight:4}} />}
                    Detaylı Gör
                  </button>
                ),
              }}
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty
              description="Henüz siparişiniz bulunmamaktadır"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: "Hesap Bilgilerim",
      children: (
        <div className="account-info">
          {editMode ? (
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
              className="profile-form"
              initialValues={{
                username: user?.username || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
                city: user?.city || '',
                postalCode: user?.postalCode || '',
                companyName: user?.companyName || '',
                taxNumber: user?.taxNumber || '',
                taxOffice: user?.taxOffice || '',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    label="Ad Soyad"
                    rules={[{ required: true, message: 'Lütfen adınızı ve soyadınızı girin' }]}
                  >
                    <Input placeholder="Ad Soyad" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="E-posta"
                  >
                    <Input disabled placeholder="E-posta" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Telefon"
                  >
                    <Input placeholder="Telefon" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="address"
                    label="Adres"
                  >
                    <Input.TextArea rows={3} placeholder="Adres" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="city"
                    label="Şehir"
                  >
                    <Input placeholder="Şehir" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="postalCode"
                    label="Posta Kodu"
                  >
                    <Input placeholder="Posta Kodu" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">Şirket Bilgileri</Divider>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="companyName"
                    label="Şirket Adı"
                  >
                    <Input placeholder="Şirket Adı" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="taxNumber"
                    label="Vergi Numarası"
                  >
                    <Input placeholder="Vergi Numarası" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="taxOffice"
                    label="Vergi Dairesi"
                  >
                    <Input placeholder="Vergi Dairesi" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={profileLoading}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    profileForm.resetFields();
                  }}
                  style={{ marginLeft: 8 }}
                >
                  İptal
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <>
              <div className="info-header">
                <h3>Kişisel Bilgiler</h3>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => setEditMode(true)}
                >
                  Düzenle
                </Button>
              </div>
              
              <div className="info-item">
                <span className="label">Ad Soyad:</span>
                <span className="value">{user?.username || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">E-posta:</span>
                <span className="value">{user?.email || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Telefon:</span>
                <span className="value">{user?.phone || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Adres:</span>
                <span className="value">{user?.address || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Şehir:</span>
                <span className="value">{user?.city || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Posta Kodu:</span>
                <span className="value">{user?.postalCode || "Belirtilmemiş"}</span>
              </div>
              
              <Divider orientation="left">Şirket Bilgileri</Divider>
              
              <div className="info-item">
                <span className="label">Şirket Adı:</span>
                <span className="value">{user?.companyName || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Vergi Numarası:</span>
                <span className="value">{user?.taxNumber || "Belirtilmemiş"}</span>
              </div>
              <div className="info-item">
                <span className="label">Vergi Dairesi:</span>
                <span className="value">{user?.taxOffice || "Belirtilmemiş"}</span>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <Avatar 
            size={100} 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "Kullanıcı")}&background=random&color=fff&size=100`}
            icon={<UserOutlined />}
          />
        </div>
        <div className="profile-info">
          <h1>{user?.username || "Kullanıcı"}</h1>
          <p>{user?.email}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <ShoppingCartOutlined />
              <span>{stats.totalOrders} Sipariş</span>
            </div>
            <div className="stat-item">
              <DollarOutlined />
              <span>{stats.totalSpent.toFixed(2)} ₺ Harcama</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  );
};

export default ProfilePage; 