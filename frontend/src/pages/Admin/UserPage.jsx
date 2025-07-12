import { Button, Popconfirm, Space, Table, Tag, message, Modal, Descriptions, Divider, Spin, Form, Input, DatePicker, Select, InputNumber, Tabs, Typography, Tooltip, Row, Col, Card, Statistic } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined, ShoppingCartOutlined, InfoCircleOutlined, BankOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, LockOutlined } from "@ant-design/icons";
import moment from 'moment';
import "./UserPage.css";
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';
import { useAuth } from '../../context/AuthContext';

const { Column } = Table;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const UserPage = () => {
  const { user } = useAuth();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isOrdersModalVisible, setIsOrdersModalVisible] = useState(false);
  const [isUserDetailModalVisible, setIsUserDetailModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [editingPayment, setEditingPayment] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (_, record) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.username)}&background=random&color=fff&size=100`} 
          alt={record.username} 
          width={50} 
          style={{ borderRadius: "50%" }} 
        />
      ),
    },
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Kullanıcıyı Sil"
            description="Bu kullanıcıyı silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteUser(record._id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
          <Button 
            type="default" 
            onClick={() => viewUserDetails(record.email, record._id)}
            icon={<ShoppingCartOutlined />}
          >
            Siparişler
          </Button>
          <Button 
            type="primary" 
            onClick={() => viewUserProfile(record._id)}
            icon={<InfoCircleOutlined />}
          >
            Detaylar
          </Button>
          <Button 
            type="primary" 
            onClick={() => viewUserAccount(record._id)}
            icon={<BankOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Muhasebe
          </Button>
          <Button 
            type="primary" 
            onClick={() => {
              setSelectedUser(record);
              setIsChangePasswordModalVisible(true);
            }}
            icon={<LockOutlined />}
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
          >
            Şifre Değiştir
          </Button>
        </Space>
      ),
    },
  ];

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${userId}`), {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Silme işlemi başarısız! Hata: ${errorData.error || 'Bilinmeyen hata'}`);
      }

      message.success("Kullanıcı başarıyla silindi.");
      
      // Kullanıcıyı listeden kaldır
      setDataSource((prevUsers) => {
        return prevUsers.filter((user) => user._id !== userId);
      });
    } catch (error) {
      console.error("Silme hatası:", error);
      message.error(error.message);
    }
  };

  const viewUserDetails = async (email, userId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${userId}/orders`), {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Siparişler getirilemedi!");
      }

      const ordersData = await response.json();
      setOrders(ordersData);
      setIsOrdersModalVisible(true);
    } catch (error) {
      console.log("Sipariş alma hatası:", error);
      message.error(`Siparişler yüklenirken bir hata oluştu: ${error.message}`);
    }
  };

  const viewUserProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/admin/${userId}`), {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Kullanıcı bilgileri getirilemedi!");
      }

      const userData = await response.json();
      setSelectedUser(userData);
      setIsUserDetailModalVisible(true);
    } catch (error) {
      console.error("Kullanıcı bilgileri alma hatası:", error);
      message.error(`Kullanıcı bilgileri yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewUserAccount = async (userId) => {
    try {
      setAccountLoading(true);
      setSelectedUser(dataSource.find(user => user._id === userId));
      
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const response = await fetch(getFullApiUrl(`/customer-accounts/${userId}`), {
        headers: {
          'Authorization': `Bearer ${parsedUser.token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Hesap bulunamadı, yeni bir hesap oluşturmak için boş veri kullan
          setAccountData({
            userId,
            totalDebt: 0,
            totalPaid: 0,
            remainingDebt: 0,
            paymentRecords: [],
            status: "Aktif"
          });
          
          accountForm.setFieldsValue({
            totalDebt: 0,
            totalPaid: 0,
            paymentDueDate: null,
            paymentPromiseDate: null,
            creditLimit: 0,
            notes: '',
            status: "Aktif"
          });
        } else {
          throw new Error("Müşteri hesap bilgileri getirilemedi!");
        }
      } else {
        const data = await response.json();
        setAccountData(data);
        
        accountForm.setFieldsValue({
          totalDebt: data.totalDebt,
          totalPaid: data.totalPaid,
          paymentDueDate: data.paymentDueDate ? moment(data.paymentDueDate) : null,
          paymentPromiseDate: data.paymentPromiseDate ? moment(data.paymentPromiseDate) : null,
          creditLimit: data.creditLimit,
          notes: data.notes,
          status: data.status
        });
      }
      
      setIsAccountModalVisible(true);
      setActiveTab("1");
    } catch (error) {
      console.error("Müşteri hesap bilgileri alma hatası:", error);
      message.error(`Müşteri hesap bilgileri yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleAccountFormSubmit = async (values) => {
    try {
      setAccountLoading(true);
      
      const formData = {
        ...values,
        paymentDueDate: values.paymentDueDate ? values.paymentDueDate.format('YYYY-MM-DD') : null,
        paymentPromiseDate: values.paymentPromiseDate ? values.paymentPromiseDate.format('YYYY-MM-DD') : null,
      };
      
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${selectedUser._id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsedUser.token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Müşteri hesap bilgileri güncellenemedi!");
      }
      
      const updatedAccount = await response.json();
      setAccountData(updatedAccount);
      
      message.success("Müşteri hesap bilgileri başarıyla güncellendi");
    } catch (error) {
      console.error("Müşteri hesap bilgileri güncelleme hatası:", error);
      message.error(`Müşteri hesap bilgileri güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePaymentFormSubmit = async (values) => {
    try {
      setAccountLoading(true);
      
      const formData = {
        ...values,
        date: values.date.format('YYYY-MM-DD')
      };
      
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      let response;
      
      if (editingPayment) {
        // Ödeme kaydını güncelle
        response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${selectedUser._id}/payments/${editingPayment._id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${parsedUser.token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Yeni ödeme kaydı ekle
        response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${selectedUser._id}/payments`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${parsedUser.token}`
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error("Ödeme kaydı eklenemedi/güncellenemedi!");
      }
      
      const updatedAccount = await response.json();
      setAccountData(updatedAccount);
      
      // Form alanlarını temizle ve düzenleme modunu kapat
      paymentForm.resetFields();
      setEditingPayment(null);
      
      message.success(editingPayment ? "Ödeme kaydı başarıyla güncellendi" : "Ödeme kaydı başarıyla eklendi");
    } catch (error) {
      console.error("Ödeme kaydı ekleme/güncelleme hatası:", error);
      message.error(`Ödeme kaydı eklenirken/güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      setAccountLoading(true);
      
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${selectedUser._id}/payments/${paymentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${parsedUser.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Ödeme kaydı silinemedi!");
      }
      
      const updatedAccount = await response.json();
      setAccountData(updatedAccount);
      
      message.success("Ödeme kaydı başarıyla silindi");
    } catch (error) {
      console.error("Ödeme kaydı silme hatası:", error);
      message.error(`Ödeme kaydı silinirken bir hata oluştu: ${error.message}`);
    } finally {
      setAccountLoading(false);
    }
  };

  const editPayment = (payment) => {
    setEditingPayment(payment);
    paymentForm.setFieldsValue({
      amount: payment.amount,
      date: moment(payment.date),
      method: payment.method,
      notes: payment.notes,
      receiptNumber: payment.receiptNumber
    });
  };

  const cancelEditPayment = () => {
    setEditingPayment(null);
    paymentForm.resetFields();
  };

  const handleModalClose = () => {
    setIsOrdersModalVisible(false);
  };

  const handleUserDetailModalClose = () => {
    setIsUserDetailModalVisible(false);
    setSelectedUser(null);
  };

  const handleAccountModalClose = () => {
    setIsAccountModalVisible(false);
    setAccountData(null);
    setSelectedUser(null);
    setEditingPayment(null);
    accountForm.resetFields();
    paymentForm.resetFields();
  };

  const handleAddUser = async (values) => {
    try {
      setLoading(true);
      
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.USER_PROFILE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsedUser.token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kullanıcı eklenirken bir hata oluştu!");
      }

      await response.json(); // Sonucu almak için bekle ama değişkene atama
      message.success("Kullanıcı başarıyla eklendi.");
      
      // Yeni kullanıcıyı listeye ekle
      fetchUsers(); // Tüm kullanıcıları yeniden getir
      
      setIsAddUserModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Kullanıcı ekleme hatası:", error);
      message.error(error.message || "Kullanıcı eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${selectedUser._id}/change-password`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsedUser.token}`
        },
        body: JSON.stringify({
          newPassword: values.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success({
          content: data.message || 'Şifre başarıyla değiştirildi',
          duration: 3,
          style: {
            marginTop: '20px',
            fontSize: '16px'
          },
          icon: <SaveOutlined style={{ color: '#52c41a' }} />
        });
        setIsChangePasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(data.error || 'Şifre değiştirilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      message.error(error.message || 'Şifre değiştirilirken bir hata oluştu');
    }
  };

  // Kullanıcıları getir
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // localStorage'dan token'ı al
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.token) {
        throw new Error("Geçerli token bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.USER_PROFILE));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kullanıcılar getirilemedi!");
      }

      const data = await response.json();
      setDataSource(data);
    } catch (error) {
      console.error("Veri getirme hatası:", error);
      message.error(error.message || "Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrelenmiş kullanıcılar
  const filteredData = dataSource.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ödeme kayıtları için tablo sütunları
  const paymentColumns = [
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      defaultSortOrder: 'descend',
    },
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toFixed(2)} ₺`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Ödeme Yöntemi",
      dataIndex: "method",
      key: "method",
      render: (method) => {
        const colors = {
          "Kredi Kartı": "blue",
          "Nakit": "green",
          "Havale/EFT": "purple",
          "Çek": "orange",
          "Diğer": "default"
        };
        return <Tag color={colors[method] || "default"}>{method}</Tag>;
      },
      filters: [
        { text: 'Kredi Kartı', value: 'Kredi Kartı' },
        { text: 'Nakit', value: 'Nakit' },
        { text: 'Havale/EFT', value: 'Havale/EFT' },
        { text: 'Çek', value: 'Çek' },
        { text: 'Diğer', value: 'Diğer' },
      ],
      onFilter: (value, record) => record.method === value,
    },
    {
      title: "Makbuz No",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
    },
    {
      title: "Notlar",
      dataIndex: "notes",
      key: "notes",
      ellipsis: {
        showTitle: false,
      },
      render: (notes) => (
        <Tooltip placement="topLeft" title={notes}>
          {notes || "-"}
        </Tooltip>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => editPayment(record)}
          />
          <Popconfirm
            title="Ödeme Kaydını Sil"
            description="Bu ödeme kaydını silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => handleDeletePayment(record._id)}
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-user-page">
      <div className="user-page-header">
        <h2>Kullanıcılar</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsAddUserModalVisible(true)}
        >
          Yeni Müşteri Ekle
        </Button>
      </div>
      <div className="user-search-box">
        <input
          type="text"
          placeholder="Kullanıcı adı veya e-mail ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Yeni Müşteri Ekle"
        open={isAddUserModalVisible}
        onCancel={() => setIsAddUserModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddUser}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Kullanıcı Adı"
            rules={[{ required: true, message: 'Lütfen kullanıcı adını girin' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Lütfen email adresini girin' },
              { type: 'email', message: 'Geçerli bir email adresi girin' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Şifre"
            rules={[
              { required: true, message: 'Lütfen şifre girin' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Telefon"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Şirket Adı"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="taxNumber"
            label="Vergi Numarası"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="taxOffice"
            label="Vergi Dairesi"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Ekle
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kullanıcı Siparişleri"
        open={isOrdersModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1100}
      >
        {orders.length > 0 ? (
          <Table
            dataSource={orders}
            rowKey={(order) => order._id}
            pagination={false}
            scroll={{ y: 400 }}
          >
            <Column title="Sipariş ID" dataIndex="_id" key="_id" width={150} />
            <Column 
              title="Toplam Tutar" 
              dataIndex="totalAmount" 
              key="totalAmount" 
              render={(text) => <span style={{ fontWeight: 'bold' }}>{`${text} TL`}</span>}
              width={150}
            />
            <Column 
              title="Durum" 
              dataIndex="status" 
              key="status" 
              render={(text) => {
                const statusMap = {
                  delivered: "Teslim Edildi",
                  pending: "Beklemede",
                  processing: "İşlemde",
                  cancelled: "İptal Edildi"
                };
                return <span style={{ fontWeight: 'bold' }}>{statusMap[text] || text}</span>;
              }}
              width={150}
            />
            <Column
              title="Sipariş Tarihi"
              dataIndex="createdAt"
              key="createdAt"
              render={(text) => {
                const date = new Date(text);
                return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString("tr-TR")}`;
              }}
              width={200}
            />
            <Column
              title="Ürünler"
              key="items"
              render={(text, order) => (
                <ul>
                  {order.items.map(item => (
                    <li key={item._id}>
                      <span style={{ fontWeight: 'bold' }}>{item.name}</span> - Miktar: <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>, Fiyat: <span style={{ fontWeight: 'bold' }}>{item.price} TL</span>
                    </li>
                  ))}
                </ul>
              )}
              width={800}
            />
          </Table>
        ) : (
          <p>Bu kullanıcının henüz siparişi bulunmamaktadır.</p>
        )}
      </Modal>

      <Modal
        title={<div><UserOutlined /> Müşteri Detayları</div>}
        open={isUserDetailModalVisible}
        onCancel={handleUserDetailModalClose}
        footer={null}
        width={800}
      >
        {selectedUser ? (
          <div className="user-detail-container">
            <div className="user-detail-header">
              <div className="user-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username)}&background=random&color=fff&size=200`} 
                  alt={selectedUser.username} 
                  style={{ width: 100, height: 100, borderRadius: '50%' }}
                />
              </div>
              <div className="user-basic-info">
                <h2>{selectedUser.username}</h2>
                <p>{selectedUser.email}</p>
                <Tag color={selectedUser.role === "admin" ? "red" : "blue"}>
                  {selectedUser.role.toUpperCase()}
                </Tag>
              </div>
            </div>

            <Divider orientation="left">Kişisel Bilgiler</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Ad Soyad">{selectedUser.username || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="E-posta">{selectedUser.email || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Telefon">{selectedUser.phone || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Adres">{selectedUser.address || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Şehir">{selectedUser.city || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Posta Kodu">{selectedUser.postalCode || "Belirtilmemiş"}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Şirket Bilgileri</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Şirket Adı">{selectedUser.companyName || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Vergi Numarası">{selectedUser.taxNumber || "Belirtilmemiş"}</Descriptions.Item>
              <Descriptions.Item label="Vergi Dairesi">{selectedUser.taxOffice || "Belirtilmemiş"}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Hesap Bilgileri</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Kayıt Tarihi">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString("tr-TR") : "Belirtilmemiş"}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString("tr-TR") : "Belirtilmemiş"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '10px' }}>Kullanıcı bilgileri yükleniyor...</p>
          </div>
        )}
      </Modal>

      <Modal
        title={<div><BankOutlined /> Müşteri Muhasebe Bilgileri</div>}
        open={isAccountModalVisible}
        onCancel={handleAccountModalClose}
        footer={null}
        width={1000}
        styles={{ body: { padding: '0' } }}
      >
        {accountLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '10px' }}>Müşteri hesap bilgileri yükleniyor...</p>
          </div>
        ) : (
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="Hesap Özeti" key="1">
              <div className="account-summary-container">
                <div className="account-header">
                  <div className="account-user-info">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.username || '')}&background=random&color=fff&size=100`} 
                      alt={selectedUser?.username} 
                      style={{ width: 60, height: 60, borderRadius: '50%', marginRight: '15px' }}
                    />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{selectedUser?.username}</Title>
                      <Text type="secondary">{selectedUser?.email}</Text>
                    </div>
                  </div>
                  <div className="account-status">
                    <Tag color={accountData?.status === "Aktif" ? "green" : accountData?.status === "Beklemede" ? "orange" : "red"} style={{ fontSize: '14px', padding: '4px 8px' }}>
                      {accountData?.status || "Aktif"}
                    </Tag>
                  </div>
                </div>

                <div className="account-summary-cards">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card className="summary-card">
                        <Statistic
                          title="Toplam Borç"
                          value={accountData?.totalDebt || 0}
                          precision={2}
                          suffix="₺"
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="summary-card">
                        <Statistic
                          title="Toplam Ödenen"
                          value={accountData?.totalPaid || 0}
                          precision={2}
                          suffix="₺"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="summary-card">
                        <Statistic
                          title="Kalan Borç"
                          value={accountData?.remainingDebt || 0}
                          precision={2}
                          suffix="₺"
                          valueStyle={{ color: accountData?.remainingDebt > 0 ? '#cf1322' : '#3f8600' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>

                <Divider orientation="left">Hesap Bilgileri</Divider>

                <Form
                  form={accountForm}
                  layout="vertical"
                  onFinish={handleAccountFormSubmit}
                  className="account-form"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="totalDebt"
                        label="Toplam Borç (₺)"
                        rules={[{ required: true, message: 'Toplam borç miktarını girin' }]}
                      >
                        <InputNumber 
                          style={{ width: '100%' }} 
                          precision={2} 
                          min={0}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="totalPaid"
                        label="Toplam Ödenen (₺)"
                        rules={[{ required: true, message: 'Toplam ödenen miktarı girin' }]}
                      >
                        <InputNumber 
                          style={{ width: '100%' }} 
                          precision={2} 
                          min={0}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="paymentDueDate"
                        label="Ödeme Vade Tarihi"
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          format="DD.MM.YYYY"
                          placeholder="Vade tarihi seçin"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="paymentPromiseDate"
                        label="Söz Verilen Ödeme Tarihi"
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          format="DD.MM.YYYY"
                          placeholder="Söz verilen tarihi seçin"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="creditLimit"
                        label="Kredi Limiti (₺)"
                      >
                        <InputNumber 
                          style={{ width: '100%' }} 
                          precision={2} 
                          min={0}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="status"
                        label="Hesap Durumu"
                        rules={[{ required: true, message: 'Hesap durumunu seçin' }]}
                      >
                        <Select placeholder="Durum seçin">
                          <Select.Option value="Aktif">Aktif</Select.Option>
                          <Select.Option value="Beklemede">Beklemede</Select.Option>
                          <Select.Option value="Kapalı">Kapalı</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="notes"
                    label="Notlar"
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="Müşteri hesabı ile ilgili notlar..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={accountLoading}
                      icon={<SaveOutlined />}
                    >
                      Kaydet
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </TabPane>

            <TabPane tab="Ödeme Kayıtları" key="2">
              <div className="payments-container">
                <div className="payment-form-container">
                  <Divider orientation="left">
                    {editingPayment ? "Ödeme Kaydını Düzenle" : "Yeni Ödeme Kaydı Ekle"}
                  </Divider>

                  <Form
                    form={paymentForm}
                    layout="vertical"
                    onFinish={handlePaymentFormSubmit}
                    className="payment-form"
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="amount"
                          label="Ödeme Tutarı (₺)"
                          rules={[{ required: true, message: 'Ödeme tutarını girin' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }} 
                            precision={2} 
                            min={0}
                            placeholder="0.00"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="date"
                          label="Ödeme Tarihi"
                          rules={[{ required: true, message: 'Ödeme tarihini seçin' }]}
                        >
                          <DatePicker 
                            style={{ width: '100%' }} 
                            format="DD.MM.YYYY"
                            placeholder="Tarih seçin"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="method"
                          label="Ödeme Yöntemi"
                          rules={[{ required: true, message: 'Ödeme yöntemini seçin' }]}
                        >
                          <Select placeholder="Yöntem seçin">
                            <Select.Option value="Kredi Kartı">Kredi Kartı</Select.Option>
                            <Select.Option value="Nakit">Nakit</Select.Option>
                            <Select.Option value="Havale/EFT">Havale/EFT</Select.Option>
                            <Select.Option value="Çek">Çek</Select.Option>
                            <Select.Option value="Diğer">Diğer</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="receiptNumber"
                          label="Makbuz/Fiş Numarası"
                        >
                          <Input placeholder="Makbuz numarası" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="notes"
                      label="Notlar"
                    >
                      <Input.TextArea 
                        rows={2} 
                        placeholder="Ödeme ile ilgili notlar..."
                      />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={accountLoading}
                          icon={editingPayment ? <SaveOutlined /> : <PlusOutlined />}
                        >
                          {editingPayment ? "Güncelle" : "Ekle"}
                        </Button>
                        {editingPayment && (
                          <Button onClick={cancelEditPayment}>
                            İptal
                          </Button>
                        )}
                      </Space>
                    </Form.Item>
                  </Form>
                </div>

                <Divider orientation="left">Ödeme Geçmişi</Divider>

                {accountData?.paymentRecords?.length > 0 ? (
                  <Table
                    dataSource={accountData.paymentRecords}
                    columns={paymentColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Henüz ödeme kaydı bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      <Modal
        title="Şifre Değiştir"
        open={isChangePasswordModalVisible}
        onCancel={() => {
          setIsChangePasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        className="modal-password-change"
      >
        <Form
          form={passwordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Lütfen yeni şifreyi girin' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Şifre Tekrar"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Lütfen şifreyi tekrar girin' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Şifreyi Değiştir
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
