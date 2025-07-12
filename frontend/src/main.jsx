import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CartProvider from "./context/CartProvider.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import App from "./App.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";
import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ScrollToTop />
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
