import { useEffect, useState } from "react";
import { Spin, Card, List, Avatar, Divider, Tag } from "antd";
import { CheckCircleOutlined, ShoppingOutlined } from "@ant-design/icons";
import "./Success.css";

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // localStorage'dan sipariş verilerini al
    const lastOrder = localStorage.getItem("lastOrder");
    if (lastOrder) {
      try {
        const parsedOrder = JSON.parse(lastOrder);
        
        // Resimleri güvenli hale getir
        if (parsedOrder.items && Array.isArray(parsedOrder.items)) {
          parsedOrder.items = parsedOrder.items.map(item => {
            if (item.img && typeof item.img === 'string' && item.img.includes('instagram.fhty2-1.fna.fbcdn.net')) {
              item.img = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`;
            }
            return item;
          });
        }
        
        setOrderData(parsedOrder);
      } catch (error) {
        console.error("Sipariş verisi ayrıştırma hatası:", error);
      }
    }

    // Yükleme animasyonu için zamanlayıcı
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="success-page">
      <div className="container">
        {loading ? (
          <div className="loading">
            <Spin size="large" />
            <p>Siparişiniz işleniyor...</p>
          </div>
        ) : (
          <div className="success-content">
            <CheckCircleOutlined className="success-icon" />
            <h2>Siparişiniz Başarıyla Oluşturuldu!</h2>
            
            {orderData && (
              <Card className="order-summary-card">
                <h3>Sipariş Özeti</h3>
                <p className="order-id">Sipariş No: {orderData._id}</p>
                <p className="order-date">Tarih: {new Date(orderData.createdAt).toLocaleDateString("tr-TR")}</p>
                <Tag color="orange">Beklemede</Tag>
                
                <Divider />
                
                <List
                  itemLayout="horizontal"
                  dataSource={orderData.items}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            src={item.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`} 
                            shape="square" 
                            size={64} 
                          />
                        }
                        title={item.name}
                        description={`${item.quantity} adet x ${item.price.toFixed(2)} ₺`}
                      />
                      <div className="item-total">{(item.price * item.quantity).toFixed(2)} ₺</div>
                    </List.Item>
                  )}
                />
                
                <Divider />
                
                <div className="order-totals">
                  <div className="total-row">
                    <span>Ara Toplam:</span>
                    <span>{(orderData.totalAmount - (orderData.coupon?.discountAmount || 0)).toFixed(2)} ₺</span>
                  </div>
                  {orderData.coupon && (
                    <div className="total-row">
                      <span>İndirim ({orderData.coupon.code}):</span>
                      <span>-{orderData.coupon.discountAmount.toFixed(2)} ₺ (%{orderData.coupon.discountPercent})</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>Genel Toplam:</span>
                    <span>{orderData.totalAmount.toFixed(2)} ₺</span>
                  </div>
                </div>
              </Card>
            )}
            
            <div className="buttons">
              <a href="/" className="btn btn-primary">
                <ShoppingOutlined /> Alışverişe Devam Et
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;
