import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, cartByFarmer, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryType: 'vendor_pickup',
    paymentMethod: 'cod',
    vendorNotes: '',
    deliveryAddress: { address: '', city: '', state: '', pincode: '' }
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setAddr = (key, value) => setForm(f => ({ ...f, deliveryAddress: { ...f.deliveryAddress, [key]: value } }));

  const handlePlaceOrders = async () => {
    if (!Object.keys(cartByFarmer).length) return;
    setLoading(true);
    try {
      const promises = Object.entries(cartByFarmer).map(([farmerId, items]) =>
        createOrder({
          farmerId,
          items: items.map(i => ({ productId: i.product._id, quantity: i.quantity })),
          deliveryType: form.deliveryType,
          paymentMethod: form.paymentMethod,
          vendorNotes: form.vendorNotes,
          deliveryAddress: form.deliveryType === 'shipping' ? form.deliveryAddress : undefined
        })
      );
      await Promise.all(promises);
      clearCart();
      toast.success('Orders placed successfully! Farmers have been notified.');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page container fade-in">
      <h1>Checkout</h1>
      <div className="co-grid">
        {/* Left */}
        <div className="co-left">
          {/* Delivery */}
          <div className="co-section">
            <h3>Delivery Method</h3>
            <div className="co-options">
              {[
                { value: 'vendor_pickup', label: '🚗 Pickup from Farm', desc: 'You collect from the farmer directly' },
                { value: 'farmer_delivery', label: '🚚 Farmer Delivers', desc: 'Farmer brings produce to your location' },
                { value: 'shipping', label: '📦 Ship to Address', desc: 'Courier delivery to your address' },
              ].map(opt => (
                <label key={opt.value} className={`co-option ${form.deliveryType === opt.value ? 'selected' : ''}`}>
                  <input type="radio" value={opt.value} checked={form.deliveryType === opt.value} onChange={e => set('deliveryType', e.target.value)} hidden />
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </label>
              ))}
            </div>

            {form.deliveryType === 'shipping' && (
              <div className="co-address-form">
                <h4>Delivery Address</h4>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input className="form-input" placeholder="House/Flat, Street" value={form.deliveryAddress.address} onChange={e => setAddr('address', e.target.value)} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="City" value={form.deliveryAddress.city} onChange={e => setAddr('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder="State" value={form.deliveryAddress.state} onChange={e => setAddr('state', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" placeholder="6-digit pincode" maxLength={6} value={form.deliveryAddress.pincode} onChange={e => setAddr('pincode', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="co-section">
            <h3>Payment Method</h3>
            <div className="co-options co-payment-options">
              {[
                { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when you receive' },
                { value: 'upi', label: '📱 UPI', desc: 'GPay, PhonePe, Paytm, etc.' },
                { value: 'bank_transfer', label: '🏦 Bank Transfer', desc: 'NEFT / IMPS to farmer' },
                { value: 'online', label: '💳 Online Payment', desc: 'Debit/Credit Card' },
              ].map(opt => (
                <label key={opt.value} className={`co-option ${form.paymentMethod === opt.value ? 'selected' : ''}`}>
                  <input type="radio" value={opt.value} checked={form.paymentMethod === opt.value} onChange={e => set('paymentMethod', e.target.value)} hidden />
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="co-section">
            <h3>Special Instructions (Optional)</h3>
            <textarea className="form-input co-notes" rows={3} placeholder="Any special requests for the farmers..."
              value={form.vendorNotes} onChange={e => set('vendorNotes', e.target.value)} />
          </div>
        </div>

        {/* Right: Summary */}
        <div className="co-right">
          <div className="co-summary">
            <h3>Order Summary</h3>
            {Object.entries(cartByFarmer).map(([farmerId, items]) => {
              const farmer = items[0]?.product?.farmer;
              const farmerTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
              return (
                <div key={farmerId} className="co-farmer-order">
                  <div className="co-farmer-header">
                    <span>🧑‍🌾 {farmer?.farmName || farmer?.name}</span>
                    <span>₹{farmerTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {items.map(({ product, quantity }) => (
                    <div key={product._id} className="co-item-row">
                      <span>{product.name} × {quantity} {product.unit}</span>
                      <span>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            <div className="co-total-row"><span>Platform Fee</span><span style={{color:'var(--green-600)'}}>₹0</span></div>
            <div className="co-grand-total"><span>Grand Total</span><strong>₹{totalAmount.toLocaleString('en-IN')}</strong></div>

            <div className="co-farmer-count">
              📦 {Object.keys(cartByFarmer).length} separate order{Object.keys(cartByFarmer).length > 1 ? 's' : ''} will be placed (one per farmer)
            </div>

            <button className="btn btn-primary btn-lg co-place-btn" onClick={handlePlaceOrders} disabled={loading}>
              {loading ? '⏳ Placing Orders...' : `✅ Place ${Object.keys(cartByFarmer).length > 1 ? Object.keys(cartByFarmer).length + ' Orders' : 'Order'} — ₹${totalAmount.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
