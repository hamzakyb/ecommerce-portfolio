const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Tüm bildirimleri getir (sadece admin)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('recipient', 'username email')
      .exec();
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Bildirimler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirimler getirilirken bir hata oluştu' });
  }
});

// Kullanıcının bildirimlerini getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Bildirimler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirimler getirilirken bir hata oluştu' });
  }
});

// Okunmamış bildirim sayısını getir
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({ 
      recipient: userId,
      read: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Okunmamış bildirim sayısı getirilirken bir hata oluştu' });
  }
});

// Bildirimi okundu olarak işaretle
router.patch('/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    // Kullanıcı sadece kendi bildirimlerini işaretleyebilir
    if (notification.recipient.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({ message: 'Bildirim okundu olarak işaretlendi', notification });
  } catch (error) {
    console.error('Bildirim işaretlenirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirim işaretlenirken bir hata oluştu' });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ 
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bildirimler işaretlenirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirimler işaretlenirken bir hata oluştu' });
  }
});

// Bildirimi sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    // Kullanıcı sadece kendi bildirimlerini silebilir
    if (notification.recipient.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({ message: 'Bildirim silindi' });
  } catch (error) {
    console.error('Bildirim silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirim silinirken bir hata oluştu' });
  }
});

// Tüm bildirimleri sil
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await Notification.deleteMany({ recipient: userId });
    
    res.status(200).json({ 
      message: 'Tüm bildirimler silindi',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bildirimler silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Bildirimler silinirken bir hata oluştu' });
  }
});

module.exports = router; 