import { Button, Form, Input, InputNumber, Spin, message, Select, Divider, Typography } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTheme } from "../../../context/ThemeContext";
import "./ProductPage.css";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const { Title } = Typography;
const { Option } = Select;

const CreateProductPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Tüm ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.PRODUCTS));
        if (!response.ok) {
          throw new Error("Ürünler getirilemedi!");
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.log("Ürünleri getirme hatası:", error);
        message.error("Ürünler yüklenirken bir hata oluştu.");
      }
    };

    fetchProducts();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Varsayılan bir görsel URL'si ekleyelim
      const defaultImage = "https://via.placeholder.com/400";
      
      const productData = {
        ...values,
        price: {
          current: values.current,
          discount: values.discount,
        },
        img: [defaultImage], // Varsayılan görsel
        category: "64c9e4f2b8f63e3c26a6fbd1", // Varsayılan kategori ID'si
        similarProducts: values.similarProducts || [] // Benzer ürünler
      };

      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Ürün oluşturma başarısız!");
      }

      message.success("Ürün başarıyla oluşturuldu.");
      navigate("/admin/products");
    } catch (error) {
      console.log("Oluşturma hatası:", error);
      message.error("Ürün oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={`product-create-page ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="page-header">
          <Title level={2} style={{ margin: 0 }}>Yeni Ürün Oluştur</Title>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="product-form"
        >
          <Form.Item
            name="name"
            label="Ürün Adı"
            rules={[
              {
                required: true,
                message: "Ürün adı gerekli!",
              },
              {
                min: 3,
                message: "Ürün adı en az 3 karakter olmalı!",
              },
            ]}
          >
            <Input placeholder="Ürün adını girin" />
          </Form.Item>

          <Form.Item
            name="current"
            label="Ürün Fiyatı"
            rules={[
              {
                required: true,
                message: "Ürün fiyatı gerekli!",
              },
            ]}
          >
            <InputNumber placeholder="Fiyat" min={0} style={{ width: "200px" }} />
          </Form.Item>

          <Form.Item
            name="discount"
            label="İndirim Oranı"
            rules={[
              {
                required: true,
                message: "İndirim oranı gerekli!",
              },
            ]}
          >
            <InputNumber
              placeholder="İndirim oranı"
              min={0}
              max={100}
              style={{ width: "200px" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Ürün Açıklaması"
            rules={[
              {
                required: true,
                message: "Ürün açıklaması gerekli!",
              },
            ]}
          >
            <ReactQuill 
              theme="snow" 
              style={{ 
                backgroundColor: isDarkMode ? "#1f2937" : "white",
                color: isDarkMode ? "#f9fafb" : "inherit"
              }} 
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stok Miktarı"
            rules={[
              {
                required: true,
                message: "Stok miktarı gerekli!",
              },
              {
                type: 'number',
                min: 0,
                message: "Stok miktarı 0'dan küçük olamaz!",
              },
            ]}
          >
            <InputNumber 
              placeholder="Stok miktarını girin" 
              style={{ width: "200px" }}
              min={0}
            />
          </Form.Item>

          <Divider />
          <Title level={5}>Benzer Ürünler</Title>
          <Form.Item
            name="similarProducts"
            label="Benzer Ürünler"
            help="Bu ürünle ilişkilendirilecek benzer ürünleri seçin"
          >
            <Select
              mode="multiple"
              placeholder="Benzer ürünleri seçin"
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {allProducts.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Oluştur
            </Button>
            <Button 
              type="default" 
              onClick={() => navigate("/admin/products")} 
              style={{ marginLeft: "8px" }}
            >
              İptal
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default CreateProductPage;