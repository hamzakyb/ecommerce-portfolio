import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Spin, Alert, Divider, Typography, Progress, Badge } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./DashboardPage.css";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    monthlySalesData: [],
    monthlyCustomerData: [],
  });

  // Renk paleti
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/statistics/dashboard');
        
        if (!response.ok) {
          throw new Error("İstatistikler getirilemedi!");
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("İstatistik getirme hatası:", error);
        setError("İstatistikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Sipariş durumu dağılımı için veri
  const orderStatusData = [
    { name: 'Bekleyen', value: stats.pendingOrders },
    { name: 'Tamamlanan', value: stats.completedOrders },
    { name: 'İptal Edilen', value: stats.cancelledOrders },
  ];

  // Sipariş tamamlanma oranı
  const completionRate = stats.totalOrders > 0 
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
    : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>İstatistikler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Hata"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="dashboard-container">
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dream Filtre Yönetim Paneli
      </Title>
      
      {/* Üst Kartlar - Genel İstatistikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Toplam Sipariş" 
              value={stats.totalOrders} 
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />} 
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">Tüm zamanlar</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Toplam Müşteri" 
              value={stats.totalCustomers} 
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">Kayıtlı kullanıcılar</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Toplam Ürün" 
              value={stats.totalProducts} 
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary">Aktif ürünler</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Toplam Gelir" 
              value={stats.totalRevenue.toFixed(2)} 
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              suffix="₺"
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary">Tüm zamanlar</Text>
          </Card>
        </Col>
      </Row>

      {/* Orta Kartlar - Sipariş Durumları */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={8}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Bekleyen Siparişler" 
              value={stats.pendingOrders} 
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0} 
              strokeColor="#faad14" 
              size="small" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="Tamamlanan Siparişler" 
              value={stats.completedOrders} 
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={completionRate} 
              strokeColor="#52c41a" 
              size="small" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className="stat-card">
            <Statistic 
              title="İptal Edilen Siparişler" 
              value={stats.cancelledOrders} 
              prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
            <Progress 
              percent={stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0} 
              strokeColor="#f5222d" 
              size="small" 
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Satış Analizleri</Divider>

      {/* Grafikler */}
      <Row gutter={[16, 16]}>
        {/* Aylık Satış Grafiği */}
        <Col xs={24} lg={12}>
          <Card 
            title="Aylık Satış Analizi" 
            className="chart-card"
            hoverable
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.monthlySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} adet`, 'Satılan Ürün']} />
                <Legend />
                <Bar dataKey="satilanUrunSayisi" name="Satılan Ürün Sayısı" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Aylık Gelir Grafiği */}
        <Col xs={24} lg={12}>
          <Card 
            title="Aylık Gelir Analizi" 
            className="chart-card"
            hoverable
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={stats.monthlySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(2)} ₺`, 'Toplam Satış']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="toplamSatis" 
                  name="Toplam Satış (₺)" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Müşteri Artışı Grafiği */}
        <Col xs={24} lg={12}>
          <Card 
            title="Aylık Müşteri Artışı" 
            className="chart-card"
            hoverable
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={stats.monthlyCustomerData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kişi`, 'Yeni Müşteri']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="musteriSayisi" 
                  name="Yeni Müşteri Sayısı" 
                  stroke="#fa8c16" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Sipariş Durumu Dağılımı */}
        <Col xs={24} lg={12}>
          <Card 
            title="Sipariş Durumu Dağılımı" 
            className="chart-card"
            hoverable
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sipariş`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Sipariş Durumu Özeti */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Sipariş Durumu Özeti" hoverable>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Badge color="#faad14" text="Bekleyen" /> 
                <Text strong style={{ marginLeft: '8px' }}>{stats.pendingOrders} sipariş</Text>
              </Col>
              <Col xs={24} sm={8}>
                <Badge color="#52c41a" text="Tamamlanan" /> 
                <Text strong style={{ marginLeft: '8px' }}>{stats.completedOrders} sipariş</Text>
              </Col>
              <Col xs={24} sm={8}>
                <Badge color="#f5222d" text="İptal Edilen" /> 
                <Text strong style={{ marginLeft: '8px' }}>{stats.cancelledOrders} sipariş</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;