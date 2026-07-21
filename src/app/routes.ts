import { createBrowserRouter } from "react-router";
import { Root } from "./layouts/Root";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: Checkout },
      { path: "gift-boxes", Component: GiftBoxes },
      { path: "corporate", Component: Corporate },
      { path: "about", Component: About },
      { path: "login", Component: Login },
      { path: "account", Component: Account },
      { path: "blog", Component: Blog },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
]);
