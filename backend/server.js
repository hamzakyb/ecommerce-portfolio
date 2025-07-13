const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const mainRoute = require("./routes/index.js");
const http = require("http");
const { Server } = require("socket.io");

// dotenv'i en başta yapılandırın
dotenv.config();

const port = process.env.PORT || 5001;

// HTTP sunucusu oluştur
const server = http.createServer(app);

// CORS options
const corsOptions = {
  origin: ['https://ecommerce-portfolio-hazel.vercel.app/', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Request-ID'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400
};

// Socket.io sunucusu oluştur
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  allowEIO3: true
});

// Global io nesnesini oluştur
global.io = io;

const connect = async () => {
    try {
        // MongoDB bağlantı seçeneklerini ekle
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        // MONGODB_URI kontrolü
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI çevre değişkeni tanımlanmamış!");
        }

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log("MongoDB bağlantısı başarılı.");
    } catch (error) {
        console.error("MongoDB bağlantı hatası:", error.message);
        // Uygulama başlatılamadığında process'i sonlandır
        process.exit(1);
    }
}

//middlewares
app.use(logger("dev"));
app.use(express.json());

// CORS middleware'ini sadeleştir
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ana route'ları kullan
app.use("/api", mainRoute);

const Product = require('./models/Product');

// MongoDB bağlantısı başarılı olduğunda index oluştur
mongoose.connection.once('open', () => {
    Product.collection.createIndex({ name: "text", description: "text" }, (err, result) => {
        if (err) {
            console.error("Index oluşturulurken hata oluştu:", err);
        } else {
            console.log("Text index başarıyla oluşturuldu:", result);
        }
    });
});

// Route test endpoint'i
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Socket.io bağlantı işleyicisi
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);
  
  // Kullanıcı kimlik doğrulama
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Kullanıcı ${userId} kimliği doğrulandı`);
    }
  });
  
  // Bağlantı kesildiğinde
  socket.on('disconnect', () => {
    console.log('Kullanıcı bağlantısı kesildi:', socket.id);
  });
});

// MongoDB bağlantı olaylarını dinle
mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB bağlantısı yeniden kuruldu');
});

// HTTP sunucusunu dinle
server.listen(port, () => {
    connect();
    console.log(`Sunucu ${port} portunda çalışıyor.. `);
});

