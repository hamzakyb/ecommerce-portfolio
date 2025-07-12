import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Spin, message, Button, InputNumber, Rate, Row, Col, Card } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { CartContext } from "../context/CartProvider";
import { Link } from "react-router-dom";
import "./ProductDetails.css";
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { addToCart, cartItems } = useContext(CartContext);

  const isInCart = cartItems.find((item) => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Ürün detayları getiriliyor, ID:", id);
        const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/${id}`));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Ürün detayları getirilemedi!");
        }

        const data = await response.json();
        console.log("Ürün detayları alındı:", data);
        
        if (!data || !data._id) {
          throw new Error("Geçersiz ürün verisi!");
        }
        
        const productWithStock = {
          ...data,
          stockQuantity: data.stock || 0
        };
        setProduct(productWithStock);
        
        // Benzer ürünleri getir
        if (data.similarProducts && data.similarProducts.length > 0) {
          fetchSimilarProducts(data.similarProducts);
        }
      } catch (error) {
        console.error("Veri getirme hatası:", error);
        setError(error.message || "Ürün detayları yüklenirken bir hata oluştu.");
        message.error("Ürün detayları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Geçersiz ürün ID'si!");
    }
  }, [id]);
  
  const fetchSimilarProducts = async (similarProductIds) => {
    try {
      const promises = similarProductIds.map(productId => 
        fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/${productId}`)).then(res => {
          if (!res.ok) throw new Error(`Benzer ürün getirilemedi: ${productId}`);
          return res.json();
        })
      );
      
      const similarProductsData = await Promise.all(promises);
      setSimilarProducts(similarProductsData.filter(Boolean));
    } catch (error) {
      console.error("Benzer ürünleri getirme hatası:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (isInCart) {
      message.warning("Bu ürün zaten sepetinizde!");
      return;
    }

    const productToAdd = {
      ...product,
      quantity,
      price: calculateDiscountedPrice(product.price.current, product.price.discount),
    };

    addToCart(productToAdd);
    message.success("Ürün sepete eklendi!");
  };

  // Benzer ürünü sepete ekle
  const handleAddSimilarToCart = (similarProduct, event) => {
    event.preventDefault(); // Link'in çalışmasını engelle
    
    // Ürün zaten sepette mi kontrol et
    if (cartItems.find((item) => item._id === similarProduct._id)) {
      message.warning("Bu ürün zaten sepetinizde!");
      return;
    }
    
    const productToAdd = {
      ...similarProduct,
      quantity: 1, // Varsayılan olarak 1 adet ekle
      price: calculateDiscountedPrice(similarProduct.price.current, similarProduct.price.discount),
    };
    
    addToCart(productToAdd);
    message.success(`${similarProduct.name} sepete eklendi!`);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Hata!</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return <div className="error-container">Ürün bulunamadı.</div>;
  }

  return (
    <div className="product-details">
      <div className="container">
        <div className="product-details-wrapper">
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-review">
              <Rate disabled defaultValue={4.5} allowHalf />
              <span className="review-count">(7 Değerlendirme)</span>
            </div>
            <div className="product-price">
              {product.price.discount > 0 && (
                <span className="old-price">
                  {product.price.current.toFixed(2)} TL
                </span>
              )}
              <strong className="new-price">
                {calculateDiscountedPrice(
                  product.price.current,
                  product.price.discount
                ).toFixed(2)} TL
              </strong>
              {product.price.discount > 0 && (
                <span className="discount">%{product.price.discount} İndirim</span>
              )}
            </div>
            <p className="product-description" 
               dangerouslySetInnerHTML={{ __html: product.description }}>
            </p>
            <div className="stock-info">
              <span className="stock-label">Stok Durumu:</span>
              <span className="stock-value">
                {product.stock > 0 
                  ? `${product.stock} adet` 
                  : "Stokta Yok"}
              </span>
            </div>
            <div className="product-actions">
              <div className="quantity-selector">
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value)}
                  disabled={!product.stock}
                />
              </div>
              <Button 
                type="primary" 
                size="large"
                onClick={handleAddToCart}
                disabled={isInCart || !product.stock}
              >
                {isInCart ? 'Sepette' : product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
              </Button>
            </div>
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Kategori:</span>
                <span className="meta-value">{product.categoryName}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Ürün Kodu:</span>
                <span className="meta-value">{product._id}</span>
              </div>
            </div>
          </div>
          
          {/* Benzer Ürünler Bölümü */}
          {similarProducts.length > 0 && (
            <div className="similar-products-section">
              <h2 className="section-title">Benzer Ürünler</h2>
              <Row gutter={[16, 16]} className="similar-products-grid">
                {similarProducts.map((similarProduct) => (
                  <Col xs={12} sm={8} md={6} key={similarProduct._id}>
                    <Link to={`/product/${similarProduct._id}`}>
                      <Card 
                        hoverable 
                        className="similar-product-card"
                      >
                        <Card.Meta 
                          title={similarProduct.name} 
                          description={
                            <div className="similar-product-price">
                              {similarProduct.price.current.toFixed(2)} TL
                              {similarProduct.price.discount > 0 && (
                                <span className="similar-discount">%{similarProduct.price.discount}</span>
                              )}
                            </div>
                          } 
                        />
                        <Button 
                          type="primary" 
                          icon={<ShoppingCartOutlined />} 
                          className="similar-product-button"
                          onClick={(e) => handleAddSimilarToCart(similarProduct, e)}
                          disabled={!similarProduct.stock || similarProduct.stock <= 0}
                        >
                          {cartItems.find((item) => item._id === similarProduct._id) 
                            ? 'Sepette' 
                            : similarProduct.stock > 0 
                              ? 'Sepete Ekle' 
                              : 'Stokta Yok'}
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 