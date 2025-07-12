import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Search.css";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const Search = ({ isSearchShow, setIsSearchShow }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Kullanıcı giriş yapmamışsa ve modal açıksa, modalı kapat ve uyarı göster
  useEffect(() => {
    if (isSearchShow && !user) {
      setIsSearchShow(false);
      message.warning("Arama yapmak için önce giriş yapmalısınız!");
      navigate("/auth");
    }
  }, [isSearchShow, user, setIsSearchShow, navigate]);

  const handleCloseModal = () => {
    setIsSearchShow(false);
    setSearchResults(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Kullanıcı giriş yapmamışsa, arama yapmasını engelle
    if (!user) {
      message.warning("Arama yapmak için önce giriş yapmalısınız!");
      setIsSearchShow(false);
      navigate("/auth");
      return;
    }
    
    const productName = e.target[0].value;

    if (productName.trim().length === 0) {
      message.warning("Boş karakter arayamazsınız!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/search/${encodeURIComponent(productName.trim())}`));

      if (!response.ok) {
        throw new Error("Arama yapılırken bir hata oluştu!");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.log("Arama hatası:", error);
      message.error("Arama yapılırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-search ${isSearchShow ? "show" : ""} `}>
      <div className="modal-wrapper">
        <h3 className="modal-title">Ürün ara</h3>
        <p className="modal-text">
          Aradığınız ürünleri görmek için yazmaya başlayın.
        </p>
        <form className="search-form" onSubmit={handleSearch}>
          <input type="text" placeholder="Ürün ara" />
          <button type="submit" disabled={loading}>
            <i className="bi bi-search"></i>
          </button>
        </form>
        <div className="search-results">
          <div className="search-heading">
            <h3>SONUÇLAR</h3>
          </div>
          <div
            className="results"
            style={{
              display: `${
                searchResults?.length === 0 || !searchResults ? "flex" : "grid"
              }`,
            }}
          >
            {!searchResults && (
              <b className="result-item" style={{ justifyContent: "center", width: "100%" }}>
                Ürün Ara...
              </b>
            )}
            {searchResults?.length === 0 && (
              <b className="result-item" style={{ justifyContent: "center", width: "100%" }}>
                😔Aradığınız Ürün Bulunamadı😔
              </b>
            )}
            {searchResults?.length > 0 &&
              searchResults?.map((resultItem) => (
                <Link
                  to={`product/${resultItem._id}`}
                  className="result-item"
                  key={resultItem._id}
                  onClick={handleCloseModal}
                >
                  <img src={resultItem.img[0]} className="search-thumb" alt="" />
                  <div className="search-info">
                    <h4>{resultItem.name}</h4>
                    <span className="search-price">
                      ${resultItem.price.current.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        <i className="bi bi-x-circle" id="close-search" onClick={handleCloseModal}></i>
      </div>
      <div className="modal-overlay" onClick={handleCloseModal}></div>
    </div>
  );
};

export default Search;

Search.propTypes = {
  isSearchShow: PropTypes.bool,
  setIsSearchShow: PropTypes.func,
};