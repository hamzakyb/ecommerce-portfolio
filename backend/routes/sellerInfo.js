const express = require('express');
const router = express.Router();
const SellerInfo = require('../models/SellerInfo');

// Satıcı bilgilerini getir
router.get('/', async (req, res) => {
  try {
    const sellerInfo = await SellerInfo.getSellerInfo();
    
    if (!sellerInfo) {
      return res.status(404).json({ message: 'Satıcı bilgisi bulunamadı' });
    }
    
    res.status(200).json(sellerInfo);
  } catch (error) {
    console.error('Satıcı bilgisi getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Satıcı bilgilerini güncelle veya oluştur
router.post('/', async (req, res) => {
  try {
    const {
      companyName,
      taxOffice,
      taxNumber,
      address,
      cityRegion,
      phone,
      vatRate,
      bankName,
      bankBranch,
      iban
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!companyName || !taxOffice || !taxNumber || !address || !cityRegion || !phone) {
      return res.status(400).json({ message: 'Tüm zorunlu alanları doldurun' });
    }
    
    // Mevcut satıcı bilgisini bul
    let sellerInfo = await SellerInfo.getSellerInfo();
    
    if (sellerInfo) {
      // Mevcut bilgileri güncelle
      sellerInfo.companyName = companyName;
      sellerInfo.taxOffice = taxOffice;
      sellerInfo.taxNumber = taxNumber;
      sellerInfo.address = address;
      sellerInfo.cityRegion = cityRegion;
      sellerInfo.phone = phone;
      sellerInfo.vatRate = vatRate || 18;
      sellerInfo.bankName = bankName || '';
      sellerInfo.bankBranch = bankBranch || '';
      sellerInfo.iban = iban || '';
      
      await sellerInfo.save();
      res.status(200).json(sellerInfo);
    } else {
      // Yeni satıcı bilgisi oluştur
      const newSellerInfo = new SellerInfo({
        companyName,
        taxOffice,
        taxNumber,
        address,
        cityRegion,
        phone,
        vatRate: vatRate || 18,
        bankName: bankName || '',
        bankBranch: bankBranch || '',
        iban: iban || ''
      });
      
      await newSellerInfo.save();
      res.status(201).json(newSellerInfo);
    }
  } catch (error) {
    console.error('Satıcı bilgisi güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 