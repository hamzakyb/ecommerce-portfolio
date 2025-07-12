import { useState } from "react";
import { List, Typography, Badge, Space, Button, Tabs, Empty, Spin, message } from "antd";
import { 
  BellOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  ShoppingOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNotification } from "../../context/NotificationContext";
import "./NotificationsPage.css";

const { Title } = Typography;

const NotificationsPage = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications,
    refreshNotifications
  } = useNotification();
  const [activeTab, setActiveTab] = useState("all");

  // Bildirim simgesi
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;
      case 'user':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      case 'product':
        return <ShoppingOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread" 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.type === activeTab);

  const orderCount = notifications.filter(n => n.type === "order").length;
  const userCount = notifications.filter(n => n.type === "user").length;
  const productCount = notifications.filter(n => n.type === "product").length;

  const tabItems = [
    {
      key: "all",
      label: (
        <span>
          Tümü
          <Badge count={notifications.length} style={{ marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: "unread",
      label: (
        <span>
          Okunmamış
          <Badge count={unreadCount} style={{ marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: "order",
      label: (
        <span>
          Siparişler
          <Badge count={orderCount} style={{ marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: "user",
      label: (
        <span>
          Kullanıcılar
          <Badge count={userCount} style={{ marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: "product",
      label: (
        <span>
          Ürünler
          <Badge count={productCount} style={{ marginLeft: 8 }} />
        </span>
      ),
    },
  ];

  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Bildirimleri yenile ve kullanıcıya bildir
  const handleRefresh = () => {
    refreshNotifications();
    message.success('Bildirimler yenilendi');
  };

  return (
      <div className="notifications-page">
        <div className="notifications-header">
          <Title level={2}>Bildirimler</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Yenile
            </Button>
            {unreadCount > 0 && (
              <Button 
                icon={<CheckOutlined />} 
                onClick={markAllAsRead}
                disabled={loading}
              >
                Tümünü Okundu İşaretle
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={deleteAllNotifications}
                disabled={loading}
              >
                Tümünü Sil
              </Button>
            )}
          </Space>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          className="notifications-tabs"
        />

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Bildirimler yükleniyor...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty 
            description="Bildirim bulunamadı" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <List
            className="notifications-list"
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={item => (
              <List.Item
              key={item._id}
                className={`notification-item ${item.read ? 'read' : 'unread'}`}
                actions={[
                  !item.read && (
                    <Button 
                    key="okundu"
                      type="text" 
                      icon={<CheckOutlined />} 
                      onClick={() => markAsRead(item._id)}
                    >
                      Okundu
                    </Button>
                  ),
                  <Button 
                  key="sil"
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => deleteNotification(item._id)}
                  >
                    Sil
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="notification-icon">
                      {getNotificationIcon(item.type)}
                    </div>
                  }
                  title={
                    <div className="notification-title">
                      {item.title}
                      {!item.read && <Badge status="processing" />}
                    </div>
                  }
                  description={
                    <div className="notification-content">
                      <div className="notification-message">{item.message}</div>
                      <div className="notification-time">{formatDate(item.createdAt)}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
  );
};

export default NotificationsPage; 