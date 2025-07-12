import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { message, Spin } from "antd";
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';
import PropTypes from 'prop-types';
import "./Products.css";

const Products = ({ products: propProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
    } else {
      fetchProducts();
    }
  }, [propProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.PRODUCTS), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ürünler getirilemedi!");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Geçersiz veri formatı!");
      }
      
      setProducts(data);
    } catch (error) {
      console.error("Veri getirme hatası:", error);
      setError(error.message);
      message.error("Ürünler yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="products">
      <div className="container">
        <div className="section-title">
          <h2>Tüm Ürünler</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : products.length === 0 ? (
            <p>Ürün bulunamadı.</p>
          ) : (
            <p>Tüm Filtre Ürünleri</p>
          )}
        </div>
        <Spin spinning={loading}>
          <div className="products-wrapper">
            {products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        </Spin>
      </div>
    </section>
  );
};

Products.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.shape({
      current: PropTypes.number.isRequired,
      discount: PropTypes.number
    }).isRequired,
    img: PropTypes.arrayOf(PropTypes.string).isRequired
  }))
};

Products.defaultProps = {
  products: []
};

export default Products;
