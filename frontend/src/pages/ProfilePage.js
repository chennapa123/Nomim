import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../utils/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    farmName: user?.farmName || '',
    farmingType: user?.farmingType || 'conventional',
    cropTypes: (user?.cropTypes || []).join(', '),
    businessName: user?.businessName || '',
    businessType: user?.businessType || 'retailer',
    farmLocation: user?.farmLocation || { city: '', state: '', pincode: '' },
    businessLocation: user?.businessLocation || { city: '', state: '', pincode: '' },
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNested = (obj, k, v) => setForm(f => ({ ...f, [obj]: { ...f[obj], [k]: v } }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, cropTypes: form.cropTypes.split(',').map(c => c.trim()).filter(Boolean) };
      const { data } = await updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-page container fade-in">
      <h1>Profile Settings</h1>
      <div className="prof-tabs">
        {['profile', 'security'].map(t => (
          <button key={t} className={`prof-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' ? '👤 Profile' : '🔒 Security'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="prof-form">
          <div className="prof-section">
            <h3>Personal Information</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio / About</label>
              <textarea className="form-input" rows={3} placeholder="Tell vendors about yourself and your farming practices..." value={form.bio} onChange={e => set('bio', e.target.value)} />
            </div>
          </div>

          {user?.role === 'farmer' && (
            <div className="prof-section">
              <h3>Farm Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Farm Name</label>
                  <input className="form-input" placeholder="Your farm name" value={form.farmName} onChange={e => set('farmName', e.target.value)} />
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
                <label className="form-label">Crops Grown (comma separated)</label>
                <input className="form-input" value={form.cropTypes} onChange={e => set('cropTypes', e.target.value)} />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.farmLocation.city} onChange={e => setNested('farmLocation', 'city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.farmLocation.state} onChange={e => setNested('farmLocation', 'state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={form.farmLocation.pincode} onChange={e => setNested('farmLocation', 'pincode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {user?.role === 'vendor' && (
            <div className="prof-section">
              <h3>Business Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input className="form-input" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
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
            </div>
          )}

          <div className="prof-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="prof-form">
          <div className="prof-section">
            <h3>Change Password</h3>
            <div className="prof-pw-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" required value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} />
              </div>
            </div>
          </div>
          <div className="prof-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={pwLoading}>
              {pwLoading ? 'Updating...' : '🔒 Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
