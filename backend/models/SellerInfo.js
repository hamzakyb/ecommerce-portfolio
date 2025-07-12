const mongoose = require('mongoose');

const sellerInfoSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  taxOffice: {
    type: String,
    required: true
  },
  taxNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  cityRegion: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  vatRate: {
    type: Number,
    default: 18
  },
  bankName: {
    type: String,
    default: ""
  },
  bankBranch: {
    type: String,
    default: ""
  },
  iban: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Sadece bir tane satıcı bilgisi olacağı için, her zaman ilk kaydı döndüren statik metod
sellerInfoSchema.statics.getSellerInfo = async function() {
  const sellerInfo = await this.findOne({}).sort({ createdAt: 1 });
  return sellerInfo;
};

module.exports = mongoose.model('SellerInfo', sellerInfoSchema); 