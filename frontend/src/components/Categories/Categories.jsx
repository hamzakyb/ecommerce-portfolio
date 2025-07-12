import { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem";
import { message, Spin } from "antd";
import Slider from "react-slick";
import "./Categories.css";
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.CATEGORIES));

        if (!response.ok) {
          throw new Error("Kategoriler getirilemedi!");
        }

        const data = await response.json();
        const validCategories = data.filter(category => 
          category && category.name && category.img
        );
        setCategories(validCategories);
      } catch (error) {
        console.log("Veri getirme hatası:", error);
        message.error("Kategoriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="categories">
      <div className="container">
        <div className="section-title">
          <h2>Tüm Kategoriler</h2>
          <p>Filtre Kategorileri</p>
        </div>
        <Spin spinning={loading}>
          <Slider {...settings}>
            {categories.map((category) => (
              <CategoryItem key={category._id} category={category} />
            ))}
          </Slider>
        </Spin>
      </div>
    </section>
  );
};

export default Categories;
