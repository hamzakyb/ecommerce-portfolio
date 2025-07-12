const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı.');

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Test kullanıcısı oluştur
    const testUser = new User({
      username: 'test',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random'
    });

    // Önce aynı email ile kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Bu email adresi zaten kullanımda:', testUser.email);
      return;
    }

    // Kullanıcıyı kaydet
    await testUser.save();
    console.log('Test kullanıcısı başarıyla oluşturuldu:');
    console.log('Email:', testUser.email);
    console.log('Şifre: test123');
    console.log('Rol:', testUser.role);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser(); 