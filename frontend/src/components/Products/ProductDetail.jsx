import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = ({ product }) => {
  const { id } = useParams();

  // Ürün bilgilerini al
  // Örnek olarak, product prop'u ile geçildiğini varsayıyorum
  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <img src={product.img[0]} alt={product.name} />
      <p>{product.description}</p>
      <h3>Fiyat: {product.price.current.toFixed(2)} TL</h3>
      {/* Diğer detaylar */}
    </div>
  );
};

export default ProductDetail; 