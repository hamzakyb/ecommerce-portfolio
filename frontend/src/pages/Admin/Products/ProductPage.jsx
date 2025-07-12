import { Button, Popconfirm, Space, Table, message, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const ProductPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Product Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => <img src={imgSrc[0]} alt="Image" width={100} />,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Kategori",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>{text.current.toFixed(2)}</span>,
    },
    {
      title: "İndirim",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>%{text.discount}</span>,
    },
    {
      title: "Benzer Ürünler",
      dataIndex: "similarProducts",
      key: "similarProducts",
      render: (similarProducts) => (
        <Space size={[0, 8]} wrap>
          {similarProducts && similarProducts.length > 0 ? (
            similarProducts.map((product, index) => (
              <Tooltip key={index} title={product.name}>
                <Tag color="purple">{product.name.substring(0, 15)}{product.name.length > 15 ? '...' : ''}</Tag>
              </Tooltip>
            ))
          ) : (
            <span>Benzer ürün yok</span>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/products/update/${record._id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Kategoriyi Sil"
            description="Kategoriyi silmek istediğinizden emin misiniz?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteProduct(record._id)}
          >
            <Button type="primary" danger>
            Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.PRODUCTS}/${productId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Ürün başarıyla silindi.");
        setDataSource((prevProducts) => {
          return prevProducts.filter((product) => product._id !== productId);
        });
      } else {
        message.error("Silme işlemi başarısız.");
      }
    } catch (error) {
      console.log("Silme hatası:", error);
      message.error("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.CATEGORIES)),
          fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.PRODUCTS)),
        ]);

        if (!categoriesResponse.ok || !productsResponse.ok) {
          message.error("Veri getirme başarısız.");
          return;
        }

        const [categoriesData, productsData] = await Promise.all([
          categoriesResponse.json(),
          productsResponse.json(),
        ]);

        // Ürünleri ID'lerine göre hızlı erişim için bir harita oluştur
        const productsMap = {};
        productsData.forEach(product => {
          productsMap[product._id] = product;
        });

        const productsWithCategories = productsData.map((product) => {
          const categoryId = product.category;
          const category = categoriesData.find(
            (item) => item._id === categoryId
          );

          // Benzer ürünleri doldur
          let populatedSimilarProducts = [];
          if (product.similarProducts && product.similarProducts.length > 0) {
            populatedSimilarProducts = product.similarProducts.map(similarProductId => {
              return productsMap[similarProductId] || { name: "Bilinmeyen Ürün" };
            });
          }

          return {
            ...product,
            categoryName: category ? category.name : "",
            similarProducts: populatedSimilarProducts
          };
        });

        setDataSource(productsWithCategories);
      } catch (error) {
        console.log("Veri hatası:", error);
        message.error("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default ProductPage;