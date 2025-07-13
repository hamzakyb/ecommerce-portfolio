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
    // MongoDB bağlantısı
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

    // 2. Test kullanıcısı oluştur
    const testUser = new User({
      username: 'test',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random'
    });
    await testUser.save();
    console.log('Test kullanıcısı oluşturuldu.');

    // 3. Kategoriler oluştur
    const categories = [
      {
        name: 'Elektronik',
        img: '/img/categories/categories1.png'
      },
      {
        name: 'Giyim',
        img: '/img/categories/categories2.png'
      },
      {
        name: 'Ev & Yaşam',
        img: '/img/categories/categories3.png'
      },
      {
        name: 'Spor',
        img: '/img/categories/categories4.png'
      },
      {
        name: 'Kitap',
        img: '/img/categories/categories5.png'
      },
      {
        name: 'Kozmetik',
        img: '/img/categories/categories6.png'
      }
    ];

    const savedCategories = await Category.insertMany(categories);
    console.log('Kategoriler oluşturuldu.');

    // 4. Ürünler oluştur
    const products = [
      {
        name: 'iPhone 15 Pro',
        img: [
          '/img/products/product1/1.png',
          '/img/products/product1/2.png',
          '/img/products/product1/3.png'
        ],
        price: {
          current: 45000,
          discount: 42000
        },
        category: savedCategories[0]._id, // Elektronik
        description: 'Apple iPhone 15 Pro 128GB Titanium',
        stock: 50
      },
      {
        name: 'Samsung Galaxy S24',
        img: [
          '/img/products/product2/1.png',
          '/img/products/product2/2.png',
          '/img/products/product2/3.png'
        ],
        price: {
          current: 38000,
          discount: 35000
        },
        category: savedCategories[0]._id, // Elektronik
        description: 'Samsung Galaxy S24 256GB Phantom Black',
        stock: 30
      },
      {
        name: 'Nike Air Max',
        img: [
          '/img/products/product3/1.png',
          '/img/products/product3/2.png',
          '/img/products/product3/3.png'
        ],
        price: {
          current: 2500,
          discount: 2200
        },
        category: savedCategories[3]._id, // Spor
        description: 'Nike Air Max 270 Erkek Spor Ayakkabı',
        stock: 100
      },
      {
        name: 'Adidas T-Shirt',
        img: [
          '/img/products/product4/1.png',
          '/img/products/product4/2.png',
          '/img/products/product4/3.png'
        ],
        price: {
          current: 300,
          discount: 250
        },
        category: savedCategories[1]._id, // Giyim
        description: 'Adidas Erkek Spor T-Shirt',
        stock: 200
      },
      {
        name: 'MacBook Air M2',
        img: [
          '/img/products/product5/1.png',
          '/img/products/product5/2.png',
          '/img/products/product5/3.png'
        ],
        price: {
          current: 35000,
          discount: 32000
        },
        category: savedCategories[0]._id, // Elektronik
        description: 'Apple MacBook Air M2 13.6" 256GB',
        stock: 25
      }
    ];

    await Product.insertMany(products);
    console.log('Ürünler oluşturuldu.');

    // 5. Kuponlar oluştur
    const coupons = [
      {
        code: 'YENI10',
        discountPercent: 10
      },
      {
        code: 'INDIRIM20',
        discountPercent: 20
      },
      {
        code: 'OZEL15',
        discountPercent: 15
      }
    ];

    await Coupon.insertMany(coupons);
    console.log('Kuponlar oluşturuldu.');

    // 6. Satıcı bilgileri oluştur
    const sellerInfo = new SellerInfo({
      companyName: 'E-Ticaret Mağazası',
      taxOffice: 'Kadıköy',
      taxNumber: '1234567890',
      address: 'Atatürk Mahallesi, Ticaret Sokak No:1',
      cityRegion: 'İstanbul/Kadıköy',
      phone: '0216 123 45 67',
      vatRate: 18,
      bankName: 'Garanti BBVA',
      bankBranch: 'Kadıköy Şubesi',
      iban: 'TR12 3456 7890 1234 5678 9012 34'
    });

    await sellerInfo.save();
    console.log('Satıcı bilgileri oluşturuldu.');

    // 7. Bildirimler oluştur
    const notifications = [
      {
        userId: testUser._id,
        title: 'Hoş Geldiniz!',
        message: 'E-ticaret sitemize hoş geldiniz. İlk siparişinizde %10 indirim kazanın.',
        type: 'info',
        read: false
      },
      {
        userId: testUser._id,
        title: 'Sipariş Durumu',
        message: 'Siparişiniz kargoya verildi.',
        type: 'success',
        read: false
      }
    ];

    await Notification.insertMany(notifications);
    console.log('Bildirimler oluşturuldu.');

    // 8. Müşteri hesap bilgileri oluştur
    const customerAccount = new CustomerAccount({
      userId: testUser._id,
      balance: 1000,
      transactions: [
        {
          type: 'deposit',
          amount: 1000,
          description: 'Başlangıç bakiyesi'
        }
      ]
    });

    await customerAccount.save();
    console.log('Müşteri hesap bilgileri oluşturuldu.');

    console.log('Veritabanı başarıyla dolduruldu!');
    console.log('\nGiriş bilgileri:');
    console.log('Admin - Email: admin@admin.com, Şifre: admin123');
    console.log('Test - Email: test@test.com, Şifre: admin123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı.');
  }
};

seedDatabase(); 