import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const MainCategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.CATEGORIES}/${categoryId}/products`));

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          message.error("Ürünleri getirme başarısız.");
        }
      } catch (error) {
        console.log("Ürün hatası:", error);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div>
      <h2>Kategoriye Ait Ürünler</h2>
      <ul>
        {products.map((product) => (
          <li key={product._id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MainCategoryPage;