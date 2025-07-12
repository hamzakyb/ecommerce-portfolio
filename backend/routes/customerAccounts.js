const express = require("express");
const router = express.Router();
const CustomerAccount = require("../models/CustomerAccount");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

// Admin kontrolü middleware'i
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Bu işlem için yetkiniz yok" });
  }
  next();
};

// Tüm müşteri hesaplarını getir (sadece admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const accounts = await CustomerAccount.find().populate("userId", "username email phone");
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Müşteri hesapları getirme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Belirli bir müşterinin hesap bilgilerini getir
router.get("/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Kullanıcının hesap bilgilerini getir
    let account = await CustomerAccount.findOne({ userId });
    
    // Hesap yoksa boş bir hesap döndür
    if (!account) {
      account = {
        userId,
        totalDebt: 0,
        totalPaid: 0,
        remainingDebt: 0,
        paymentRecords: [],
        status: "Aktif"
      };
    }
    
    res.status(200).json(account);
  } catch (error) {
    console.error("Müşteri hesabı getirme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Yeni müşteri hesabı oluştur veya güncelle
router.post("/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      totalDebt,
      totalPaid,
      paymentDueDate,
      paymentPromiseDate,
      creditLimit,
      notes,
      status
    } = req.body;
    
    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Hesabı bul veya oluştur
    let account = await CustomerAccount.findOne({ userId });
    
    if (account) {
      // Mevcut hesabı güncelle
      account.totalDebt = totalDebt !== undefined ? totalDebt : account.totalDebt;
      account.totalPaid = totalPaid !== undefined ? totalPaid : account.totalPaid;
      account.paymentDueDate = paymentDueDate || account.paymentDueDate;
      account.paymentPromiseDate = paymentPromiseDate || account.paymentPromiseDate;
      account.creditLimit = creditLimit !== undefined ? creditLimit : account.creditLimit;
      account.notes = notes !== undefined ? notes : account.notes;
      account.status = status || account.status;
      
      // Kalan borç otomatik hesaplanacak (pre-save hook)
      await account.save();
    } else {
      // Yeni hesap oluştur
      account = new CustomerAccount({
        userId,
        totalDebt: totalDebt || 0,
        totalPaid: totalPaid || 0,
        paymentDueDate,
        paymentPromiseDate,
        creditLimit: creditLimit || 0,
        notes,
        status: status || "Aktif"
      });
      
      await account.save();
    }
    
    res.status(200).json(account);
  } catch (error) {
    console.error("Müşteri hesabı oluşturma/güncelleme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Ödeme kaydı ekle
router.post("/:userId/payments", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, date, method, notes, receiptNumber } = req.body;
    
    if (!amount || !date || !method) {
      return res.status(400).json({ error: "Ödeme miktarı, tarihi ve yöntemi gereklidir" });
    }
    
    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Hesabı bul veya oluştur
    let account = await CustomerAccount.findOne({ userId });
    
    if (!account) {
      // Yeni hesap oluştur
      account = new CustomerAccount({
        userId,
        totalDebt: 0,
        totalPaid: 0,
        status: "Aktif"
      });
    }
    
    // Yeni ödeme kaydı ekle
    const newPayment = {
      amount: Number(amount),
      date: new Date(date),
      method,
      notes,
      receiptNumber
    };
    
    account.paymentRecords.push(newPayment);
    
    // Toplam ödenen miktarı güncelle
    account.totalPaid += Number(amount);
    
    // Kalan borç otomatik hesaplanacak (pre-save hook)
    await account.save();
    
    res.status(200).json(account);
  } catch (error) {
    console.error("Ödeme kaydı ekleme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Ödeme kaydı güncelle
router.put("/:userId/payments/:paymentId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, paymentId } = req.params;
    const { amount, date, method, notes, receiptNumber } = req.body;
    
    // Hesabı bul
    const account = await CustomerAccount.findOne({ userId });
    
    if (!account) {
      return res.status(404).json({ error: "Müşteri hesabı bulunamadı" });
    }
    
    // Ödeme kaydını bul
    const paymentIndex = account.paymentRecords.findIndex(p => p._id.toString() === paymentId);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ error: "Ödeme kaydı bulunamadı" });
    }
    
    // Eski ödeme miktarını kaydet
    const oldAmount = account.paymentRecords[paymentIndex].amount;
    
    // Ödeme kaydını güncelle
    if (amount !== undefined) account.paymentRecords[paymentIndex].amount = Number(amount);
    if (date) account.paymentRecords[paymentIndex].date = new Date(date);
    if (method) account.paymentRecords[paymentIndex].method = method;
    if (notes !== undefined) account.paymentRecords[paymentIndex].notes = notes;
    if (receiptNumber !== undefined) account.paymentRecords[paymentIndex].receiptNumber = receiptNumber;
    
    // Toplam ödenen miktarı güncelle
    if (amount !== undefined) {
      account.totalPaid = account.totalPaid - oldAmount + Number(amount);
    }
    
    // Kalan borç otomatik hesaplanacak (pre-save hook)
    await account.save();
    
    res.status(200).json(account);
  } catch (error) {
    console.error("Ödeme kaydı güncelleme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Ödeme kaydı sil
router.delete("/:userId/payments/:paymentId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, paymentId } = req.params;
    
    // Hesabı bul
    const account = await CustomerAccount.findOne({ userId });
    
    if (!account) {
      return res.status(404).json({ error: "Müşteri hesabı bulunamadı" });
    }
    
    // Ödeme kaydını bul
    const paymentIndex = account.paymentRecords.findIndex(p => p._id.toString() === paymentId);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ error: "Ödeme kaydı bulunamadı" });
    }
    
    // Silinecek ödeme miktarını kaydet
    const deletedAmount = account.paymentRecords[paymentIndex].amount;
    
    // Ödeme kaydını sil
    account.paymentRecords.splice(paymentIndex, 1);
    
    // Toplam ödenen miktarı güncelle
    account.totalPaid -= deletedAmount;
    
    // Kalan borç otomatik hesaplanacak (pre-save hook)
    await account.save();
    
    res.status(200).json(account);
  } catch (error) {
    console.error("Ödeme kaydı silme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router; 