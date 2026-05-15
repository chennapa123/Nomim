import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&q=60';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalAmount, totalItems, cartByFarmer } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="cart-page container fade-in">
      <div className="empty-state" style={{paddingTop: 60}}>
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse fresh produce from farmers and start adding items!</p>
        <Link to="/products" className="btn btn-primary" style={{marginTop: 20}}>Browse Marketplace</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page container fade-in">
      <h1>My Cart <span className="cart-count-badge">({totalItems} items)</span></h1>

      <div className="cart-grid">
        <div className="cart-items">
          {Object.entries(cartByFarmer).map(([farmerId, items]) => {
            const farmer = items[0]?.product?.farmer;
            const farmerTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
            return (
              <div key={farmerId} className="cart-farmer-group">
                <div className="cfg-header">
                  <div className="cfg-farmer">
                    <div className="cfg-avatar">{farmer?.name?.[0]?.toUpperCase() || 'F'}</div>
                    <div>
                      <div className="cfg-name">{farmer?.farmName || farmer?.name || 'Farmer'}</div>
                      <div className="cfg-loc">📍 {farmer?.farmLocation?.city || 'India'}</div>
                    </div>
                  </div>
                  <div className="cfg-subtotal">Subtotal: <strong>₹{farmerTotal.toLocaleString('en-IN')}</strong></div>
                </div>
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="cart-item">
                    <img className="ci-img" src={product.images?.[0]?.url || PLACEHOLDER} alt={product.name}
                      onError={e => e.target.src = PLACEHOLDER} />
                    <div className="ci-info">
                      <Link to={`/products/${product._id}`} className="ci-name">{product.name}</Link>
                      <div className="ci-meta">
                        {product.isOrganic && <span className="badge badge-green ci-organic">🌿 Organic</span>}
                        <span className="ci-category badge badge-earth">{product.category}</span>
                      </div>
                      <div className="ci-price-unit">₹{product.price} per {product.unit}</div>
                    </div>
                    <div className="ci-qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(product._id, quantity - 1)}>−</button>
                      <span className="qty-val">{quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(product._id, Math.min(product.availableQuantity, quantity + 1))}>+</button>
                    </div>
                    <div className="ci-line-total">
                      <div className="ci-total">₹{(product.price * quantity).toLocaleString('en-IN')}</div>
                      <div className="ci-unit-info">{quantity} {product.unit}</div>
                    </div>
                    <button className="ci-remove" onClick={() => removeFromCart(product._id)}>✕</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="cs-card">
            <h3>Order Summary</h3>
            <div className="cs-rows">
              <div className="cs-row"><span>Subtotal ({totalItems} items)</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
              <div className="cs-row"><span>Platform Fee</span><span className="cs-free">₹0 (Zero!)</span></div>
              <div className="cs-row cs-total"><span>Total</span><strong>₹{totalAmount.toLocaleString('en-IN')}</strong></div>
            </div>
            <div className="cs-highlight"><span>🌾</span><span>100% goes directly to farmers</span></div>
            <button className="btn btn-primary btn-lg cs-checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
            <Link to="/products" className="btn btn-secondary btn-lg cs-continue-btn">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
