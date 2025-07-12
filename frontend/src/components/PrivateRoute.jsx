import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  
  // Eğer yükleme devam ediyorsa, yükleme göster
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  // Eğer kullanıcı giriş yapmamışsa, auth sayfasına yönlendir
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Kullanıcı giriş yapmışsa, alt rotaları göster
  return <Outlet />;
};

export default PrivateRoute; 