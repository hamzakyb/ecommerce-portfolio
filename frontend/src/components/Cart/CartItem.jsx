import PropTypes from "prop-types";
import { useContext } from "react";
import { CartContext } from "../../context/CartProvider";

const CartItem = ({ cartItem }) => {
  const { removeFromCart } = useContext(CartContext);

  return (
    <tr className="cart-item">
      <td className="product-name-cell">
        <span className="cell-label">Ürün</span>
        <span className="product-name-text">{cartItem.name}</span>
      </td>
      <td>
        <span className="cell-label">Fiyat</span>
        {Number(cartItem.price).toFixed(2)} TL
      </td>
      <td className="product-quantity">
        <span className="cell-label">Miktar</span>
        {cartItem.quantity}
      </td>
      <td className="product-subtotal">
        <span className="cell-label">Ara Toplam</span>
        {(cartItem.price * cartItem.quantity).toFixed(2)} TL
      </td>
      <td className="cart-remove">
        <span className="cell-label">Sil</span>
        <button
          className="delete-cart-btn"
          onClick={() => removeFromCart(cartItem._id)}
        >
          Sil
        </button>
      </td>
    </tr>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object,
};

export default CartItem;