const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const { createOrderNotification, createStockNotification } = require('../services/notificationService');
const User = require("../models/User");

// Token doğrulama middleware'i
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Yetkilendirme başlığı geçersiz" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Token bulunamadı" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Geçersiz token" });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Sipariş oluşturma - Token doğrulama eklenmiş
router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, items, totalAmount, cargoFee, coupon } = req.body;

    // userId kontrolü
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: "Geçersiz kullanıcı ID'si" });
    }

    // Token'daki kullanıcı ID'si ile gönderilen ID'nin eşleştiğini kontrol et
    // req.user.userId, token oluşturulurken kullanılan ID
    const tokenUserId = req.user.userId;
    
    console.log(`Sipariş oluşturma: Token ID (${tokenUserId}), İstenen ID (${userId})`);
    
    // ID'leri karşılaştır - MongoDB ObjectId olabilir, string karşılaştırması yap
    if (tokenUserId.toString() !== userId.toString()) {
      console.log(`Token ID (${tokenUserId}) ile istenen ID (${userId}) eşleşmiyor`);
      return res.status(403).json({ 
        error: "Yetkilendirme hatası: Başka bir kullanıcı için sipariş oluşturamazsınız" 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Sipariş öğeleri zorunludur." });
    }

    // Stok kontrolü ve güncellemesi için
    // Her ürün için stok kontrolü yap
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: `Ürün bulunamadı: ${item.productId}` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Yetersiz stok: ${product.name} için sadece ${product.stock} adet mevcut.` 
        });
      }
      
      // Stok miktarını güncelle
      product.stock -= item.quantity;
      await product.save();
      
      // Stok azaldıysa bildirim gönder (örneğin 5'in altına düştüyse)
      if (product.stock <= 5) {
        await createStockNotification(product, global.io);
      }
    }

    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      cargoFee,
      status: "Beklemede",
    });
    
    // Kupon bilgisi varsa ekle
    if (coupon) {
      newOrder.coupon = {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount
      };
    }

    await newOrder.save();
    
    // Sipariş bildirimi gönder
    await createOrderNotification(newOrder, global.io);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ 
      error: "Sipariş oluşturulamadı",
      details: error.message 
    });
  }
});

// Tüm siparişleri getir
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // MongoDB ObjectId formatında ise doğrudan ID ile ara
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      } else {
        // Kullanıcı bilgilerinde ara
        const users = await User.find({
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { companyName: { $regex: search, $options: "i" } }
          ]
        }).select('_id');
        
        const userIds = users.map(user => user._id);
        
        if (userIds.length > 0) {
          query = { userId: { $in: userIds } };
        } else {
          // Sipariş ID'sinin son 6 karakterinde ara
          const orders = await Order.find();
          const filteredOrders = orders.filter(order => 
            order._id.toString().slice(-6).includes(search)
          );
          
          if (filteredOrders.length > 0) {
            const orderIds = filteredOrders.map(order => order._id);
            query = { _id: { $in: orderIds } };
          } else {
            // Hiçbir sonuç bulunamadı
            return res.status(200).json([]);
          }
        }
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "username email phone address companyName city",
      });

    // Kullanıcı bilgilerini siparişlere ekle
    const ordersWithUserInfo = orders.map(order => {
      const orderObject = order.toObject();
      
      // Kullanıcı bilgisi varsa email'i ekle
      if (orderObject.userId) {
        orderObject.userEmail = orderObject.userId.email;
        orderObject.userName = orderObject.userId.username;
        orderObject.userCompany = orderObject.userId.companyName;
        orderObject.userPhone = orderObject.userId.phone;
        orderObject.userAddress = orderObject.userId.address;
        orderObject.userCity = orderObject.userId.city;
      }
      
      return orderObject;
    });

    res.status(200).json(ordersWithUserInfo);
  } catch (error) {
    console.error("Siparişleri getirme hatası:", error);
    res.status(500).json({ message: "Siparişler getirilirken bir hata oluştu" });
  }
});

// Belirli bir siparişi silme
router.delete("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Sipariş bulunamadı." });
    }

    res.status(200).json({ message: "Sipariş başarıyla silindi." });
  } catch (error) {
    console.error("Sipariş silme hatası:", error.message);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Sipariş durumunu güncelleme
router.patch("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Sipariş bulunamadı." });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Sipariş güncelleme hatası:", error.message);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Belirli bir siparişin detaylarını getirme
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'email username companyName phone address city',
      })
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name price',
      });

    if (!order) {
      return res.status(404).json({ error: "Sipariş bulunamadı." });
    }

    const formattedOrder = {
      ...order.toObject(),
      userEmail: order.userId ? order.userId.email : "Unknown",
      userName: order.userId ? order.userId.username : "Unknown",
      userCompany: order.userId ? order.userId.companyName : "Unknown",
      userPhone: order.userId ? order.userId.phone : "Unknown",
      userAddress: order.userId ? order.userId.address : "Unknown",
      userCity: order.userId ? order.userId.city : "Unknown",
      orderItems: order.items.map(item => ({
        ...item,
        productName: item.productId ? item.productId.name : "Unknown",
        productPrice: item.productId ? item.productId.price : "Unknown",
      })),
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("Sipariş detaylarını getirme hatası:", error.message);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Kullanıcının siparişlerini getir
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Kullanıcı siparişlerini getirme hatası:", error);
    res.status(500).json({ message: "Kullanıcı siparişleri getirilirken bir hata oluştu" });
  }
});

module.exports = router;