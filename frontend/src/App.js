import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrderPage from './pages/Admin/OrderPage';
import CartTotals from './components/Cart/CartTotals';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Success from './pages/Success';
import './App.css';
import 'antd/dist/antd.css';
import Orders from './pages/Orders/Orders';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/orders" element={<OrderPage />} />
        <Route path="/cart" element={<CartTotals />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/success" element={<Success />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
};

export default App; 