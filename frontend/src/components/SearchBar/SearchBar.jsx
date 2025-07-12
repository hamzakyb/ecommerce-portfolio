import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Dışarı tıklandığında sonuçları gizle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Arama sorgusu değiştiğinde API'ye istek gönder
  useEffect(() => {
    // Önceki timeout'u temizle
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Sorgu boşsa sonuçları temizle
    if (query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      setShowResults(false);
      return;
    }

    // Yükleniyor durumunu hemen göster
    setLoading(true);

    // Yeni bir timeout oluştur (debounce)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/search/${encodeURIComponent(query.trim())}`));
        
        if (!response.ok) {
          throw new Error('Arama yapılırken bir hata oluştu!');
        }

        const data = await response.json();
        
        // Arama sonuçlarını işle (daha basit ve hızlı)
        const processedResults = data.map(product => {
          const searchTermLower = query.toLowerCase();
          const nameLower = product.name ? product.name.toLowerCase() : '';
          const descriptionLower = product.description ? product.description.toLowerCase() : '';
          
          // İsimde veya açıklamada eşleşme var mı kontrol et
          const nameMatch = nameLower.includes(searchTermLower);
          const descriptionMatch = descriptionLower.includes(searchTermLower);
          
          // Benzer ürünlerde eşleşme var mı kontrol et
          let similarProductMatch = false;
          let matchingSimilarProduct = null;
          
          if (product.similarProducts && product.similarProducts.length > 0) {
            for (const similarProduct of product.similarProducts) {
              if (!similarProduct) continue;
              
              const similarNameMatch = similarProduct.name && 
                similarProduct.name.toLowerCase().includes(searchTermLower);
              
              const similarDescriptionMatch = similarProduct.description && 
                similarProduct.description.toLowerCase().includes(searchTermLower);
              
              if (similarNameMatch || similarDescriptionMatch) {
                similarProductMatch = true;
                matchingSimilarProduct = similarProduct;
                break;
              }
            }
          }
          
          // Basit vurgulama işlemi
          let highlightedName = product.name;
          let highlightedDescription = '';
          let matchInfo = '';
          
          // İsimde eşleşme varsa
          if (nameMatch) {
            const index = nameLower.indexOf(searchTermLower);
            highlightedName = 
              product.name.substring(0, index) +
              '<span class="highlight">' + 
              product.name.substring(index, index + searchTermLower.length) + 
              '</span>' +
              product.name.substring(index + searchTermLower.length);
          }
          
          // Açıklamada eşleşme varsa
          if (descriptionMatch) {
            const index = descriptionLower.indexOf(searchTermLower);
            // Eşleşen kısmın etrafından bir miktar metin al (daha az metin)
            const start = Math.max(0, index - 20);
            const end = Math.min(product.description.length, index + searchTermLower.length + 20);
            
            highlightedDescription = 
              (start > 0 ? '...' : '') + 
              product.description.substring(start, index) +
              '<span class="highlight">' + 
              product.description.substring(index, index + searchTermLower.length) + 
              '</span>' +
              product.description.substring(index + searchTermLower.length, end) + 
              (end < product.description.length ? '...' : '');
            
            // Açıklamada eşleşme varsa ve isimde eşleşme yoksa, ismi de vurgula
            if (!nameMatch) {
              highlightedName = '<span class="match-by-description">' + product.name + '</span>';
            }
          } 
          // Benzer ürünlerde eşleşme varsa
          else if (similarProductMatch && matchingSimilarProduct) {
            highlightedName = '<span class="match-by-similar">' + product.name + '</span>';
            
            // Benzer ürün bilgisini ekle
            matchInfo = `<div class="similar-match-info">
              <span class="similar-match-label">Benzer Ürün:</span>
              <span class="similar-match-name">${matchingSimilarProduct.name}</span>
            </div>`;
            
            // Açıklama yoksa, benzer ürün bilgisini göster
            if (!descriptionMatch) {
              highlightedDescription = product.description && product.description.length > 50 
                ? product.description.substring(0, 50) + '...' 
                : (product.description || 'Açıklama yok');
            }
          }
          else if (!nameMatch && !descriptionMatch && !similarProductMatch) {
            // Hiçbir eşleşme yoksa, açıklamanın ilk kısmını göster
            highlightedDescription = product.description && product.description.length > 50 
              ? product.description.substring(0, 50) + '...' 
              : (product.description || 'Açıklama yok');
          }
          
          return {
            ...product,
            highlightedName,
            highlightedDescription,
            matchInfo,
            // Öncelik sırası: isim eşleşmesi > açıklama eşleşmesi > benzer ürün eşleşmesi
            priority: nameMatch ? 1 : (descriptionMatch ? 2 : (similarProductMatch ? 3 : 4))
          };
        });
        
        // Önceliğe göre sırala (daha basit sıralama)
        const sortedResults = processedResults.sort((a, b) => a.priority - b.priority);
        
        setResults(sortedResults);
        setShowResults(true);
      } catch (error) {
        console.error('Arama hatası:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length > 0) {
      setLoading(true); // Kullanıcı yazarken hemen yükleniyor durumunu göster
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Ürün ara..."
          value={query}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <button className="search-button" aria-label="Ara">
          <i className="bi bi-search"></i>
        </button>
      </div>
      
      {showResults && (
        <div className="search-results-container">
          {loading ? (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <span>Aranıyor...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="search-no-results">Ürün bulunamadı</div>
          ) : (
            <ul className="search-results-list">
              {results.map((product) => (
                <li key={product._id} className="search-result-item">
                  <Link 
                    to={`/product/${product._id}`} 
                    className="search-result-link"
                    onClick={handleResultClick}
                  >
                    <div className="search-result-image">
                      {product.img && product.img.length > 0 ? (
                        <img src={product.img[0]} alt={product.name} />
                      ) : (
                        <div className="no-image">Resim Yok</div>
                      )}
                    </div>
                    <div className="search-result-info">
                      <h4 
                        className="search-result-title"
                        dangerouslySetInnerHTML={{ __html: product.highlightedName }}
                      />
                      <div 
                        className="search-result-description"
                        dangerouslySetInnerHTML={{ __html: product.highlightedDescription }}
                      />
                      {product.matchInfo && (
                        <div 
                          className="search-result-similar-info"
                          dangerouslySetInnerHTML={{ __html: product.matchInfo }}
                        />
                      )}
                      <div className="search-result-price">
                        {product.price && (
                          <span className="price">
                            {product.price.current ? `${product.price.current.toFixed(2)} TL` : 'Fiyat bilgisi yok'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 