import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './OrderDetailPage.css';

const FARMER_ACTIONS = {
  pending: [{ label: '✅ Accept Order', status: 'accepted', cls: 'btn-primary' }, { label: '❌ Reject', status: 'rejected', cls: 'btn-danger' }],
  accepted: [{ label: '🔄 Start Processing', status: 'processing', cls: 'btn-primary' }],
  processing: [{ label: '📦 Mark Ready', status: 'ready', cls: 'btn-primary' }],
  ready: [{ label: '🚚 Dispatch Order', status: 'dispatched', cls: 'btn-primary' }],
  dispatched: [{ label: '✅ Mark Delivered', status: 'delivered', cls: 'btn-primary' }],
};
const VENDOR_ACTIONS = {
  pending: [{ label: '❌ Cancel Order', status: 'cancelled', cls: 'btn-danger' }],
  accepted: [{ label: '❌ Cancel Order', status: 'cancelled', cls: 'btn-danger' }],
};

const STEP_ORDER = ['pending', 'accepted', 'processing', 'ready', 'dispatched', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getOrder(id).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, { status });
      toast.success(`Order updated to "${status}"`);
      const { data } = await getOrder(id);
      setOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!order) return <div className="empty-state" style={{ marginTop: 80 }}><h3>Order not found</h3></div>;

  const currentStepIdx = STEP_ORDER.indexOf(order.status);
  const actions = (user?.role === 'farmer' ? FARMER_ACTIONS : VENDOR_ACTIONS)[order.status] || [];

  return (
    <div className="odp container fade-in">
      <div className="odp-breadcrumb">
        <Link to="/orders">Orders</Link> / <span>{order.orderNumber}</span>
      </div>

      <div className="odp-header">
        <div>
          <h1>{order.orderNumber}</h1>
          <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`badge status-${order.status} odp-status-badge`}>{order.status}</span>
      </div>

      {/* Progress tracker */}
      {!['rejected', 'cancelled'].includes(order.status) && (
        <div className="odp-progress">
          {STEP_ORDER.map((step, i) => (
            <div key={step} className={`odp-step ${i <= currentStepIdx ? 'done' : ''} ${i === currentStepIdx ? 'current' : ''}`}>
              <div className="odp-step-circle">
                {i < currentStepIdx ? '✓' : i + 1}
              </div>
              <div className="odp-step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</div>
              {i < STEP_ORDER.length - 1 && <div className={`odp-step-line ${i < currentStepIdx ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
      )}

      {['rejected', 'cancelled'].includes(order.status) && (
        <div className="odp-cancelled-banner">
          ⚠️ This order has been <strong>{order.status}</strong>
        </div>
      )}

      <div className="odp-grid">
        {/* Left: Items + Actions */}
        <div className="odp-left">
          {/* Order Items */}
          <div className="odp-card">
            <h3>Order Items</h3>
            <div className="odp-items">
              {order.items?.map((item, i) => (
                <div key={i} className="odp-item">
                  <div className="odp-item-img">
                    <img src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=60'}
                      alt={item.product?.name} onError={e => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=60'} />
                  </div>
                  <div className="odp-item-info">
                    <Link to={`/products/${item.product?._id}`} className="odp-item-name">{item.product?.name || 'Product'}</Link>
                    <div className="odp-item-cat badge badge-earth">{item.product?.category}</div>
                  </div>
                  <div className="odp-item-meta">
                    <div className="odp-item-qty">{item.quantity} {item.unit}</div>
                    <div className="odp-item-rate">@₹{item.priceAtOrder}/{item.unit}</div>
                  </div>
                  <div className="odp-item-total">₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            <div className="odp-subtotals">
              <div className="odp-subtotal-row"><span>Subtotal</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
              <div className="odp-subtotal-row"><span>Platform Fee</span><span className="text-green">₹0 (Free)</span></div>
              <div className="odp-subtotal-row odp-grand-total"><span>Total</span><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="odp-card odp-actions-card">
              <h3>Update Order Status</h3>
              <div className="odp-action-btns">
                {actions.map(a => (
                  <button key={a.status} className={`btn btn-lg ${a.cls}`} disabled={updating} onClick={() => handleStatusUpdate(a.status)}>
                    {updating ? 'Updating...' : a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="odp-card">
            <h3>Status History</h3>
            <div className="odp-history">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="odp-history-item">
                  <div className={`odp-hist-dot status-${h.status}`} />
                  <div className="odp-hist-body">
                    <div className="odp-hist-status">{h.status}</div>
                    <div className="odp-hist-note">{h.note}</div>
                    <div className="odp-hist-time">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Parties + Delivery */}
        <div className="odp-right">
          {/* Farmer */}
          <div className="odp-card">
            <h3>Farmer</h3>
            <Link to={`/farmers/${order.farmer?._id}`} className="odp-party-block">
              <div className="odp-party-avatar">{order.farmer?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="odp-party-name">{order.farmer?.farmName || order.farmer?.name}</div>
                <div className="odp-party-email">{order.farmer?.email}</div>
                <div className="odp-party-phone">📞 {order.farmer?.phone || 'N/A'}</div>
                <div className="odp-party-loc">📍 {order.farmer?.farmLocation?.city}, {order.farmer?.farmLocation?.state}</div>
              </div>
            </Link>
          </div>

          {/* Vendor */}
          <div className="odp-card">
            <h3>Vendor</h3>
            <div className="odp-party-block">
              <div className="odp-party-avatar odp-vendor-avatar">{order.vendor?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="odp-party-name">{order.vendor?.businessName || order.vendor?.name}</div>
                <div className="odp-party-email">{order.vendor?.email}</div>
                <div className="odp-party-phone">📞 {order.vendor?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="odp-card">
            <h3>Delivery Details</h3>
            <div className="odp-detail-list">
              <div className="odp-detail-item"><span>Type</span><strong style={{textTransform:'capitalize'}}>{order.deliveryType?.replace(/_/g,' ')}</strong></div>
              <div className="odp-detail-item"><span>Payment</span><strong style={{textTransform:'capitalize'}}>{order.paymentMethod}</strong></div>
              <div className="odp-detail-item"><span>Payment Status</span><span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span></div>
              {order.expectedDeliveryDate && <div className="odp-detail-item"><span>Expected Delivery</span><strong>{new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN')}</strong></div>}
              {order.actualDeliveryDate && <div className="odp-detail-item"><span>Delivered On</span><strong>{new Date(order.actualDeliveryDate).toLocaleDateString('en-IN')}</strong></div>}
            </div>
            {order.deliveryAddress?.city && (
              <div className="odp-address">
                <div className="odp-address-label">Delivery Address</div>
                <p>{order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {(order.vendorNotes || order.farmerNotes) && (
            <div className="odp-card">
              <h3>Notes</h3>
              {order.vendorNotes && <div className="odp-note"><strong>Vendor:</strong> {order.vendorNotes}</div>}
              {order.farmerNotes && <div className="odp-note"><strong>Farmer:</strong> {order.farmerNotes}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
