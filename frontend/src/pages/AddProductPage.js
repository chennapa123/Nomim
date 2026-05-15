import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProduct } from '../utils/api';
import toast from 'react-hot-toast';
import './ProductFormPage.css';

const CATEGORIES = ['vegetables','fruits','grains','pulses','spices','dairy','poultry','herbs','flowers','other'];
const UNITS = ['kg','quintal','ton','dozen','piece','liter','bundle'];

const ProductFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: 'vegetables', price: '', unit: 'kg',
    availableQuantity: '', minOrderQuantity: 1, isOrganic: false,
    harvestDate: '', expiryDate: '',
    location: { city: '', state: '', pincode: '' },
    tags: '', isAvailable: true,
    deliveryOptions: { vendorPickup: true, farmerDelivery: false, shippingAvailable: false },
    images: []
  });

  useEffect(() => {
    if (isEdit && id) {
      getProduct(id).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name || '', description: p.description || '', category: p.category || 'vegetables',
          price: p.price || '', unit: p.unit || 'kg', availableQuantity: p.availableQuantity || '',
          minOrderQuantity: p.minOrderQuantity || 1, isOrganic: p.isOrganic || false,
          harvestDate: p.harvestDate ? p.harvestDate.substring(0,10) : '',
          expiryDate: p.expiryDate ? p.expiryDate.substring(0,10) : '',
          location: p.location || { city: '', state: '', pincode: '' },
          tags: (p.tags || []).join(', '), isAvailable: p.isAvailable !== false,
          deliveryOptions: p.deliveryOptions || { vendorPickup: true, farmerDelivery: false, shippingAvailable: false },
          images: p.images || []
        });
      }).catch(() => toast.error('Failed to load product'));
    }
  }, [isEdit, id]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setLoc = (key, value) => setForm(f => ({ ...f, location: { ...f.location, [key]: value } }));
  const setDeliv = (key, value) => setForm(f => ({ ...f, deliveryOptions: { ...f.deliveryOptions, [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        availableQuantity: Number(form.availableQuantity),
        minOrderQuantity: Number(form.minOrderQuantity),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Product updated!');
      } else {
        await createProduct(payload);
        toast.success('Product listed successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pfp container fade-in">
      <h1>{isEdit ? 'Edit Product' : 'List a New Product'}</h1>
      <p className="pfp-subtitle">{isEdit ? 'Update your product details' : 'Share your produce with vendors across India'}</p>

      <form onSubmit={handleSubmit} className="pfp-form">
        <div className="pfp-section">
          <h3>Basic Information</h3>
          <div className="pfp-grid-2">
            <div className="form-group pfp-full">
              <label className="form-label">Product Name *</label>
              <input className="form-input" required placeholder="e.g. Fresh Alphonso Mangoes" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{textTransform:'capitalize'}}>{c}</option>)}
              </select>
            </div>
            <div className="form-group pfp-full">
              <label className="form-label">Description *</label>
              <textarea className="form-input pfp-textarea" required rows={4} placeholder="Describe your produce, quality, and growing conditions..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pfp-section">
          <h3>Pricing & Quantity</h3>
          <div className="pfp-grid-3">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" required min="0" step="0.01" placeholder="e.g. 120" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-input form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Available Quantity *</label>
              <input className="form-input" type="number" required min="0" placeholder="e.g. 500" value={form.availableQuantity} onChange={e => set('availableQuantity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Order Quantity</label>
              <input className="form-input" type="number" min="1" value={form.minOrderQuantity} onChange={e => set('minOrderQuantity', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pfp-section">
          <h3>Dates & Quality</h3>
          <div className="pfp-grid-3">
            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input className="form-input" type="date" value={form.harvestDate} onChange={e => set('harvestDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Best Before</label>
              <input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
          </div>
          <div className="pfp-checkboxes">
            <label className="pfp-check">
              <input type="checkbox" checked={form.isOrganic} onChange={e => set('isOrganic', e.target.checked)} />
              <span>🌿 This is Organic Produce</span>
            </label>
            <label className="pfp-check">
              <input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} />
              <span>✅ Currently Available</span>
            </label>
          </div>
        </div>

        <div className="pfp-section">
          <h3>Location</h3>
          <div className="pfp-grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="City" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" placeholder="State" value={form.location.state} onChange={e => setLoc('state', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" placeholder="Pincode" maxLength={6} value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pfp-section">
          <h3>Delivery Options</h3>
          <div className="pfp-checkboxes">
            <label className="pfp-check">
              <input type="checkbox" checked={form.deliveryOptions.vendorPickup} onChange={e => setDeliv('vendorPickup', e.target.checked)} />
              <span>🚗 Vendor can pick up from farm</span>
            </label>
            <label className="pfp-check">
              <input type="checkbox" checked={form.deliveryOptions.farmerDelivery} onChange={e => setDeliv('farmerDelivery', e.target.checked)} />
              <span>🚚 I can deliver to vendor</span>
            </label>
            <label className="pfp-check">
              <input type="checkbox" checked={form.deliveryOptions.shippingAvailable} onChange={e => setDeliv('shippingAvailable', e.target.checked)} />
              <span>📦 Shipping available</span>
            </label>
          </div>
        </div>

        <div className="pfp-section">
          <h3>Tags (Optional)</h3>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-input" placeholder="e.g. fresh, seasonal, bulk-discount" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
        </div>

        <div className="pfp-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Saving...' : isEdit ? '✅ Update Product' : '🌾 List Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const AddProductPage = () => <ProductFormPage isEdit={false} />;
export const EditProductPage = () => <ProductFormPage isEdit={true} />;

export default ProductFormPage;
