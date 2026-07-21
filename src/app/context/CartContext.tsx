import React, { createContext, useContext, useReducer } from "react";
import type { Product } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  giftWrap: boolean;
  message?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: string | null;
  discount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "TOGGLE_GIFT_WRAP"; productId: string }
  | { type: "SET_MESSAGE"; productId: string; message: string }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "APPLY_COUPON"; code: string }
  | { type: "REMOVE_COUPON" }
  | { type: "CLEAR_CART" };

const coupons: Record<string, number> = {
  WELCOME10: 10,
  SWEET20: 20,
  LUXURY15: 15,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity ?? 1, giftWrap: false }],
        isOpen: true,
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "TOGGLE_GIFT_WRAP":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, giftWrap: !i.giftWrap } : i
        ),
      };
    case "SET_MESSAGE":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, message: action.message } : i
        ),
      };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "APPLY_COUPON": {
      const discount = coupons[action.code.toUpperCase()] ?? 0;
      return { ...state, coupon: discount > 0 ? action.code.toUpperCase() : null, discount };
    }
    case "REMOVE_COUPON":
      return { ...state, coupon: null, discount: 0 };
    case "CLEAR_CART":
      return { ...state, items: [], coupon: null, discount: 0 };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  shipping: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    coupon: null,
    discount: 0,
  });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmount = Math.round((subtotal * state.discount) / 100);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discountAmount + shipping;

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, subtotal, discountAmount, total, shipping }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
