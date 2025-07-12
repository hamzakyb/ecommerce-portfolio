import { Button, Form, Input, Spin, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../../../config/apiConfig';

const CreateCategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.CATEGORIES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Kategori oluşturma başarısız!");
      }

      message.success("Kategori başarıyla oluşturuldu.");
      navigate("/admin/categories");
    } catch (error) {
      console.log("Oluşturma hatası:", error);
      message.error("Kategori oluşturulurken bir hata oluştu.");
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
            Oluştur
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

export default CreateCategoryPage;