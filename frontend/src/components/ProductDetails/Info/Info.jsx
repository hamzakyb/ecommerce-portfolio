import PropTypes from "prop-types";
import "./Info.css";
import { useContext, useRef, useState } from "react";
import { CartContext } from "../../../context/CartProvider";
import { message } from "antd";

const Info = ({ singleProduct }) => {
  const quantityRef = useRef();
  const { addToCart, cartItems } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const originalPrice = singleProduct.price.current;
  const discountPercentage = singleProduct.price.discount;
  const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;
  const filteredCard = cartItems.find((cartItem) => cartItem._id === singleProduct._id);

  const handleAddToCart = () => {
    setLoading(true);
    const quantity = parseInt(quantityRef.current.value);
    if (quantity <= 0) {
      message.error("Lütfen geçerli bir miktar girin.");
      setLoading(false);
      return;
    }
    if (quantity > singleProduct.stock) {
      message.error(`Yetersiz stok! Sadece ${singleProduct.stock} adet mevcut.`);
      setLoading(false);
      return;
    }
    if (filteredCard) {
      const totalQuantity = filteredCard.quantity + quantity;
      if (totalQuantity > singleProduct.stock) {
        message.error(`Yetersiz stok! Sepetinizde zaten ${filteredCard.quantity} adet var. Toplam ${singleProduct.stock} adet ekleyebilirsiniz.`);
        setLoading(false);
        return;
      }
    }
    const success = addToCart({
      ...singleProduct,
      price: discountedPrice,
      quantity: quantity,
    });
    if (success) {
      message.success("Ürün sepete eklendi!");
    }
    setLoading(false);
  };

  return (
    <div className="product-info-centered">
      <h1 className="product-title">{singleProduct.name}</h1>
      <div className="product-price">
        {discountPercentage > 0 && (
          <s className="old-price">{originalPrice.toFixed(2)}TL</s>
        )}
        <strong className="new-price">{discountedPrice.toFixed(2)}TL</strong>
        {discountPercentage > 0 && (
          <span className="discount">%{discountPercentage}</span>
        )}
      </div>
      <div className="product-description" dangerouslySetInnerHTML={{ __html: singleProduct.description }}></div>
      <div className="stock-value">
        <span>Stok: {singleProduct.stock}</span>
        {singleProduct.stock <= 5 && singleProduct.stock > 0 && (
          <span style={{ color: 'red', marginLeft: '10px' }}>Son {singleProduct.stock} ürün!</span>
        )}
        {singleProduct.stock === 0 && (
          <span style={{ color: 'red', marginLeft: '10px' }}>Stokta yok!</span>
        )}
      </div>
      <div className="cart-button">
        <input
          type="number"
          defaultValue="1"
          min="1"
          max={singleProduct.stock}
          id="quantity"
          ref={quantityRef}
          disabled={singleProduct.stock === 0}
        />
        <button
          className="btn btn-lg btn-primary"
          id="add-to-cart"
          type="button"
          disabled={filteredCard || singleProduct.stock === 0 || loading}
          onClick={handleAddToCart}
        >
          {loading ? "Ekleniyor..." : filteredCard ? "Sepette" : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
};

Info.propTypes = {
  singleProduct: PropTypes.object,
};

export default Info;