import { useContext } from "react";
import { CartContext } from "../../context/CartProvider";
import { useAuth } from "../../context/AuthContext";
import { message, Card, Button, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, TagOutlined, DollarOutlined } from "@ant-design/icons";
import "./CartTotals.css";
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const CartTotals = () => {
  const { cartItems, setCartItems, couponInfo, clearCouponInfo } = useContext(CartContext);
  const { user, refreshUserData, isTokenValid } = useAuth();
  const navigate = useNavigate();

  const cartItemTotals = cartItems.map((item) => {
    const itemPrice = item.price.current || item.price;
    return itemPrice * item.quantity;
  });

  const subTotals = cartItemTotals.reduce((prev, curr) => prev + curr, 0);
  const cartTotals = subTotals.toFixed(2);

  const handleOrder = async () => {
    // Kullanıcı bilgilerini kontrol et ve gerekirse localStorage'dan yeniden al
    let currentUser = user;
    
    if (!currentUser || (!currentUser._id && !currentUser.id)) {
      // localStorage'dan kullanıcı bilgilerini almayı dene
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
          console.log("Kullanıcı bilgileri localStorage'dan alındı:", currentUser);
          
          // Token geçerliliğini kontrol et
          if (currentUser.token && !isTokenValid(currentUser.token)) {
            message.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
            localStorage.removeItem('user');
            navigate("/auth");
            return;
          }
        } catch (error) {
          console.error("localStorage'dan kullanıcı bilgisi alınırken hata:", error);
        }
      }
    }
    
    // Kullanıcı ID'sini belirle (_id veya id alanını kullan)
    const userId = currentUser?.id || currentUser?._id;
    
    // Hala kullanıcı bilgisi yoksa, giriş yapma sayfasına yönlendir
    if (!currentUser || !userId) {
      message.error("Kullanıcı bilgileri bulunamadı. Lütfen giriş yapın.");
      navigate("/auth");
      return;
    }
    
    // Sipariş öncesi kullanıcı bilgilerini yenilemeyi dene (zorunlu güncelleme)
    // Bu, sipariş işlemi öncesinde kullanıcı bilgilerinin güncel olmasını sağlar
    await refreshUserData(true);

    // Ürün resimlerini güvenli hale getir
    const safeItems = cartItems.map(item => ({
      productId: item.productId || item._id || item.id,
      quantity: item.quantity,
      price: item.price.current || item.price,
      name: item.name
    }));

    try {
      console.log("Sipariş gönderiliyor, kullanıcı ID:", userId);
      
      // Sipariş verilerini hazırla
      const orderData = {
        userId: userId,
        items: safeItems,
        totalAmount: parseFloat(cartTotals),
        cargoFee: 0,
      };
      
      // Kupon bilgisi varsa ekle
      if (couponInfo) {
        orderData.coupon = {
          code: couponInfo.code,
          discountPercent: couponInfo.discountPercent,
          discountAmount: couponInfo.discountAmount
        };
      }
      
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.ORDERS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderData = await response.json();
        localStorage.setItem("lastOrder", JSON.stringify(orderData));
        message.success("Siparişiniz başarıyla oluşturuldu!");
        setCartItems([]);
        clearCouponInfo(); // Kupon bilgilerini temizle
        localStorage.removeItem("cart");
        navigate("/success");
      } else {
        // Yetkilendirme hatası durumunda
        if (response.status === 401 || response.status === 403) {
          message.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
          localStorage.removeItem('user'); // Geçersiz kullanıcı bilgilerini temizle
          navigate("/auth");
          return;
        }
        
        try {
          const errorData = await response.json();
          
          // Stok hatası kontrolü
          if (errorData.error && errorData.error.includes("Yetersiz stok")) {
            message.error(errorData.error);
            // Sepeti güncellemek için sayfayı yenile
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }
          
          message.error(errorData.error || "Sipariş oluşturulurken bir hata oluştu.");
        } catch (error) {
          console.error("Sipariş hatası:", error);
          message.error("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        }
      }
    } catch (error) {
      console.error("Sipariş gönderme hatası:", error);
      message.error("Sunucu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.");
    }
  };

  return (
    <Card className="cart-totals-card">
      <div className="cart-totals-header">
        <ShoppingCartOutlined className="cart-icon" />
        <h2>Sepet Özeti</h2>
      </div>
      
      <div className="cart-totals-content">
        <div className="totals-row">
          <div className="totals-label">
            <DollarOutlined />
            <span>Ara Toplam</span>
          </div>
          <div className="totals-value">
            <span>{subTotals.toFixed(2)} ₺</span>
          </div>
        </div>

        {couponInfo && (
          <>
            <Divider className="totals-divider" />
            <div className="totals-row discount">
              <div className="totals-label">
                <TagOutlined />
                <span>Kupon İndirimi ({couponInfo.code})</span>
              </div>
              <div className="totals-value">
                <span className="discount-amount">
                  -{couponInfo.discountAmount.toFixed(2)} ₺ (%{couponInfo.discountPercent})
                </span>
              </div>
            </div>
          </>
        )}

        <Divider className="totals-divider" />
        
        <div className="totals-row grand-total">
          <div className="totals-label">
            <DollarOutlined />
            <span>Genel Toplam</span>
          </div>
          <div className="totals-value">
            <span className="grand-total-amount">
              {(
                couponInfo
                  ? (subTotals - couponInfo.discountAmount)
                  : subTotals
              ).toFixed(2)} ₺
            </span>
          </div>
        </div>
      </div>

      <div className="cart-totals-footer">
        <Button 
          type="primary" 
          size="large" 
          block 
          onClick={handleOrder}
          className="checkout-button"
        >
          Siparişi Tamamla
        </Button>
      </div>
    </Card>
  );
};

export default CartTotals;