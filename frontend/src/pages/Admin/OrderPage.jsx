import { Button, Modal, Space, Table, Tag, message, Popconfirm, Form, Input, Row, Col, Divider, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { FileTextOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import './OrderPage.css';
import { API_CONFIG, getFullApiUrl } from '../../config/apiConfig';

const OrderPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSellerInfoModalVisible, setIsSellerInfoModalVisible] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    companyName: "Firma Adı",
    taxOffice: "Vergi Dairesi",
    taxNumber: "Vergi No",
    address: "Adres",
    cityRegion: "Şehir/Bölge",
    phone: "Telefon",
    vatRate: 18,
    bankName: "Banka Adı",
    bankBranch: "Şube",
    iban: "TR00 0000 0000 0000 0000 0000 00"
  });
  const [sellerForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    {
      title: "Sipariş ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span>#{text.slice(-6)}</span>,
    },
    {
      title: "Müşteri Adı",
      dataIndex: "userName",
      key: "userName",
      render: (text) => text || "Belirtilmemiş",
    },
    {
      title: "Şirket",
      dataIndex: "userCompany",
      key: "userCompany",
      render: (text) => text || "Belirtilmemiş",
    },
    {
      title: "E-posta",
      dataIndex: "userEmail",
      key: "userEmail",
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
        <Tag color={status === "pending" ? "gold" : status === "processing" ? "blue" : status === "delivered" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Aksiyon",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => updateOrderStatus(record._id, "processing")}>
            İşlemde
          </Button>
          <Button type="default" onClick={() => updateOrderStatus(record._id, "delivered")}>
            Teslim Edildi
          </Button>
          <Button type="danger" onClick={() => updateOrderStatus(record._id, "cancelled")}>
            İptal Et
          </Button>
          <Button 
            type="primary" 
            onClick={() => showOrderDetails(record)}
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
          >
            Detay
          </Button>
          <Popconfirm
            title="Siparişi Sil"
            description="Bu siparişi silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteOrder(record._id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showOrderDetails = (order) => {
    console.log("Seçilen sipariş:", order); // Konsola sipariş bilgilerini yazdır
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.ORDERS}/${orderId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Güncelleme başarısız!");
      }

      message.success("Sipariş durumu başarıyla güncellendi.");
      setDataSource((prevOrders) => {
        return prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
      });
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      message.error("Sipariş durumu güncellenirken bir hata oluştu.");
    }
  };

  // Sipariş silme fonksiyonu
  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(getFullApiUrl(`${API_CONFIG.API_ENDPOINTS.ORDERS}/${orderId}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız!");
      }

      message.success("Sipariş başarıyla silindi.");
      setDataSource((prevOrders) => {
        return prevOrders.filter((order) => order._id !== orderId);
      });
    } catch (error) {
      console.error("Silme hatası:", error);
      message.error("Sipariş silinirken bir hata oluştu.");
    }
  };

  const showSellerInfoModal = () => {
    sellerForm.setFieldsValue(sellerInfo);
    setIsSellerInfoModalVisible(true);
  };

  const handleSellerInfoCancel = () => {
    setIsSellerInfoModalVisible(false);
  };

  const handleSellerInfoSave = async (values) => {
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.SELLER_INFO), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSellerInfo(data);
        setIsSellerInfoModalVisible(false);
        message.success("Satıcı bilgileri güncellendi");
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Satıcı bilgileri güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Satıcı bilgileri güncelleme hatası:", error);
      message.error("Satıcı bilgileri güncellenirken bir hata oluştu");
    }
  };

  const generateInvoicePDF = (order) => {
    if (!order) {
      message.error("Siparis bilgisi bulunamadi!");
      return;
    }
    
    try {
      message.loading({ content: "Fatura hazirlaniyor...", key: "invoiceLoading" });
      
      // PDF oluştur
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16 // PDF standardında maksimum hassasiyet
      });
      
      // Sayfa boyutları
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Kenar boşlukları
      const margin = 15;
      
      // Filigran ekle (daha açık renk ve küçük)
      doc.setTextColor(245, 245, 245);
      doc.setFontSize(45);
      doc.setFont("helvetica", 'bold');
      doc.text(sellerInfo.companyName.toUpperCase(), pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45
      });
      
      // Fatura çerçevesi (daha ince)
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
      
      // Başlık
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("FATURA", pageWidth / 2, margin + 10, { align: "center" });
      
      // Fatura numarası ve tarih
      const invoiceDate = new Date(order.createdAt);
      const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}.${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}.${invoiceDate.getFullYear()}`;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Fatura No: ${order._id.slice(-6)}`, pageWidth - margin - 50, margin + 5, { align: "left" });
      doc.text(`Tarih: ${formattedDate}`, pageWidth - margin - 50, margin + 12, { align: "left" });
      doc.text(`Saat: ${invoiceDate.getHours().toString().padStart(2, '0')}:${invoiceDate.getMinutes().toString().padStart(2, '0')}`, pageWidth - margin - 50, margin + 19, { align: "left" });
      
      // Firma bilgileri kutusu (sol üst) - daha uzun
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, margin + 20, pageWidth / 2 - margin - 5, 60, 2, 2);
      
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("SATICI", margin + 5, margin + 27);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", 'normal');
      doc.text(sellerInfo.companyName, margin + 5, margin + 35);
      doc.text(`Vergi Dairesi: ${sellerInfo.taxOffice}`, margin + 5, margin + 42);
      doc.text(`Vergi No: ${sellerInfo.taxNumber}`, margin + 5, margin + 49);
      doc.text(`Adres: ${sellerInfo.address}`, margin + 5, margin + 56);
      doc.text(`${sellerInfo.cityRegion}`, margin + 5, margin + 63);
      doc.text(`Tel: ${sellerInfo.phone}`, margin + 5, margin + 70);
      
      // Müşteri bilgileri kutusu (sağ üst) - daha uzun
      doc.roundedRect(pageWidth / 2 + 5, margin + 20, pageWidth / 2 - margin - 5, 60, 2, 2);
      
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("ALICI", pageWidth / 2 + 10, margin + 27);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", 'normal');
      doc.text(`Ad Soyad: ${order.userName || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 35);
      doc.text(`Firma: ${order.userCompany || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 42);
      doc.text(`Vergi Dairesi: ${order.userTaxOffice || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 49);
      doc.text(`Vergi No: ${order.userTaxNumber || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 56);
      doc.text(`Adres: ${order.userAddress || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 63);
      doc.text(`${order.userCity || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 70);
      
      // Ürün tablosu başlığı - modern tasarım
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, margin + 90, pageWidth - (margin * 2), 10, 1, 1, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", 'bold');
      doc.text("URUN/HIZMET BILGILERI", pageWidth / 2, margin + 97, { align: "center" });
      
      // Ürün tablosu - daha sade
      const tableColumn = ["Sira", "Urun/Hizmet", "Miktar", "Birim", "Birim Fiyat", "KDV", "KDV Tutari", "Toplam"];
      const tableRows = [];
      
      // Ürün verilerini hazırla
      let totalKDV = 0;
      let totalWithoutKDV = 0;
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
          const kdvOrani = sellerInfo.vatRate || 18; // Satıcı bilgilerinden KDV oranını al, yoksa varsayılan %18
          const birimFiyat = item.price;
          const miktar = item.quantity;
          const toplamFiyat = birimFiyat * miktar;
          const kdvTutari = (toplamFiyat * kdvOrani) / 100;
          
          totalKDV += kdvTutari;
          totalWithoutKDV += toplamFiyat;
          
          const itemData = [
            index + 1,
            item.name,
            miktar,
            "Adet",
            birimFiyat.toFixed(2),
            `%${kdvOrani}`,
            kdvTutari.toFixed(2),
            toplamFiyat.toFixed(2)
          ];
          tableRows.push(itemData);
        });
      }
      
      // Tabloyu oluştur - modern tasarım
      autoTable(doc, {
        startY: margin + 100,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [245, 245, 245],
          textColor: [50, 50, 50],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 20, halign: 'right' },
          7: { cellWidth: 20, halign: 'right' }
        },
        styles: {
          cellPadding: 3,
          fontSize: 8,
          valign: 'middle',
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [220, 220, 220],
          textColor: [60, 60, 60]
        },
        margin: { left: margin, right: margin }
      });
      
      // Toplam bilgileri - daha sade ve modern
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Ara toplam hesapla
      const araToplam = totalWithoutKDV;
      
      // Toplam bilgileri için kutu - modern tasarım
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(pageWidth - margin - 80, finalY, 80, order.coupon ? 85 : 60, 2, 2, 'FD');
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      doc.setFont("helvetica", 'normal');
      
      // Ara toplam
      doc.text("Ara Toplam:", pageWidth - margin - 75, finalY + 10);
      doc.text(`${araToplam.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 10, { align: "right" });
      
      // KDV
      doc.text("Toplam KDV:", pageWidth - margin - 75, finalY + 18);
      doc.text(`${totalKDV.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 18, { align: "right" });
      
      // Kargo ücreti
      if (order.cargoFee && order.cargoFee > 0) {
        doc.text("Kargo Ucreti:", pageWidth - margin - 75, finalY + 26);
        doc.text(`${(order.cargoFee || 0).toFixed(2)} TL`, pageWidth - margin - 5, finalY + 26, { align: "right" });
      }
      
      let currentY = finalY + 26;
      
      // İndirim bilgileri
      if (order.coupon) {
        currentY += 8;
        
        // İndirim oranı
        doc.text("Indirim Orani:", pageWidth - margin - 75, currentY);
        doc.text(`%${order.coupon.discountPercent}`, pageWidth - margin - 5, currentY, { align: "right" });
        
        currentY += 8;
        
        // İndirim tutarı
        doc.text("Indirim Tutari:", pageWidth - margin - 75, currentY);
        doc.text(`-${order.coupon.discountAmount.toFixed(2)} TL`, pageWidth - margin - 5, currentY, { align: "right" });
        
        currentY += 8;
        
        // İndirim kodu bilgisi
        doc.setTextColor(220, 53, 69); // Kırmızı
        doc.text(`Kupon Kodu: ${order.coupon.code}`, margin + 30, finalY + 10);
        
        // İndirim öncesi toplam tutar
        doc.setTextColor(60, 60, 60);
        doc.text("Indirim Oncesi Toplam:", pageWidth - margin - 75, currentY);
        const preDiscountTotal = (parseFloat(order.totalAmount) + parseFloat(order.coupon.discountAmount)).toFixed(2);
        doc.text(`${preDiscountTotal} TL`, pageWidth - margin - 5, currentY, { align: "right" });
        
        currentY += 8;
      }
      
      // Çizgi
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(pageWidth - margin - 75, currentY + 4, pageWidth - margin - 5, currentY + 4);
      
      currentY += 12;
      
      // Genel toplam
      doc.setFontSize(9);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("Genel Toplam:", pageWidth - margin - 75, currentY);
      doc.text(`${order.totalAmount.toFixed(2)} TL`, pageWidth - margin - 5, currentY, { align: "right" });
      
      currentY += 8;
      
      // Yazı ile toplam tutar
      doc.setFontSize(7);
      doc.setFont("helvetica", 'normal');
      doc.text("Yazi ile:", pageWidth - margin - 75, currentY);
      
      // Türkçe para birimi yazı ile
      const yaziIleTutar = sayiyiYaziyaCevirBasit(order.totalAmount) + " Turk Lirasi";
      doc.text(yaziIleTutar, pageWidth - margin - 5, currentY, { align: "right", maxWidth: 70 });
      
      // İmza alanı - sade tasarım
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, pageHeight - margin - 30, 60, 20, 2, 2);
      
      doc.setFontSize(8);
      doc.text("Kase / Imza", margin + 30, pageHeight - margin - 25, { align: "center" });
      
      // PDF'i indir
      doc.save(`Fatura-${order._id.slice(-6)}.pdf`);
      message.success({ content: "Fatura basariyla indirildi", key: "invoiceLoading" });
      
    } catch (error) {
      console.error("Fatura olusturma hatasi:", error);
      message.error({ content: "Fatura olusturulurken bir hata olustu", key: "invoiceLoading" });
    }
  };

  // Sayıyı yazıya çevirme fonksiyonu - Türkçe karaktersiz basit versiyon
  const sayiyiYaziyaCevirBasit = (sayi) => {
    const birler = ["", "Bir", "Iki", "Uc", "Dort", "Bes", "Alti", "Yedi", "Sekiz", "Dokuz"];
    const onlar = ["", "On", "Yirmi", "Otuz", "Kirk", "Elli", "Altmis", "Yetmis", "Seksen", "Doksan"];
    const basamaklar = ["", "Bin", "Milyon", "Milyar", "Trilyon"];
    
    // Sayıyı string'e çevir ve noktadan ayır
    const parts = sayi.toString().split(".");
    const tamKisim = parts[0];
    const ondalikKisim = parts.length > 1 ? parts[1].padEnd(2, "0").substring(0, 2) : "00";
    
    if (tamKisim === "0") return "Sifir";
    
    // 3'lü gruplara ayır
    const gruplar = [];
    for (let i = tamKisim.length; i > 0; i -= 3) {
      gruplar.unshift(tamKisim.substring(Math.max(0, i - 3), i));
    }
    
    // Her grubu yazıya çevir
    let sonuc = "";
    gruplar.forEach((grup, index) => {
      const basamakDegeri = basamaklar[gruplar.length - 1 - index];
      
      // Grup değeri 0 ise atla
      if (parseInt(grup) === 0) return;
      
      // Yüzler basamağı
      if (grup.length === 3) {
        if (grup[0] !== "0") {
          sonuc += (grup[0] === "1" ? "Yuz" : birler[parseInt(grup[0])] + "yuz");
        }
        grup = grup.substring(1);
      }
      
      // Onlar basamağı
      if (grup.length === 2) {
        if (grup[0] !== "0") {
          sonuc += onlar[parseInt(grup[0])];
        }
        grup = grup.substring(1);
      }
      
      // Birler basamağı
      if (grup.length === 1 && grup !== "0") {
        // Özel durum: 1000 için "Bir Bin" yerine sadece "Bin" yazılır
        if (!(parseInt(grup) === 1 && basamakDegeri === "Bin")) {
          sonuc += birler[parseInt(grup)];
        }
      }
      
      // Basamak değerini ekle
      if (basamakDegeri) {
        sonuc += basamakDegeri;
      }
    });
    
    // Ondalık kısmı ekle
    if (ondalikKisim !== "00") {
      sonuc += " Virgul ";
      if (ondalikKisim[0] !== "0") {
        sonuc += onlar[parseInt(ondalikKisim[0])];
      }
      if (ondalikKisim[1] !== "0") {
        sonuc += birler[parseInt(ondalikKisim[1])];
      }
    }
    
    return sonuc;
  };

  // Türkçe karakterleri İngilizce karakterlere çeviren yardımcı fonksiyon
  const turkceKarakterleriCevir = (text) => {
    if (!text) return "";
    
    return text
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "G")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "U")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "S")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "O");
  };

  const printInvoice = (order) => {
    if (!order) {
      message.error("Siparis bilgisi bulunamadi!");
      return;
    }
    
    try {
      message.loading({ content: "Fatura hazirlaniyor...", key: "invoiceLoading" });
      
      // PDF oluştur
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16 // PDF standardında maksimum hassasiyet
      });
      
      // Sayfa boyutları
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Kenar boşlukları
      const margin = 15;
      
      // Filigran ekle (daha açık renk ve küçük)
      doc.setTextColor(245, 245, 245);
      doc.setFontSize(45);
      doc.setFont("helvetica", 'bold');
      doc.text(sellerInfo.companyName.toUpperCase(), pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45
      });
      
      // Fatura çerçevesi (daha ince)
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
      
      // Başlık
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("FATURA", pageWidth / 2, margin + 10, { align: "center" });
      
      // Fatura numarası ve tarih
      const invoiceDate = new Date(order.createdAt);
      const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}.${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}.${invoiceDate.getFullYear()}`;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Fatura No: ${order._id.slice(-6)}`, pageWidth - margin - 50, margin + 5, { align: "left" });
      doc.text(`Tarih: ${formattedDate}`, pageWidth - margin - 50, margin + 12, { align: "left" });
      doc.text(`Saat: ${invoiceDate.getHours().toString().padStart(2, '0')}:${invoiceDate.getMinutes().toString().padStart(2, '0')}`, pageWidth - margin - 50, margin + 19, { align: "left" });
      
      // Firma bilgileri kutusu (sol üst) - daha uzun
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, margin + 20, pageWidth / 2 - margin - 5, 60, 2, 2);
      
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("SATICI", margin + 5, margin + 27);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", 'normal');
      doc.text(turkceKarakterleriCevir(sellerInfo.companyName), margin + 5, margin + 35);
      doc.text(`Vergi Dairesi: ${turkceKarakterleriCevir(sellerInfo.taxOffice)}`, margin + 5, margin + 42);
      doc.text(`Vergi No: ${sellerInfo.taxNumber}`, margin + 5, margin + 49);
      doc.text(`Adres: ${turkceKarakterleriCevir(sellerInfo.address)}`, margin + 5, margin + 56);
      doc.text(turkceKarakterleriCevir(sellerInfo.cityRegion), margin + 5, margin + 63);
      doc.text(`Tel: ${sellerInfo.phone}`, margin + 5, margin + 70);
      
      // Müşteri bilgileri kutusu (sağ üst) - daha uzun
      doc.roundedRect(pageWidth / 2 + 5, margin + 20, pageWidth / 2 - margin - 5, 60, 2, 2);
      
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", 'bold');
      doc.text("ALICI", pageWidth / 2 + 10, margin + 27);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", 'normal');
      doc.text(`Ad Soyad: ${turkceKarakterleriCevir(order.userName || "Belirtilmemis")}`, pageWidth / 2 + 10, margin + 35);
      doc.text(`Firma: ${turkceKarakterleriCevir(order.userCompany || "Belirtilmemis")}`, pageWidth / 2 + 10, margin + 42);
      doc.text(`Vergi Dairesi: ${turkceKarakterleriCevir(order.userTaxOffice || "Belirtilmemis")}`, pageWidth / 2 + 10, margin + 49);
      doc.text(`Vergi No: ${order.userTaxNumber || "Belirtilmemis"}`, pageWidth / 2 + 10, margin + 56);
      doc.text(`Adres: ${turkceKarakterleriCevir(order.userAddress || "Belirtilmemis")}`, pageWidth / 2 + 10, margin + 63);
      doc.text(turkceKarakterleriCevir(order.userCity || "Belirtilmemis"), pageWidth / 2 + 10, margin + 70);
      
      // Ürün tablosu başlığı - modern tasarım
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, margin + 90, pageWidth - (margin * 2), 10, 1, 1, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", 'bold');
      doc.text("URUN/HIZMET BILGILERI", pageWidth / 2, margin + 97, { align: "center" });
      
      // Ürün tablosu - daha sade
      const tableColumn = ["Sira", "Urun/Hizmet", "Miktar", "Birim", "Birim Fiyat", "KDV", "KDV Tutari", "Toplam"];
      const tableRows = [];
      
      // Ürün verilerini hazırla
      let totalKDV = 0;
      let totalWithoutKDV = 0;
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
          const kdvOrani = sellerInfo.vatRate || 18; // Satıcı bilgilerinden KDV oranını al, yoksa varsayılan %18
          const birimFiyat = item.price;
          const miktar = item.quantity;
          const toplamFiyat = birimFiyat * miktar;
          const kdvTutari = (toplamFiyat * kdvOrani) / 100;
          
          totalKDV += kdvTutari;
          totalWithoutKDV += toplamFiyat;
          
          const itemData = [
            index + 1,
            turkceKarakterleriCevir(item.name),
            miktar,
            "Adet",
            birimFiyat.toFixed(2),
            `%${kdvOrani}`,
            kdvTutari.toFixed(2),
            toplamFiyat.toFixed(2)
          ];
          tableRows.push(itemData);
        });
      }
      
      // Tabloyu oluştur - modern tasarım
      autoTable(doc, {
        startY: margin + 100,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [245, 245, 245],
          textColor: [50, 50, 50],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 20, halign: 'right' },
          7: { cellWidth: 20, halign: 'right' }
        },
        styles: {
          cellPadding: 3,
          fontSize: 8,
          valign: 'middle',
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [220, 220, 220],
          textColor: [60, 60, 60]
        },
        margin: { left: margin, right: margin }
      });
      
      // Toplam bilgileri - daha sade ve modern
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Ara toplam hesapla
      const araToplam = totalWithoutKDV;
      
      // Toplam bilgileri için kutu - modern tasarım
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(pageWidth - margin - 80, finalY, 80, order.coupon ? 85 : 60, 2, 2, 'FD');
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      doc.setFont("helvetica", 'normal');
      doc.text("Ara Toplam:", pageWidth - margin - 75, finalY + 10);
      doc.text(`${araToplam.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 10, { align: "right" });
      
      doc.text("Toplam KDV:", pageWidth - margin - 75, finalY + 18);
      doc.text(`${totalKDV.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 18, { align: "right" });
      
      if (order.cargoFee && order.cargoFee > 0) {
        doc.text("Kargo Ucreti:", pageWidth - margin - 75, finalY + 26);
        doc.text(`${(order.cargoFee || 0).toFixed(2)} TL`, pageWidth - margin - 5, finalY + 26, { align: "right" });
      }
      
      if (order.coupon) {
        doc.text("Indirim:", pageWidth - margin - 75, finalY + 34);
        doc.text(`-${order.coupon.discountAmount.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 34, { align: "right" });
        
        // İndirim kodu bilgisi
        doc.setTextColor(220, 53, 69); // Kırmızı
        doc.text(`Kupon: ${turkceKarakterleriCevir(order.coupon.code)} (%${order.coupon.discountPercent})`, margin, finalY + 10);
        
        // İndirim öncesi toplam tutar
        doc.setTextColor(60, 60, 60);
        doc.text("Indirim Oncesi Toplam:", pageWidth - margin - 75, finalY + 42);
        const preDiscountTotal = (parseFloat(order.totalAmount) + parseFloat(order.coupon.discountAmount)).toFixed(2);
        doc.text(`${preDiscountTotal} TL`, pageWidth - margin - 5, finalY + 42, { align: "right" });
        
        // Çizgi
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(pageWidth - margin - 75, finalY + 50, pageWidth - margin - 5, finalY + 50);
        
        doc.setFontSize(9);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", 'bold');
        doc.text("Genel Toplam:", pageWidth - margin - 75, finalY + 58);
        doc.text(`${order.totalAmount.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 58, { align: "right" });
        
        // Yazı ile toplam tutar
        doc.setFontSize(7);
        doc.setFont("helvetica", 'normal');
        doc.text("Yazı ile:", pageWidth - margin - 75, finalY + 66);
        
        // Türkçe para birimi yazı ile
        const yaziIleTutar = sayiyiYaziyaCevirBasit(order.totalAmount) + " Turk Lirasi";
        doc.text(yaziIleTutar, pageWidth - margin - 5, finalY + 66, { align: "right", maxWidth: 70 });
      } else {
        // Çizgi
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(pageWidth - margin - 75, finalY + 26, pageWidth - margin - 5, finalY + 26);
        
        doc.setFontSize(9);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", 'bold');
        doc.text("Genel Toplam:", pageWidth - margin - 75, finalY + 34);
        doc.text(`${order.totalAmount.toFixed(2)} TL`, pageWidth - margin - 5, finalY + 34, { align: "right" });
        
        // Yazı ile toplam tutar
        doc.setFontSize(7);
        doc.setFont("helvetica", 'normal');
        doc.text("Yazı ile:", pageWidth - margin - 75, finalY + 42);
        
        // Türkçe para birimi yazı ile
        const yaziIleTutar = sayiyiYaziyaCevirBasit(order.totalAmount) + " Turk Lirasi";
        doc.text(yaziIleTutar, pageWidth - margin - 5, finalY + 42, { align: "right", maxWidth: 70 });
      }
      
      // İmza alanı - sade tasarım
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, pageHeight - margin - 30, 60, 20, 2, 2);
      
      doc.setFontSize(8);
      doc.text("Kase / Imza", margin + 30, pageHeight - margin - 25, { align: "center" });
      
      // PDF'i yazdır
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      message.success({ content: "Fatura basariyla yazdirildi", key: "invoiceLoading" });
      
    } catch (error) {
      console.error("Fatura olusturma hatasi:", error);
      message.error({ content: "Fatura olusturulurken bir hata olustu", key: "invoiceLoading" });
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.ORDERS));

        if (!response.ok) {
          throw new Error("Siparişler getirilemedi!");
        }

        const data = await response.json();
        setDataSource(data);
      } catch (error) {
        console.log("Veri getirme hatası:", error);
        message.error("Siparişler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    fetchSellerInfo();
  }, []);

  const fetchSellerInfo = async () => {
    try {
      const response = await fetch(getFullApiUrl(API_CONFIG.API_ENDPOINTS.SELLER_INFO));
      
      if (response.ok) {
        const data = await response.json();
        setSellerInfo(data);
      } else if (response.status !== 404) {
        // 404 hatası normal (henüz kayıt yoksa), diğer hataları göster
        message.error("Satıcı bilgileri yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Satıcı bilgileri getirme hatası:", error);
      message.error("Satıcı bilgileri yüklenirken bir hata oluştu");
    }
  };

  // Filtrelenmiş siparişler
  const filteredOrders = dataSource.filter(order => {
    const id = order._id?.slice(-6).toLowerCase();
    const userName = order.userName?.toLowerCase() || "";
    const userEmail = order.userEmail?.toLowerCase() || "";
    const userCompany = order.userCompany?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    const coupon = order.coupon?.code?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      id.includes(search) ||
      userName.includes(search) ||
      userEmail.includes(search) ||
      userCompany.includes(search) ||
      status.includes(search) ||
      coupon.includes(search)
    );
  });

  // Satıcı bilgileri modalı
  const sellerInfoModal = (
    <Modal
      title="Satıcı Bilgilerini Düzenle"
      open={isSellerInfoModalVisible}
      onCancel={handleSellerInfoCancel}
      footer={null}
      width={700}
    >
      <Form
        form={sellerForm}
        layout="vertical"
        onFinish={handleSellerInfoSave}
        initialValues={sellerInfo}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="companyName"
              label="Firma Adı"
              rules={[{ required: true, message: 'Firma adı gerekli' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
              rules={[{ required: true, message: 'Telefon gerekli' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="taxOffice"
              label="Vergi Dairesi"
              rules={[{ required: true, message: 'Vergi dairesi gerekli' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxNumber"
              label="Vergi Numarası"
              rules={[{ required: true, message: 'Vergi numarası gerekli' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item
              name="address"
              label="Adres"
              rules={[{ required: true, message: 'Adres gerekli' }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="vatRate"
              label="KDV Oranı (%)"
              rules={[{ required: true, message: 'KDV oranı gerekli' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cityRegion"
              label="Şehir/Bölge"
              rules={[{ required: true, message: 'Şehir/Bölge gerekli' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>Banka Bilgileri</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankName"
              label="Banka Adı"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bankBranch"
              label="Şube"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="iban"
              label="IBAN"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Kaydet
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Siparişler</h2>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={showSellerInfoModal}
        >
          Satıcı Bilgilerini Düzenle
        </Button>
      </div>
      <div className="order-search-box">
        <input
          type="text"
          placeholder="Müşteri adı, e-posta, şirket, sipariş ID veya durum ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey={(record) => record._id}
        loading={loading}
        scroll={{ x: true }}
        pagination={{ pageSize: 10 }}
        bordered
      />
      
      <Modal
        title="Sipariş Detayları"
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button 
            key="print" 
            type="default" 
            icon={<PrinterOutlined />} 
            onClick={() => printInvoice(selectedOrder)}
            style={{ 
              marginRight: 8, 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              fontWeight: 500 
            }}
          >
            Yazdır
          </Button>,
          <Button 
            key="invoice" 
            type="primary" 
            icon={<FileTextOutlined />} 
            onClick={() => generateInvoicePDF(selectedOrder)}
            style={{ 
              backgroundColor: '#1890ff', 
              borderColor: '#1890ff', 
              color: 'white', 
              fontWeight: 500 
            }}
          >
            Fatura Oluştur
          </Button>,
          <Button 
            key="close" 
            onClick={handleCancel}
            style={{ 
              marginLeft: 8 
            }}
          >
            Kapat
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="order-details-container">
            <div className="order-section">
              <h3>Sipariş Bilgileri</h3>
              <div className="order-info">
                <p><strong>Sipariş ID:</strong> {selectedOrder._id}</p>
                <p><strong>Toplam Tutar:</strong> {selectedOrder.totalAmount.toFixed(2)} TL</p>
                <p><strong>Durum:</strong> {selectedOrder.status}</p>
                <p><strong>Sipariş Tarihi:</strong> {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}</p>
                {selectedOrder.coupon && (
                  <div className="coupon-info">
                    <p><strong>Kupon Kodu:</strong> {selectedOrder.coupon.code}</p>
                    <p><strong>İndirim Oranı:</strong> %{selectedOrder.coupon.discountPercent}</p>
                    <p><strong>İndirim Tutarı:</strong> {selectedOrder.coupon.discountAmount.toFixed(2)} TL</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="customer-section">
              <h3>Müşteri Bilgileri</h3>
              <div className="customer-info">
                <p><strong>Ad Soyad:</strong> {selectedOrder.userName || "Belirtilmemiş"}</p>
                <p><strong>E-posta:</strong> {selectedOrder.userEmail || "Belirtilmemiş"}</p>
                <p><strong>Şirket:</strong> {selectedOrder.userCompany || "Belirtilmemiş"}</p>
                <p><strong>Telefon:</strong> {selectedOrder.userPhone || "Belirtilmemiş"}</p>
                <p><strong>Adres:</strong> {selectedOrder.userAddress || "Belirtilmemiş"}</p>
                <p><strong>Şehir:</strong> {selectedOrder.userCity || "Belirtilmemiş"}</p>
              </div>
            </div>
            
            <div className="products-section">
              <h3>Sipariş Ürünleri</h3>
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
                    render: (price) => <span>{price} TL</span>,
                  },
                  {
                    title: "Toplam",
                    key: "total",
                    render: (_, record) => <span>{(record.price * record.quantity).toFixed(2)} TL</span>,
                  },
                ]}
                rowKey={(item) => item.productId}
                pagination={false}
                bordered
              />
            </div>
          </div>
        )}
      </Modal>
      
      {sellerInfoModal}
    </>
  );
};

export default OrderPage;