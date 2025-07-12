import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        message.error(errorData.error || 'Giriş başarısız');
        return;
      }
  
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      message.success("Giriş başarılı!");
      navigate("/");
    } catch (error) {
      console.error('Login error:', error);
      message.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Giriş Yap</h2>
        <Form
          form={form}
          onFinish={handleLogin}
          className="auth-form"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Email adresi gerekli!',
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
            ]}
          >
            <Input.Password placeholder="Şifre" className="auth-input" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="auth-button">
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login; 