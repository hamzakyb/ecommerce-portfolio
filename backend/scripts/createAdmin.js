const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Admin kullanıcı bilgileri
    const adminData = {
      username: 'admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=random&color=fff&size=256'
    };

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut');
      process.exit(0);
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Yeni admin kullanıcısı oluştur
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu');
    console.log('Email:', adminData.email);
    console.log('Şifre:', adminData.password);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin(); 