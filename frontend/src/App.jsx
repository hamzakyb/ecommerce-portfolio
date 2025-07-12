import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import MainCategoryPage from "./pages/MainCategoryPage";
import ShopPage from "./pages/ShopPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import CartPage from "./pages/CartPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import UserPage from "./pages/Admin/UserPage";
import "./App.css";
import CreateProductPage from "./pages/Admin/Products/CreateProductPage";
import ProductPage from "./pages/Admin/Products/ProductPage";
import UpdateProductPage from "./pages/Admin/Products/UpdateProductPage";
import Success from "./pages/Success";
import OrderPage from "./pages/Admin/OrderPage";
import DashboardPage from "./pages/Admin/DashboardPage";
import NotificationsPage from "./pages/Admin/NotificationsPage";
import AuthPage from "./pages/Auth/AuthPage";
import ProductDetails from "./pages/ProductDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import CouponPage from "./pages/Admin/Coupons/CouponPage";
import CreateCouponPage from "./pages/Admin/Coupons/CreateCouponPage";
import UpdateCouponPage from "./pages/Admin/Coupons/UpdateCouponPage";
import { ConfigProvider } from './context/ConfigContext';
import { Layout } from "./layouts/Layout";
import CategoryPage from "./pages/Admin/Categories/CategoryPage";
import UpdateCategoryPage from "./pages/Admin/Categories/UpdateCategoryPage";
import CreateCategoryPage from "./pages/Admin/Categories/CreateCategoryPage";

function App() {
  return (
    <ConfigProvider>
      <Layout>
        <Routes>
          {/* Herkese açık rotalar */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Korumalı rotalar */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/maincategory/:categoryId" element={<MainCategoryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/success" element={<Success />} />
          </Route>

          {/* Admin rotaları */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="categories/create" element={<CreateCategoryPage />} />
            <Route path="categories/update/:id" element={<UpdateCategoryPage />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="products/update/:id" element={<UpdateProductPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="coupons" element={<CouponPage />} />
            <Route path="coupons/create" element={<CreateCouponPage />} />
            <Route path="coupons/update/:id" element={<UpdateCouponPage />} />
          </Route>
        </Routes>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
