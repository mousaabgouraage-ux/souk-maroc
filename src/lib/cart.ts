import { useEffect } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  slug: string;
}

const CART_KEY = "suma_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity: number = 1
) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  saveCart(cart);
  window.dispatchEvent(new CustomEvent("cart-updated"));
  return cart;
}

export function removeFromCart(id: number) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  window.dispatchEvent(new CustomEvent("cart-updated"));
  return cart;
}

export function updateQuantity(id: number, quantity: number) {
  const cart = getCart().map((i) =>
    i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  saveCart(cart);
  window.dispatchEvent(new CustomEvent("cart-updated"));
  return cart;
}

export function clearCart() {
  saveCart([]);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}