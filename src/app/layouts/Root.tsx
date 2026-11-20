import { Outlet, useLocation } from "react-router";
import { CartProvider } from "../context/CartContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { ChatWidget } from "../components/ChatWidget";
import { Toaster } from "../components/ui/sonner";

export function Root() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin/");
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        {!isAdminPage && <ChatWidget />}
        <Toaster position="bottom-right" />
      </div>
    </CartProvider>
  );
}
