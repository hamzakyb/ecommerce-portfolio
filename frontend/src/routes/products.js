import { API_CONFIG, getFullApiUrl } from '../config/apiConfig';

// Ürün arama fonksiyonu (frontend için)
export async function searchProducts(query) {
  try {
    const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/search/${encodeURIComponent(query)}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Arama hatası:', error);
    throw error;
  }
}
