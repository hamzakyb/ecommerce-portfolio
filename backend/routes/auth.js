const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

// Kullanıcı adına göre avatar URL'si oluştur
const generateAvatarFromUsername = (username) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=256`;
};

// Yeni bir kullanıcı oluşturma (Create - Register)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const avatar = generateAvatarFromUsername(username);

    console.log('Kayıt isteği alındı:', { username, email, isAdmin });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Email zaten kayıtlı:', email);
      return res
        .status(400)
        .json({ error: "Bu email adresi zaten kayıtlı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatar,
      role: isAdmin ? "admin" : "user"
    });

    console.log('Yeni kullanıcı oluşturuluyor:', { 
      username, 
      email, 
      role: newUser.role 
    });

    await newUser.save();
    console.log('Kullanıcı başarıyla kaydedildi');

    // Token oluştur
    const token = jwt.sign(
      { 
        userId: newUser._id.toString(),
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const responseData = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      avatar: newUser.avatar,
      token
    };

    console.log('Kayıt başarılı, yanıt:', { ...responseData, token: '***' });
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Kullanıcı Giriş yapma (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login isteği alındı:', { email });

    if (!email || !password) {
      console.log('Email veya şifre eksik:', { email: !!email, password: !!password });
      return res.status(400).json({ error: "Email ve şifre zorunludur" });
    }

    // Veritabanı bağlantısını kontrol et
    try {
      const user = await User.findOne({ email });
      console.log('Veritabanı sorgusu sonucu:', user ? 'Kullanıcı bulundu' : 'Kullanıcı bulunamadı');
      
      if (!user) {
        console.log('Kullanıcı bulunamadı:', email);
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }

      console.log('Şifre karşılaştırılıyor...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Şifre doğru mu:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Şifre yanlış:', email);
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }

      // Token oluştur
      const token = jwt.sign(
        { 
          userId: user._id.toString(),
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );

      console.log('Token oluşturuldu, kullanıcı bilgileri döndürülüyor');

      // Kullanıcı bilgilerini döndür (şifre hariç)
      const responseData = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        token
      };

      console.log('Başarılı giriş, yanıt:', { ...responseData, token: '***' });
      res.status(200).json(responseData);
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
