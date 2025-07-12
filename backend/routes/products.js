const express = require("express");
const router = express.Router();
const Product = require("../models/Product.js");

// Yeni bir ürün oluşturma (Create)
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ürün oluşturulurken bir hata oluştu." });
  }
});

//Tüm ürünleri getirme (Read- All)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error("Ürün getirme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

/// Belirli bir ürünü getirme (Read - Single)
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('similarProducts');

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

//Ürün güncelleme (Update)
router.put("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Benzer ürünler dizisini kontrol et
    if (updates.similarProducts) {
      // Kendisini benzer ürün olarak eklemeyi engelle
      updates.similarProducts = updates.similarProducts.filter(id => id !== productId);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    ).populate('similarProducts');

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Ürün silme (Delete)
router.delete("/:productId", async (req, res) => {
    try {
      const productId = req.params.productId;
  
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found." });
      }
  
      res.status(200).json(deletedProduct);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error." });
    }
  });

// Ürün arama endpoint'i (query parametresi ile)
router.get("/search", (req, res) => {
  const searchTerm = req.query.q; // Arama terimini sorgu parametresinden al
  Product.find({
      $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } }
      ]
  })
  .then(products => res.json(products))
  .catch(err => res.status(500).json({ error: err.message }));
});

// Ürün arama endpoint'i (path parametresi ile - frontend'in kullandığı format)
router.get("/search/:searchTerm", async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    
    // Arama terimi boşsa tüm ürünleri getir
    if (!searchTerm || searchTerm.trim().length === 0) {
      const products = await Product.find({}).limit(20).sort({ name: 1 });
      return res.status(200).json(products);
    }
    
    // Ana arama sorgusu - isim ve açıklamada ara
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } }
      ]
    }).limit(20).sort({ name: 1 });
    
    // Benzer ürünlerde arama yapmak için tüm ürünleri getir
    const allProducts = await Product.find({}).populate('similarProducts');
    
    // Benzer ürünlerde eşleşme olan ürünleri bul
    const productsWithMatchingSimilarProducts = allProducts.filter(product => {
      if (!product.similarProducts || product.similarProducts.length === 0) {
        return false;
      }
      
      // Benzer ürünlerde arama terimini ara
      return product.similarProducts.some(similarProduct => {
        if (!similarProduct) return false;
        
        const nameMatch = similarProduct.name && 
          similarProduct.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const descriptionMatch = similarProduct.description && 
          similarProduct.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return nameMatch || descriptionMatch;
      });
    });
    
    // Sonuçları birleştir ve tekrarları kaldır
    const combinedResults = [...products];
    
    productsWithMatchingSimilarProducts.forEach(product => {
      if (!combinedResults.some(p => p._id.toString() === product._id.toString())) {
        combinedResults.push(product);
      }
    });
    
    res.status(200).json(combinedResults);
  } catch (error) {
    console.error("Arama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Ürün stok miktarını güncelleme (Update Stock)
router.patch("/:productId/stock", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: "Miktar (quantity) parametresi gereklidir." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı." });
    }

    // Stok miktarını güncelle
    const newStock = product.stock - quantity;
    
    // Stok miktarı negatif olamaz
    if (newStock < 0) {
      return res.status(400).json({ error: "Yetersiz stok miktarı." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

module.exports = router;
