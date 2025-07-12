import { message } from "antd";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartProvider";
import { getFullApiUrl } from '../../config/apiConfig';

const CartCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const { cartItems, setCartItems, setCouponInfo } = useContext(CartContext);
  // API URL'yi doğrudan kullanıyoruz, çünkü proxy ayarı zaten yapılandırılmış
  // const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const applyCoupon = async () => {
    if (couponCode.trim().length === 0) {
      return message.warning("Boş değer girilimez.");
    }
    try {
      // Doğrudan /api ile başlayan URL kullanıyoruz
      const res = await fetch(getFullApiUrl(`/coupons/code/${couponCode}`));

      if (!res.ok) {
        return message.warning("Girdiğiniz kupon kodu yanlış!");
      }

      const data = await res.json();
      const discountPercent = data.discountPercent;

      // Orijinal toplam tutarı hesapla
      const originalTotal = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // İndirim miktarını hesapla
      const discountAmount = originalTotal * (discountPercent / 100);

      // Kupon bilgilerini kaydet
      setCouponInfo({
        code: couponCode,
        discountPercent,
        discountAmount
      });

      // Ürün fiyatlarını güncelle
      const updatedCartItems = cartItems.map((item) => {
        const updatePrice = item.price * (1 - discountPercent / 100);
        return { ...item, price: updatePrice };
      });

      setCartItems(updatedCartItems);

      message.success(`${couponCode} kupon kodu başarıyla uygulandı. %${discountPercent} indirim kazandınız!`);
    } catch (error) {
      console.log(error);
      message.error("Kupon uygulanırken bir hata oluştu.");
    }
  };

  return (
    <div>
      <div className="actions-wrapper">
        <div className="coupon">
          <input
            type="text"
            className="input-text"
            placeholder="Kupon Kodu"
            onChange={(e) => setCouponCode(e.target.value)}
            value={couponCode}
          />
          <button className="btn" type="button" onClick={applyCoupon}>
            Kuponu Uygula
          </button>
        </div>
      </div>
      <div className="update-cart">
        <button className="btn update-cart-btn">Sepeti Güncelle</button>
      </div>
    </div>
  );
};

export default CartCoupon;