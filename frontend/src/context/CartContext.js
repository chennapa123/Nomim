import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agrimart_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('agrimart_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(item => item.product._id === product._id);
      if (exists) {
        return prev.map(item => item.product._id === product._id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.availableQuantity) }
          : item
        );
      }
      return [...prev, { product, quantity, farmerId: product.farmer._id || product.farmer }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.product._id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.product._id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Group cart by farmer
  const cartByFarmer = cart.reduce((groups, item) => {
    const farmerId = item.farmerId;
    if (!groups[farmerId]) groups[farmerId] = [];
    groups[farmerId].push(item);
    return groups;
  }, {});

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount, cartByFarmer }}>
      {children}
    </CartContext.Provider>
  );
};
