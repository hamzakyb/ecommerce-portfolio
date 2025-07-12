const express = require("express");
const router = express.Router();

// Diğer rota dosyalarını içe aktarıyoruz.
const categoryRoute = require("./categories.js");
const authRoute = require("./auth.js");
const productRoute = require("./products.js");
const couponRoute = require("./coupons.js");
const userRoute = require("./users.js");
const orderRoute = require("./orders.js");
const statisticsRoute = require("./statistics.js");
const customerAccountsRoute = require("./customerAccounts.js");
const notificationsRoute = require("./notifications.js");

// Her rotayı ilgili yol altında kullanıyoruz
router.use("/categories", categoryRoute);
router.use("/auth", authRoute);  // auth route'unu doğru şekilde bağlıyoruz
router.use("/products", productRoute);
router.use("/coupons", couponRoute);
router.use("/users", userRoute);
router.use("/orders", orderRoute);
router.use("/statistics", statisticsRoute);
router.use("/customer-accounts", customerAccountsRoute);
router.use("/notifications", notificationsRoute);

module.exports = router;