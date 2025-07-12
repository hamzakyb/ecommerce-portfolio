const Notification = require('../models/Notification');
const User = require('../models/User');

// Bildirim oluşturma fonksiyonu
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error);
    throw error;
  }
};

// Sipariş bildirimi oluşturma
const createOrderNotification = async (order, io) => {
  try {
    // Admin kullanıcılarını bul
    const adminUsers = await User.find({ role: 'admin' });
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('Bildirim gönderilecek admin kullanıcısı bulunamadı');
      return;
    }
    
    // Sipariş içeriğini hazırla
    let orderContent = '';
    if (order.items && order.items.length > 0) {
      // İlk ürünün adını al
      const firstItem = order.items[0];
      
      if (order.items.length === 1) {
        orderContent = `${firstItem.name}`;
      } else {
        orderContent = `${firstItem.name} ve ${order.items.length - 1} diğer ürün`;
      }
    } else {
      orderContent = "Yeni sipariş";
    }
    
    // Her admin için bildirim oluştur
    for (const admin of adminUsers) {
      const notification = await createNotification({
        title: 'Yeni Sipariş',
        message: `Yeni bir sipariş alındı: ${orderContent}`,
        type: 'order',
        recipient: admin._id,
        relatedId: order._id,
        onModel: 'Order',
        link: `/admin/orders/${order._id}`
      });
      
      // WebSocket ile bildirimi gönder
      if (io) {
        io.to(`user_${admin._id}`).emit('notification', notification);
      }
    }
    
    console.log('Sipariş bildirimi başarıyla oluşturuldu');
  } catch (error) {
    console.error('Sipariş bildirimi oluşturulurken hata:', error);
  }
};

// Kullanıcı bildirimi oluşturma
const createUserNotification = async (user, io) => {
  try {
    // Admin kullanıcılarını bul
    const adminUsers = await User.find({ role: 'admin' });
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('Bildirim gönderilecek admin kullanıcısı bulunamadı');
      return;
    }
    
    // Her admin için bildirim oluştur
    for (const admin of adminUsers) {
      const notification = await createNotification({
        title: 'Yeni Kullanıcı',
        message: `Yeni bir kullanıcı kaydoldu: ${user.username || user.email}`,
        type: 'user',
        recipient: admin._id,
        relatedId: user._id,
        onModel: 'User',
        link: `/admin/users`
      });
      
      // WebSocket ile bildirimi gönder
      if (io) {
        io.to(`user_${admin._id}`).emit('notification', notification);
      }
    }
    
    console.log('Kullanıcı bildirimi başarıyla oluşturuldu');
  } catch (error) {
    console.error('Kullanıcı bildirimi oluşturulurken hata:', error);
  }
};

// Stok bildirimi oluşturma
const createStockNotification = async (product, io) => {
  try {
    // Admin kullanıcılarını bul
    const adminUsers = await User.find({ role: 'admin' });
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('Bildirim gönderilecek admin kullanıcısı bulunamadı');
      return;
    }
    
    // Her admin için bildirim oluştur
    for (const admin of adminUsers) {
      const notification = await createNotification({
        title: 'Stok Uyarısı',
        message: `Ürün stoku azalıyor: ${product.name} (${product.quantity} adet kaldı)`,
        type: 'product',
        recipient: admin._id,
        relatedId: product._id,
        onModel: 'Product',
        link: `/admin/products/${product._id}`
      });
      
      // WebSocket ile bildirimi gönder
      if (io) {
        io.to(`user_${admin._id}`).emit('notification', notification);
      }
    }
    
    console.log('Stok bildirimi başarıyla oluşturuldu');
  } catch (error) {
    console.error('Stok bildirimi oluşturulurken hata:', error);
  }
};

module.exports = {
  createNotification,
  createOrderNotification,
  createUserNotification,
  createStockNotification
}; 