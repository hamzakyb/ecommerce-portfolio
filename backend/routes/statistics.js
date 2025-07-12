const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// Admin dashboard için genel istatistikleri getir
router.get("/dashboard", async (req, res) => {
  try {
    // Toplam sipariş sayısı
    const totalOrders = await Order.countDocuments();
    
    // Toplam müşteri sayısı
    const totalCustomers = await User.countDocuments({ role: "user" });
    
    // Toplam ürün sayısı
    const totalProducts = await Product.countDocuments();
    
    // Toplam gelir
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Bekleyen sipariş sayısı
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ["Beklemede", "pending", "Onaylandı", "processing", "Kargoya Verildi"] } 
    });
    
    // Tamamlanan sipariş sayısı
    const completedOrders = await Order.countDocuments({ 
      status: { $in: ["Tamamlandı", "delivered"] } 
    });
    
    // İptal edilen sipariş sayısı
    const cancelledOrders = await Order.countDocuments({ 
      status: { $in: ["İptal Edildi", "cancelled"] } 
    });

    // Son 6 aylık sipariş verileri
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalSales: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    // Aylık müşteri artışı
    const monthlyCustomerData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          role: "user"
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    // Verileri istemcinin kullanabileceği formata dönüştür
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    
    const formattedSalesData = monthlySalesData.map(item => ({
      name: monthNames[item._id.month - 1],
      satilanUrunSayisi: item.count,
      toplamSatis: item.totalSales
    }));
    
    const formattedCustomerData = monthlyCustomerData.map(item => ({
      name: monthNames[item._id.month - 1],
      musteriSayisi: item.count
    }));
    
    // Tüm istatistikleri döndür
    res.status(200).json({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlySalesData: formattedSalesData,
      monthlyCustomerData: formattedCustomerData
    });
    
  } catch (error) {
    console.error("İstatistik getirme hatası:", error);
    res.status(500).json({ message: "İstatistikler getirilirken bir hata oluştu" });
  }
});

module.exports = router; 