import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  
  // Eğer yükleme devam ediyorsa, yükleme göster
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  // Eğer kullanıcı giriş yapmamışsa veya admin değilse, ana sayfaya yönlendir
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Kullanıcı admin ise, alt rotaları göster
  return <Outlet />;
};

export default AdminRoute; 