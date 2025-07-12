import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleRegister = async (values) => {
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        message.error(errorData.error || 'Kayıt başarısız');
        return;
      }

      const data = await response.json();
      message.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      form.resetFields();
      
    } catch (error) {
      console.error('Register error:', error);
      message.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleRegister}
      className="auth-form"
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: 'Kullanıcı adı gerekli!',
          },
        ]}
      >
        <Input placeholder="Kullanıcı Adı" className="auth-input" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: 'Email adresi gerekli!',
          },
          {
            type: 'email',
            message: 'Geçerli bir email adresi girin!',
          },
        ]}
      >
        <Input placeholder="Email" className="auth-input" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Şifre gerekli!',
          },
          {
            min: 6,
            message: 'Şifre en az 6 karakter olmalı!',
          },
        ]}
      >
        <Input.Password placeholder="Şifre" className="auth-input" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="auth-button">
          Kayıt Ol
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Register; 