import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="av-content">
          <div className="av-logo">🌾 AgriMart</div>
          <h2>Welcome back to India's Farmer-First Platform</h2>
          <p>Connecting farmers directly with vendors since 2024</p>
          <div className="av-stats">
            <div><strong>10,000+</strong><span>Farmers</span></div>
            <div><strong>5,000+</strong><span>Vendors</span></div>
            <div><strong>₹50Cr+</strong><span>Traded</span></div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap fade-in">
          <h1>Sign In</h1>
          <p className="auth-subtitle">Access your AgriMart account</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'farmer', phone: '',
    farmName: '', farmingType: 'conventional', cropTypes: '',
    farmLocation: { address: '', city: '', state: '', pincode: '' },
    businessName: '', businessType: 'retailer',
    businessLocation: { address: '', city: '', state: '', pincode: '' }
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setNested = (obj, key, value) => setForm(f => ({ ...f, [obj]: { ...f[obj], [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, cropTypes: form.cropTypes.split(',').map(c => c.trim()).filter(Boolean) };
      const user = await register(payload);
      toast.success(`Welcome to AgriMart, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="av-content">
          <div className="av-logo">🌾 AgriMart</div>
          <h2>Join India's Fastest Growing Agricultural Marketplace</h2>
          <div className="av-benefits">
            {['Direct farmer-vendor connection', 'Zero commission on sales', 'Real-time order tracking', 'Secure direct payments', 'Verified profiles only'].map((b, i) => (
              <div key={i} className="av-benefit"><span className="check">✓</span>{b}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap fade-in">
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line" />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <h1>{step === 1 ? 'Create Account' : form.role === 'farmer' ? 'Farm Details' : 'Business Details'}</h1>
          <p className="auth-subtitle">{step === 1 ? 'Step 1: Basic information' : 'Step 2: Your profile details'}</p>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="auth-form">
            {step === 1 && (
              <>
                <div className="role-selector">
                  {[{ value: 'farmer', label: '🧑‍🌾 I am a Farmer', desc: 'I grow and sell produce' },
                    { value: 'vendor', label: '🏪 I am a Vendor', desc: 'I buy produce for my business' }].map(r => (
                    <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                      <input type="radio" value={r.value} checked={form.role === r.value} onChange={e => set('role', e.target.value)} hidden />
                      <strong>{r.label}</strong><span>{r.desc}</span>
                    </label>
                  ))}
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" required minLength={6} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-btn">Continue →</button>
              </>
            )}

            {step === 2 && form.role === 'farmer' && (
              <>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Farm Name</label>
                    <input className="form-input" placeholder="e.g. Green Valley Farm" value={form.farmName} onChange={e => set('farmName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Farming Type</label>
                    <select className="form-input form-select" value={form.farmingType} onChange={e => set('farmingType', e.target.value)}>
                      <option value="conventional">Conventional</option>
                      <option value="organic">Organic</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Crops You Grow (comma separated)</label>
                  <input className="form-input" placeholder="e.g. Tomatoes, Onions, Potatoes" value={form.cropTypes} onChange={e => set('cropTypes', e.target.value)} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="City" value={form.farmLocation.city} onChange={e => setNested('farmLocation', 'city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder="State" value={form.farmLocation.state} onChange={e => setNested('farmLocation', 'state', e.target.value)} />
                  </div>
                </div>
                <div className="form-row-2">
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Account ✓'}</button>
                </div>
              </>
            )}

            {step === 2 && form.role === 'vendor' && (
              <>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input className="form-input" placeholder="Your business name" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Type</label>
                    <select className="form-input form-select" value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="exporter">Exporter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="City" value={form.businessLocation.city} onChange={e => setNested('businessLocation', 'city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder="State" value={form.businessLocation.state} onChange={e => setNested('businessLocation', 'state', e.target.value)} />
                  </div>
                </div>
                <div className="form-row-2">
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Account ✓'}</button>
                </div>
              </>
            )}
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
