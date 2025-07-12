const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  cargoFee: { type: Number, required: true },
  coupon: {
    code: { type: String },
    discountPercent: { type: Number },
    discountAmount: { type: Number }
  },
  status: { 
    type: String, 
    default: "Beklemede",
    enum: ["Beklemede", "Onaylandı", "Kargoya Verildi", "Tamamlandı", "İptal Edildi"]
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);