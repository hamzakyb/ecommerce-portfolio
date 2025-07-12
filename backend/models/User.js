const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    companyName: { type: String },
    taxNumber: { type: String },
    taxOffice: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;