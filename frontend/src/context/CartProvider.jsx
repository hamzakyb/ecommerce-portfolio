import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { message } from "antd";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : []
  );
  
  const [couponInfo, setCouponInfo] = useState(
    localStorage.getItem("couponInfo")
      ? JSON.parse(localStorage.getItem("couponInfo"))
      : null
  );

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);
  
  useEffect(() => {
    if (couponInfo) {
      localStorage.setItem("couponInfo", JSON.stringify(couponInfo));
    } else {
      localStorage.removeItem("couponInfo");
    }
  }, [couponInfo]);

  const addToCart = (cartItem) => {
    // Stok kontrolü
    if (cartItem.quantity > cartItem.stock) {
      message.error(`Yetersiz stok! Sadece ${cartItem.stock} adet mevcut.`);
      return false;
    }

    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === cartItem._id);

      if (existingItem) {
        // Toplam miktar kontrolü
        const newQuantity = existingItem.quantity + cartItem.quantity;
        
        if (newQuantity > cartItem.stock) {
          message.error(`Yetersiz stok! Sepetinizde zaten ${existingItem.quantity} adet var. Toplam ${cartItem.stock} adet ekleyebilirsiniz.`);
          return prevCart;
        }
        
        // Eğer ürün zaten sepette varsa, sadece miktarını artır
        return prevCart.map((item) =>
          item._id === cartItem._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Ürün sepette yoksa, yeni ürünü sepete ekle
        return [
          ...prevCart,
          {
            ...cartItem,
            quantity: cartItem.quantity ? cartItem.quantity : 1,
          },
        ];
      }
    });

    return true;
  };

  const removeFromCart = (itemId) => {
    const filteredCartItems = cartItems.filter((cartItem) => {
      return cartItem._id !== itemId;
    });
    setCartItems(filteredCartItems);
  };
  
  const clearCouponInfo = () => {
    setCouponInfo(null);
  };

  return (
    <CartContext.Provider
      value={{
        addToCart,
        cartItems,
        setCartItems,
        removeFromCart,
        couponInfo,
        setCouponInfo,
        clearCouponInfo
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

CartProvider.propTypes = {
  children: PropTypes.node,
};