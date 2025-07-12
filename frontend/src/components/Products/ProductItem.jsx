import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "antd";
import "./ProductItem.css";

const ProductItem = ({ product }) => {

  return (
    <div className="product-item no-image-mode">
      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-prices">
          {product.price.discount > 0 && (
            <span className="old-price">
              {product.price.current.toFixed(2)} TL
            </span>
          )}
          <strong className="new-price">
            {(product.price.current - (product.price.current * product.price.discount) / 100).toFixed(2)} TL
          </strong>
          {product.price.discount > 0 && (
            <span className="discount">%{product.price.discount}</span>
          )}
        </div>
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">Stokta: {product.stock} adet</span>
          ) : (
            <span className="out-of-stock">Stokta Yok</span>
          )}
        </div>
        <Link to={`/product/${product._id}`} style={{ width: '100%' }}>
          <Button
            type="primary"
            block
            style={{ marginTop: 8 }}
          >
            Ürünü İncele
          </Button>
        </Link>
      </div>
    </div>
  );
};

ProductItem.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    img: PropTypes.arrayOf(PropTypes.string),
    price: PropTypes.shape({
      current: PropTypes.number.isRequired,
      discount: PropTypes.number
    }).isRequired,
    stock: PropTypes.number
  }).isRequired
};

export default ProductItem;
 