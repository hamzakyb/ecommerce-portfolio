import { useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Layout/Footer/Footer";
import PropTypes from "prop-types";
import SearchBar from "../components/SearchBar/SearchBar";

const MainLayout = ({ children }) => {
  const location = useLocation();

  

  return (
    <div className="main-layout">
      <Header />
      {location.pathname !== "/auth" && (
        <div className="search-bar-wrapper">
          <div className="container">
            <SearchBar />
          </div>
        </div>
      )}
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;

MainLayout.propTypes = {
  children: PropTypes.node,
};