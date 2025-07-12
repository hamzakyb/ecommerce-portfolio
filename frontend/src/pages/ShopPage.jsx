import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Spin, message } from 'antd'
import Categories from '../components/Categories/Categories'
import Products from '../components/Products/Products'
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const ShopPage = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = getFullApiUrl(API_CONFIG.API_ENDPOINTS.PRODUCTS);
        if (searchTerm) {
          url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Ürünler getirilemedi!");
        }

        const data = await response.json();
        setFilteredProducts(data);
      } catch (error) {
        console.error("Veri getirme hatası:", error);
        message.error("Ürünler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  return (
    <React.Fragment>
      <Categories />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Products products={filteredProducts} />
      )}
    </React.Fragment>
  )
}

export default ShopPage