import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Paneli</h2>
      <ul className="sidebar-menu">
        <li><Link to="/admin/users">Kullanıcılar</Link></li>
        <li><Link to="/admin/categories">Kategoriler</Link></li>
        <li><Link to="/admin/products">Ürünler</Link></li>
        <li><Link to="/admin/orders">Siparişler</Link></li>
        <li><Link to="/admin/coupons">Kuponlar</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar; 