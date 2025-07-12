const mongoose = require("mongoose");

// Ödeme kaydı şeması
const PaymentRecordSchema = mongoose.Schema(
  {
    amount: { type: Number, required: true }, // Ödeme miktarı
    date: { type: Date, required: true }, // Ödeme tarihi
    method: { type: String, enum: ["Kredi Kartı", "Nakit", "Havale/EFT", "Çek", "Diğer"], required: true }, // Ödeme yöntemi
    notes: { type: String }, // Ödeme ile ilgili notlar
    receiptNumber: { type: String }, // Makbuz/Fiş numarası
  },
  { timestamps: true }
);

// Müşteri hesap şeması
const CustomerAccountSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Müşteri ID'si
    totalDebt: { type: Number, default: 0 }, // Toplam borç
    totalPaid: { type: Number, default: 0 }, // Toplam ödenen
    remainingDebt: { type: Number, default: 0 }, // Kalan borç
    paymentDueDate: { type: Date }, // Ödeme vade tarihi
    paymentPromiseDate: { type: Date }, // Söz verilen ödeme tarihi
    creditLimit: { type: Number, default: 0 }, // Kredi limiti
    paymentRecords: [PaymentRecordSchema], // Ödeme kayıtları
    notes: { type: String }, // Genel notlar
    status: { type: String, enum: ["Aktif", "Kapalı", "Beklemede"], default: "Aktif" }, // Hesap durumu
  },
  { timestamps: true }
);

// Kalan borç hesaplama
CustomerAccountSchema.pre('save', function(next) {
  this.remainingDebt = this.totalDebt - this.totalPaid;
  next();
});

const CustomerAccount = mongoose.model("CustomerAccount", CustomerAccountSchema);
module.exports = CustomerAccount; 