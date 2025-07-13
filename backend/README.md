# Dream Filtre B2B E-Ticaret Platformu

Kurumsal müşterilere yönelik araç filtreleri satışı için geliştirilmiş, modern ve ölçeklenebilir bir B2B e-ticaret platformu.

## Canlı Demo ve Kaynak Kod

- **Canlı Uygulama:** [https://ecommerce-portfolio-hazel.vercel.app/]  
- **GitHub:** [https://github.com/hamzakyb/ecommerce-portfolio]

## Genel Bakış

Dream Filtre, araç filtreleri sektöründe faaliyet gösteren firmalar için özel olarak tasarlanmış, kullanıcı dostu ve güvenli bir B2B e-ticaret çözümüdür. Platform, ürün yönetimi, sipariş takibi, kampanya ve kupon yönetimi, bildirim sistemi ve kapsamlı bir yönetim paneli gibi işlevlerle donatılmıştır.

## Kullanılan Teknolojiler

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** React.js, Vite, Context API
- **Diğer:** Socket.io (gerçek zamanlı bildirimler), JWT (kimlik doğrulama), Render (backend deploy), Vercel (frontend deploy)

## Ana Özellikler

- **Kullanıcı Yönetimi:** Admin, müşteri ve satıcı rolleri, JWT tabanlı kimlik doğrulama
- **Ürün ve Kategori Yönetimi:** Kapsamlı ürün ve kategori CRUD işlemleri
- **Sipariş Yönetimi:** Sipariş oluşturma, takip ve yönetim
- **Kupon ve Kampanya:** İndirim kuponları ve kampanya yönetimi
- **Bildirim Sistemi:** Gerçek zamanlı bildirimler (Socket.io)
- **Admin Paneli:** Kullanıcı, ürün, sipariş, kategori, kupon ve bildirim yönetimi
- **CORS ve Güvenlik:** Sadece tanımlı domainlerden erişim, güvenli environment variable kullanımı
- **Mobil ve Masaüstü Uyumlu Modern Arayüz**

## Kurulum ve Çalıştırma

### 1. Klonlama
```bash
git clone https://github.com/hamzakyb/ecommerce-portfolio.git
cd ecommerce-portfolio
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

#### Environment Variables
`.env` dosyası oluşturup aşağıdaki değişkenleri ekleyin:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://ecommerce-portfolio-hazel.vercel.app/
```

#### Seed Script (Opsiyonel)
```bash
npm run seed
```

#### Backend’i Başlatma
```bash
npm start
```

### 3. Frontend Kurulumu
```bash
cd ../frontend
npm install
```

#### Environment Variables
`.env` dosyası oluşturup aşağıdaki değişkeni ekleyin:
```
VITE_API_URL=https://dreamfiltre-backend.onrender.com
```

#### Frontend’i Başlatma
```bash
npm run dev
```

## Demo Giriş Bilgileri

- **Admin:**
  - E-posta: admin@dreamfiltre.com
  - Şifre: Admin1234
- **Test Kullanıcısı:**
  - E-posta: test@dreamfiltre.com
  - Şifre: Test1234


## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## İletişim

hamzakybsi@gmail.com

