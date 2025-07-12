const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Yetkilendirme hatası" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Yetkilendirme hatası" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Bu işlem için admin yetkisi gerekiyor" });
  }
};

module.exports = { authenticateToken, isAdmin }; 