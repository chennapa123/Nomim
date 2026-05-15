import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './OrdersPage.css';

const STATUSES = ['pending','accepted','rejected','processing','ready','dispatched','delivered','cancelled'];

const FARMER_ACTIONS = {
  pending: [{ label: '✅ Accept', status: 'accepted', cls: 'btn-primary' }, { label: '❌ Reject', status: 'rejected', cls: 'btn-danger' }],
  accepted: [{ label: '🔄 Start Processing', status: 'processing', cls: 'btn-primary' }],
  processing: [{ label: '📦 Mark Ready', status: 'ready', cls: 'btn-primary' }],
  ready: [{ label: '🚚 Dispatch', status: 'dispatched', cls: 'btn-primary' }],
  dispatched: [{ label: '✅ Mark Delivered', status: 'delivered', cls: 'btn-primary' }],
};
const VENDOR_ACTIONS = {
  pending: [{ label: '❌ Cancel', status: 'cancelled', cls: 'btn-danger' }],
  accepted: [{ label: '❌ Cancel', status: 'cancelled', cls: 'btn-danger' }],
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = activeFilter !== 'all' ? { status: activeFilter } : {};
      const { data } = await getOrders(params);
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { status });
      toast.success(`Order ${status} successfully!`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const actions = user?.role === 'farmer' ? FARMER_ACTIONS : VENDOR_ACTIONS;

  return (
    <div className="orders-page container fade-in">
      <div className="op-header">
        <h1>My Orders</h1>
        <p>{user?.role === 'farmer' ? 'Manage orders from vendors' : 'Track your purchases from farmers'}</p>
      </div>

      {/* Filter tabs */}
      <div className="op-filters">
        <button className={`op-filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
          All
        </button>
        {STATUSES.map(s => (
          <button key={s} className={`op-filter-btn ${activeFilter === s ? 'active' : ''} status-${s}`} onClick={() => setActiveFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders found</h3>
          <p>{activeFilter !== 'all' ? 'No orders with this status.' : user?.role === 'vendor' ? 'Browse our marketplace to place your first order!' : 'Wait for vendors to discover your products.'}</p>
          {user?.role === 'vendor' && <Link to="/products" className="btn btn-primary" style={{marginTop: 16}}>Browse Marketplace</Link>}
        </div>
      ) : (
        <div className="op-orders-list">
          {orders.map(order => (
            <div key={order._id} className="op-order-card">
              <div className="op-order-top">
                <div className="op-order-meta">
                  <span className="op-order-num">{order.orderNumber}</span>
                  <span className={`badge status-${order.status}`}>{order.status}</span>
                  {order.paymentStatus && <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span>}
                </div>
                <div className="op-order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>

              <div className="op-order-parties">
                <div className="op-party">
                  <span className="op-party-label">From Farmer</span>
                  <div className="op-party-info">
                    <div className="op-avatar">{order.farmer?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="op-party-name">{order.farmer?.farmName || order.farmer?.name}</div>
                      <div className="op-party-sub">{order.farmer?.phone}</div>
                    </div>
                  </div>
                </div>
                <div className="op-arrow">→</div>
                <div className="op-party">
                  <span className="op-party-label">To Vendor</span>
                  <div className="op-party-info">
                    <div className="op-avatar op-avatar-blue">{order.vendor?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="op-party-name">{order.vendor?.businessName || order.vendor?.name}</div>
                      <div className="op-party-sub">{order.vendor?.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="op-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="op-item">
                    <span className="op-item-name">{item.product?.name || 'Product'}</span>
                    <span className="op-item-qty">{item.quantity} {item.unit}</span>
                    <span className="op-item-price">₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="op-order-footer">
                <div className="op-total">
                  <span>Total Amount</span>
                  <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="op-delivery-type">
                  <span>🚚 {order.deliveryType?.replace(/_/g, ' ')}</span>
                </div>
                <div className="op-actions">
                  {actions[order.status]?.map(action => (
                    <button key={action.status} className={`btn btn-sm ${action.cls}`}
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusUpdate(order._id, action.status)}>
                      {updatingId === order._id ? '...' : action.label}
                    </button>
                  ))}
                  <Link to={`/orders/${order._id}`} className="btn btn-sm btn-secondary">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
