const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('MongoDB bağlantısı test ediliyor...');
    console.log('Bağlantı URL:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log('Veritabanı adı:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    console.log('\nOlası çözümler:');
    console.log('1. MongoDB Atlas\'ta kullanıcı adı ve şifreyi kontrol edin');
    console.log('2. Kullanıcının veritabanına erişim izni olduğundan emin olun');
    console.log('3. IP adresinizin MongoDB Atlas\'ta izin verilen IP\'ler arasında olduğunu kontrol edin');
    console.log('4. Şifrede özel karakterler varsa URL encode edin');
  } finally {
    await mongoose.connection.close();
    console.log('Bağlantı kapatıldı.');
  }
};

testConnection(); 