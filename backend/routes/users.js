const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { createUserNotification } = require('../services/notificationService');
const bcrypt = require('bcryptjs');

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Token'ın süresinin dolup dolmadığını kontrol et
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({ error: "Token süresi dolmuş" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token süresi dolmuş" });
    }
    return res.status(401).json({ error: "Geçersiz token" });
  }
};

// Kullanıcı oluşturma (Create)
router.post("/", async (req, res) => {
  try {
    const { username, email, password, phone, companyName, taxNumber, taxOffice } = req.body;

    // Zorunlu alanları kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "Kullanıcı adı, email ve şifre zorunludur" 
      });
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "Geçersiz email formatı" 
      });
    }

    // Email benzersizliğini kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: "Bu email adresi zaten kullanımda" 
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      companyName,
      taxNumber,
      taxOffice,
      role: "user" // Varsayılan rol
    });

    await newUser.save();
    
    // Yeni kullanıcı bildirimi gönder
    await createUserNotification(newUser, global.io);
    
    // Şifre hariç kullanıcı bilgilerini döndür
    const userResponse = newUser.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error);
    res.status(400).json({ 
      error: "Kullanıcı oluşturulamadı", 
      details: error.message 
    });
  }
});

//Tüm Kullanıcıları getirme (Read- All)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } }
        ]
      };
    }

    console.log('Kullanıcılar getiriliyor...');
    const users = await User.find(query).select('-password');
    console.log('Bulunan kullanıcı sayısı:', users.length);
    console.log('Kullanıcılar:', users.map(u => ({ id: u._id, email: u.email, username: u.username })));
    
    // ID'leri açıkça belirt
    const formattedUsers = users.map(user => {
      const userObj = user.toObject();
      userObj.id = userObj._id;
      return userObj;
    });

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Kullanıcıları getirme hatası:", error);
    return res.status(500).json({ 
      success: false,
      error: "Kullanıcılar getirilirken bir hata oluştu" 
    });
  }
});

// Kullanıcı silme (Delete) - ID ile silme
router.delete("/:id", async (req, res) => { 
    try {
        const id = req.params.id;
        
        const deletedUser = await User.findByIdAndDelete(id);

        if(!deletedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        res.status(200).json(deletedUser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error." });
    }
});

// Kullanıcının siparişlerini almak için route - Daha detaylı bilgilerle
router.get('/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Siparişleri al ve ürün bilgilerini doldur
    const orders = await Order.find({ userId })
      .populate({
        path: 'items.productId',
        select: 'name price img description'
      })
      .sort({ createdAt: -1 }); // En son siparişler önce gelsin
    
    // Siparişleri daha kullanışlı bir formata dönüştür
    const formattedOrders = orders.map(order => {
      const formattedItems = order.items.map(item => {
        return {
          _id: item._id,
          productId: item.productId?._id || 'Ürün Bulunamadı',
          name: item.productId?.name || 'Ürün Bulunamadı',
          price: item.price,
          quantity: item.quantity,
          img: item.productId?.img?.[0] || '',
          totalPrice: item.price * item.quantity
        };
      });

      return {
        _id: order._id,
        userId: order.userId,
        items: formattedItems,
        totalAmount: order.totalAmount,
        cargoFee: order.cargoFee || 0,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });
    
    res.json(formattedOrders);
  } catch (error) {
    console.error("Sipariş alma hatası:", error);
    res.status(500).json({ message: "Siparişler alınırken bir hata oluştu." });
  }
});

// Kullanıcı bilgilerini getir (token ile doğrulanmış)
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // userId kontrolü
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: "Geçersiz kullanıcı ID'si" });
    }
    
    // Token'daki kullanıcı ID'si ile istenen ID'nin eşleştiğini kontrol et
    // req.user.userId, token oluşturulurken kullanılan ID
    const tokenUserId = req.user.userId;
    
    // ID'leri karşılaştır - MongoDB ObjectId olabilir, string karşılaştırması yap
    if (tokenUserId.toString() !== userId.toString()) {
      console.log(`Token ID (${tokenUserId}) ile istenen ID (${userId}) eşleşmiyor`);
      return res.status(403).json({ 
        error: "Yetkilendirme hatası: Başka bir kullanıcının bilgilerine erişemezsiniz" 
      });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Önbellek kontrolü için ETag oluştur
    // Son güncelleme zamanını kullanarak basit bir ETag oluşturuyoruz
    const etag = `W/"user-${userId}-${user.updatedAt.getTime()}"`;
    
    // İstemcinin gönderdiği If-None-Match başlığını kontrol et
    const ifNoneMatch = req.headers['if-none-match'];
    
    // Eğer ETag eşleşiyorsa, içerik değişmemiştir, 304 Not Modified döndür
    if (ifNoneMatch === etag) {
      return res.status(304).end();
    }
    
    // ID'yi açıkça belirt
    const userData = user.toObject();
    userData.id = userData._id;
    
    // Önbellek başlıklarını ayarla
    res.set({
      'ETag': etag,
      'Cache-Control': 'private, max-age=300', // 5 dakika önbellek
      'Last-Modified': user.updatedAt.toUTCString()
    });
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Kullanıcı bilgilerini güncelleme (token ile doğrulanmış)
router.put('/:userId/profile', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // userId kontrolü
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: "Geçersiz kullanıcı ID'si" });
    }
    
    // Token'daki kullanıcı ID'si ile istenen ID'nin eşleştiğini kontrol et
    const tokenUserId = req.user.userId;
    
    // ID'leri karşılaştır
    if (tokenUserId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        error: "Yetkilendirme hatası: Başka bir kullanıcının bilgilerini güncelleyemezsiniz" 
      });
    }
    
    // Güncellenebilir alanlar
    const {
      username,
      phone,
      address,
      city,
      postalCode,
      companyName,
      taxNumber,
      taxOffice
    } = req.body;
    
    // Güncellenecek alanları içeren nesne
    const updateData = {};
    
    // Sadece gönderilen alanları güncelle
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (postalCode) updateData.postalCode = postalCode;
    if (companyName) updateData.companyName = companyName;
    if (taxNumber) updateData.taxNumber = taxNumber;
    if (taxOffice) updateData.taxOffice = taxOffice;
    
    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // ID'yi açıkça belirt
    const userData = updatedUser.toObject();
    userData.id = userData._id;
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Kullanıcı bilgisi güncelleme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Admin için kullanıcı detaylarını getirme
router.get('/admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // userId kontrolü
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: "Geçersiz kullanıcı ID'si" });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // ID'yi açıkça belirt
    const userData = user.toObject();
    userData.id = userData._id;
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Şifre değiştirme endpoint'i
router.post('/:userId/change-password', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "Yeni şifre gereklidir" });
    }

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    user.password = hashedPassword;
    await user.save();

    // Başarılı yanıt döndür
    return res.status(200).json({ 
      success: true,
      message: "Şifre başarıyla değiştirildi" 
    });

  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    return res.status(500).json({ 
      success: false,
      error: "Şifre değiştirilirken bir hata oluştu" 
    });
  }
});

module.exports = router;
