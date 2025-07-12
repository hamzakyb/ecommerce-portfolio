import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = user?._id || user?.id;
        if (!userId) {
          message.error("Kullanıcı bilgisi bulunamadı!");
          return;
        }
        
        const response = await fetch(getFullApiUrl(`/orders/user/${userId}`));
        if (!response.ok) {
          throw new Error("Siparişler getirilemedi!");
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Sipariş getirme hatası:", error);
        message.error("Siparişleriniz yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: "Sipariş No",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span>#{id.slice(-6)}</span>,
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("tr-TR"),
    },
    {
      title: "Toplam",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <span>{amount.toFixed(2)} TL</span>,
    },
    {
      title: "Kupon",
      dataIndex: "coupon",
      key: "coupon",
      render: (coupon) => coupon ? <span>{coupon.code} (%{coupon.discountPercent})</span> : "-",
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={
          status === "Beklemede" ? "gold" : 
          status === "Onaylandı" ? "blue" : 
          status === "Kargoya Verildi" ? "cyan" : 
          status === "Tamamlandı" ? "green" : "red"
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: "İşlem",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => showOrderDetails(record)}>
          Detay
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Siparişlerim</h2>
      <Table 
        dataSource={orders} 
        columns={columns} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "Henüz siparişiniz bulunmamaktadır." }}
      />
      
      <Modal
        title="Sipariş Detayları"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div>
            <p><strong>Sipariş ID:</strong> {selectedOrder._id}</p>
            <p><strong>Toplam Tutar:</strong> {selectedOrder.totalAmount.toFixed(2)} TL</p>
            {selectedOrder.coupon && (
              <div>
                <p><strong>Kupon Kodu:</strong> {selectedOrder.coupon.code}</p>
                <p><strong>İndirim Oranı:</strong> %{selectedOrder.coupon.discountPercent}</p>
                <p><strong>İndirim Tutarı:</strong> {selectedOrder.coupon.discountAmount.toFixed(2)} TL</p>
              </div>
            )}
            <p><strong>Durum:</strong> {selectedOrder.status}</p>
            <p><strong>Sipariş Tarihi:</strong> {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}</p>
            <h4>Ürünler:</h4>
            <Table
              dataSource={selectedOrder.items}
              columns={[
                {
                  title: "Ürün Adı",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Miktar",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Fiyat",
                  dataIndex: "price",
                  key: "price",
                  render: (price) => <span>{price.toFixed(2)} TL</span>,
                },
                {
                  title: "Toplam",
                  key: "total",
                  render: (_, record) => <span>{(record.price * record.quantity).toFixed(2)} TL</span>,
                },
              ]}
              rowKey={(item) => item._id || item.productId}
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders; 