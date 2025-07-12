import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.USER_PROFILE), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        message.error('Kullanıcılar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      message.error('Kullanıcılar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Yeni kullanıcı ekle
  const handleAddUser = async (values) => {
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.USER_PROFILE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Kullanıcı başarıyla eklendi');
        setIsModalVisible(false);
        form.resetFields();
        fetchUsers(); // Kullanıcı listesini yenile
      } else {
        const error = await response.json();
        message.error(error.error || 'Kullanıcı eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı eklenirken hata:', error);
      message.error('Kullanıcı eklenirken bir hata oluştu');
    }
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          danger
          onClick={() => handleDeleteUser(record._id)}
        >
          Sil
        </Button>
      ),
    },
  ];

  // Kullanıcı sil
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.USER_PROFILE}/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        message.success('Kullanıcı başarıyla silindi');
        fetchUsers(); // Kullanıcı listesini yenile
      } else {
        message.error('Kullanıcı silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      message.error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Paneli</h1>
        <Button 
          type="primary" 
          onClick={() => setIsModalVisible(true)}
        >
          Kullanıcı Ekle
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Yeni Kullanıcı Ekle"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
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
            rules={[{ required: true, message: 'Lütfen şifre girin' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Lütfen rol seçin' }]}
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
    </div>
  );
};

export default AdminDashboard; 