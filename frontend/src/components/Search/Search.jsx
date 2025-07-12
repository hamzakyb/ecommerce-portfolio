import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (query) {
                try {
                    const response = await axios.get(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/search?q=${query}`));
                    setResults(response.data);
                } catch (error) {
                    console.error("Arama hatası:", error);
                }
            } else {
                setResults([]); // Eğer arama terimi boşsa sonuçları temizle
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300); // 300ms gecikme ile arama yap

        return () => clearTimeout(delayDebounceFn); // Temizleme işlemi
    }, [query]);

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ürün ara..."
            />
            <ul>
                {results.map(product => (
                    <li key={product._id}>{product.name} - {product.description}</li>
                ))}
            </ul>
        </div>
    );
};

export default Search;