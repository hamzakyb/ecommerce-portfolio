import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "./AdminLayout";
import MainLayout from "./MainLayout";

export const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Admin sayfasında olup olmadığını kontrol et
  const isAdminPage = location.pathname.startsWith("/admin");
  
  // Admin sayfasında ve kullanıcı admin ise AdminLayout'u göster
  if (isAdminPage && user?.role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Diğer durumlarda MainLayout'u göster
  return <MainLayout>{children}</MainLayout>;
};
