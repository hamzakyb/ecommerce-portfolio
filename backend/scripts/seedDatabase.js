const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelleri import et
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const SellerInfo = require('../models/SellerInfo');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const CustomerAccount = require('../models/CustomerAccount');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB bağlantısı başarılı.');

    // Mevcut verileri temizle
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await SellerInfo.deleteMany({});
    await Notification.deleteMany({});
    await Order.deleteMany({});
    await CustomerAccount.deleteMany({});
    console.log('Mevcut veriler temizlendi.');

    // 1. Admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=random&color=fff&size=256'
    });
    await adminUser.save();
    console.log('Admin kullanıcısı oluşturuldu.');

    // 2. B2B müşteri kullanıcısı oluştur
    const b2bUser = new User({
      username: 'b2bmusteri',
      email: 'b2b@firma.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=B2B+Müşteri&background=random'
    });
    await b2bUser.save();
    console.log('B2B müşteri kullanıcısı oluşturuldu.');

    // 3. Kategoriler (Araç Filtreleri)
    const categories = [
      {
        name: 'Yağ Filtresi',
        img: '/img/categories/oil-filter.png'
      },
      {
        name: 'Hava Filtresi',
        img: '/img/categories/air-filter.png'
      },
      {
        name: 'Yakıt Filtresi',
        img: '/img/categories/fuel-filter.png'
      },
      {
        name: 'Polen Filtresi',
        img: '/img/categories/cabin-filter.png'
      },
      {
        name: 'Hidrolik Filtresi',
        img: '/img/categories/hydraulic-filter.png'
      }
    ];
    const savedCategories = await Category.insertMany(categories);
    console.log('Araç filtre kategorileri oluşturuldu.');

    // 4. Ürünler (Filtreler)
    const products = [
      {
        name: 'Mann Yağ Filtresi W 610/3',
        img: [
          '/img/products/oil-filter1.png',
          '/img/products/oil-filter2.png'
        ],
        price: {
          current: 120,
          discount: 110
        },
        category: savedCategories[0]._id, // Yağ Filtresi
        description: 'Mann marka, yüksek performanslı yağ filtresi. Uyumlu: VW, Audi, Seat, Skoda',
        stock: 500
      },
      {
        name: 'Bosch Hava Filtresi S 0240',
        img: [
          '/img/products/air-filter1.png',
          '/img/products/air-filter2.png'
        ],
        price: {
          current: 95,
          discount: 85
        },
        category: savedCategories[1]._id, // Hava Filtresi
        description: 'Bosch marka, uzun ömürlü hava filtresi. Uyumlu: Ford, Opel, Renault',
        stock: 350
      },
      {
        name: 'Filtron Yakıt Filtresi PP 836/1',
        img: [
          '/img/products/fuel-filter1.png',
          '/img/products/fuel-filter2.png'
        ],
        price: {
          current: 180,
          discount: 170
        },
        category: savedCategories[2]._id, // Yakıt Filtresi
        description: 'Filtron marka, dizel araçlar için yakıt filtresi. Uyumlu: Peugeot, Citroen',
        stock: 200
      },
      {
        name: 'Ufi Polen Filtresi 54.140.00',
        img: [
          '/img/products/cabin-filter1.png',
          '/img/products/cabin-filter2.png'
        ],
        price: {
          current: 75,
          discount: 70
        },
        category: savedCategories[3]._id, // Polen Filtresi
        description: 'Ufi marka, yüksek filtrasyonlu polen filtresi. Uyumlu: Fiat, Alfa Romeo',
        stock: 400
      },
      {
        name: 'Sakura Hidrolik Filtresi HC-9020',
        img: [
          '/img/products/hydraulic-filter1.png',
          '/img/products/hydraulic-filter2.png'
        ],
        price: {
          current: 210,
          discount: 200
        },
        category: savedCategories[4]._id, // Hidrolik Filtresi
        description: 'Sakura marka, endüstriyel hidrolik sistemler için filtre. Uyumlu: Tüm ağır vasıta',
        stock: 150
      }
    ];
    await Product.insertMany(products);
    console.log('Araç filtre ürünleri oluşturuldu.');

    // 5. Kuponlar
    const coupons = [
      {
        code: 'B2B10',
        discountPercent: 10
      },
      {
        code: 'FILTRE15',
        discountPercent: 15
      }
    ];
    await Coupon.insertMany(coupons);
    console.log('Kuponlar oluşturuldu.');

    // 6. Satıcı Bilgisi (B2B Firma)
    const sellerInfo = new SellerInfo({
      companyName: 'Dream Filtre',
      taxOffice: 'Maslak',
      taxNumber: '1234567890',
      address: 'Maslak Mah. Atatürk Oto Sanayi Sitesi 2. Kısım No:45',
      cityRegion: 'İstanbul/Sarıyer',
      phone: '0212 999 99 99',
      vatRate: 18,
      bankName: 'Garanti BBVA',
      bankBranch: 'Maslak Şubesi',
      iban: 'TR12 0006 2000 1234 5678 9012 34'
    });
    await sellerInfo.save();
    console.log('Satıcı bilgisi oluşturuldu.');

    // 7. Bildirimler
    const notifications = [
      {
        userId: b2bUser._id,
        title: 'Hoş Geldiniz!',
        message: 'FiltreMarket B2B platformuna hoş geldiniz. İlk siparişinizde %10 indirim kazanın.',
        type: 'info',
        read: false
      },
      {
        userId: b2bUser._id,
        title: 'Sipariş Durumu',
        message: 'Siparişiniz hazırlanıyor.',
        type: 'success',
        read: false
      }
    ];
    await Notification.insertMany(notifications);
    console.log('Bildirimler oluşturuldu.');

    // 8. Müşteri hesap bilgileri
    const customerAccount = new CustomerAccount({
      userId: b2bUser._id,
      balance: 5000,
      transactions: [
        {
          type: 'deposit',
          amount: 5000,
          description: 'B2B açılış bakiyesi'
        }
      ]
    });
    await customerAccount.save();
    console.log('Müşteri hesap bilgileri oluşturuldu.');

    console.log('Veritabanı başarıyla dolduruldu!');
    console.log('\nGiriş bilgileri:');
    console.log('Admin - Email: admin@admin.com, Şifre: admin123');
    console.log('B2B Müşteri - Email: b2b@firma.com, Şifre: admin123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı.');
  }
};

seedDatabase(); 