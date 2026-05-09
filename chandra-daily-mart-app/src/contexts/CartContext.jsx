import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  async function fetchCart() {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    setCartItems(data || []);
  }

  async function addToCart(product) {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    const existing = cartItems.find(i => i.product_id === product.id);
    if (existing) {
      await updateQty(existing.id, existing.quantity + 1);
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: product.id, quantity: 1 })
        .select('*, products(*)')
        .single();
      if (!error && data) setCartItems(prev => [...prev, data]);
    }
  }

  async function updateQty(cartItemId, qty) {
    if (qty <= 0) return removeFromCart(cartItemId);
    const { error } = await supabase.from('cart_items').update({ quantity: qty }).eq('id', cartItemId);
    if (!error) setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: qty } : i));
  }

  async function removeFromCart(cartItemId) {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  }

  async function clearCart() {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setCartItems([]);
  }

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + (i.products?.price * i.quantity), 0);
  const getQty = (productId) => cartItems.find(i => i.product_id === productId)?.quantity || 0;
  const getCartItem = (productId) => cartItems.find(i => i.product_id === productId);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, totalItems, totalPrice, getQty, getCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
