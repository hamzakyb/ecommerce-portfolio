import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const CategoryPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Kategori Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => <img src={imgSrc} alt="Image" width={100} />,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/categories/update/${record._id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Kategoriyi Sil"
            description="Kategoriyi silmek istediğinizden emin misiniz?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteCategory(record._id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.CATEGORIES}/${categoryId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success("Kategori başarıyla silindi.");
        setDataSource((prevCategories) => {
          return prevCategories.filter((category) => category._id !== categoryId);
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
    const fetchCategories = async () => {
      setLoading(true);

      try {
        const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.CATEGORIES));

        if (!response.ok) {
          message.error("Veri getirme başarısız.");
          return;
        }

        const data = await response.json();
        setDataSource(data);
      } catch (error) {
        console.log("Veri hatası:", error);
        message.error("Kategoriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
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

export default CategoryPage;