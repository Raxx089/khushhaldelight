import { createBrowserRouter } from "react-router";
import { Root } from "./layouts/Root";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { CustomNameBar } from "./pages/CustomNameBar";
import { CartPage } from "./pages/CartPage";
import { Checkout } from "./pages/Checkout";
import { GiftBoxes } from "./pages/GiftBoxes";
import { Corporate } from "./pages/Corporate";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Account } from "./pages/Account";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { NotFound } from "./pages/NotFound";
import { AdminChat } from "./pages/AdminChat";
import { AdminOrders } from "./pages/AdminOrders";
import { Tracking } from "./pages/Tracking";
import { OrderHistory } from "./pages/OrderHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "custom-name-bar", Component: CustomNameBar },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: Checkout },
      { path: "tracking/:orderId", Component: Tracking },
      { path: "orders", Component: OrderHistory },
      { path: "gift-boxes", Component: GiftBoxes },
      { path: "corporate", Component: Corporate },
      { path: "corporate-gifting", Component: Corporate },
      { path: "about", Component: About },
      { path: "login", Component: Login },
      { path: "account", Component: Account },
      { path: "blog", Component: Blog },
      { path: "contact", Component: Contact },
      { path: "admin/chat", Component: AdminChat },
      { path: "admin/orders", Component: AdminOrders },
      { path: "*", Component: NotFound },
    ],
  },
]);
