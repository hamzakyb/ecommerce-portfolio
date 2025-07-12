import { Button, Form, Input, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const UpdateCategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.CATEGORIES}/${id}`));

        if (!response.ok) {
          throw new Error("Kategori bulunamadı!");
        }

        const data = await response.json();
        form.setFieldsValue({
          name: data.name,
          img: data.img,
        });
      } catch (error) {
        console.log("Veri getirme hatası:", error);
        message.error("Kategori bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.CATEGORIES}/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Güncelleme başarısız!");
      }

      message.success("Kategori başarıyla güncellendi.");
      navigate("/admin/categories");
    } catch (error) {
      console.log("Güncelleme hatası:", error);
      message.error("Kategori güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Kategori Adı"
          rules={[
            {
              required: true,
              message: "Kategori adı gerekli!",
            },
            {
              min: 3,
              message: "Kategori adı en az 3 karakter olmalı!",
            },
          ]}
        >
          <Input placeholder="Kategori adını girin" />
        </Form.Item>

        <Form.Item
          name="img"
          label="Kategori Görseli (URL)"
          rules={[
            {
              required: true,
              message: "Kategori görseli gerekli!",
            },
          ]}
        >
          <Input placeholder="Görsel URL'sini girin" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Güncelle
          </Button>
          <Button 
            type="default" 
            onClick={() => navigate("/admin/categories")} 
            style={{ marginLeft: "8px" }}
          >
            İptal
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default UpdateCategoryPage;