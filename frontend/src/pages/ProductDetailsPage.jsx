import { useEffect, useState } from "react";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import { useParams } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

const ProductDetailsPage = () => {
  const [singleProduct, setSingleProduct] = useState(null);
  const { id: productId } = useParams();
  
  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/${productId}`));
       
        if (!response.ok) {
          throw new Error("Verileri getirme hatası");
        }
        
        const data = await response.json();
        setSingleProduct(data);
      } catch (error) {
        console.log("Veri hatası:", error);
      }
    };
    fetchSingleProduct();
  }, [productId]);
  
  return singleProduct ? (
    <ProductDetails singleProduct={singleProduct} setSingleProduct={setSingleProduct} />
  ) : (
    <p>Ürün Yükleniyor</p>
  );
};

export default ProductDetailsPage;