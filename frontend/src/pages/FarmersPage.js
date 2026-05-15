import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFarmers } from '../utils/api';
import './FarmersPage.css';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Punjab','Haryana','Gujarat','Rajasthan','Uttar Pradesh','Bihar','West Bengal','Odisha','Madhya Pradesh','Kerala'];

const FarmersPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', farmingType: '', page: 1 });

  useEffect(() => {
    setLoading(true);
    getFarmers(filters).then(({ data }) => setFarmers(data.farmers || [])).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="farmers-page">
      <div className="fp-header">
        <div className="container">
          <h1>Meet Our Farmers</h1>
          <p>Verified farmers directly connected to you — no agents, no intermediaries</p>
        </div>
      </div>

      <div className="container fp-body">
        <div className="fp-filters">
          <select className="form-input form-select fp-filter-select" value={filters.state} onChange={e => setFilters(f => ({...f, state: e.target.value}))}>
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input form-select fp-filter-select" value={filters.farmingType} onChange={e => setFilters(f => ({...f, farmingType: e.target.value}))}>
            <option value="">All Farming Types</option>
            <option value="organic">🌿 Organic</option>
            <option value="conventional">🌱 Conventional</option>
            <option value="mixed">🌾 Mixed</option>
          </select>
        </div>

        {loading ? <div className="spinner" /> : farmers.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🧑‍🌾</div><h3>No farmers found</h3></div>
        ) : (
          <div className="fp-grid">
            {farmers.map(f => (
              <Link key={f._id} to={`/farmers/${f._id}`} className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-avatar">{f.name?.[0]?.toUpperCase()}</div>
                  <div className={`fp-type-badge badge ${f.farmingType === 'organic' ? 'badge-green' : 'badge-earth'}`}>
                    {f.farmingType === 'organic' ? '🌿 Organic' : f.farmingType === 'mixed' ? '🌾 Mixed' : '🌱 Conventional'}
                  </div>
                </div>
                <div className="fp-name">{f.farmName || f.name}</div>
                <div className="fp-loc">📍 {f.farmLocation?.city}, {f.farmLocation?.state}</div>
                {f.bio && <p className="fp-bio">{f.bio.substring(0, 80)}...</p>}
                <div className="fp-crops">
                  {(f.cropTypes || []).slice(0, 3).map((c, i) => <span key={i} className="badge badge-earth fp-crop">{c}</span>)}
                  {(f.cropTypes || []).length > 3 && <span className="fp-more">+{f.cropTypes.length - 3} more</span>}
                </div>
                <div className="fp-footer">
                  <div className="fp-rating">
                    <span className="star">★</span>
                    <span>{f.rating > 0 ? f.rating.toFixed(1) : 'New'}</span>
                    <span className="fp-rating-count">({f.totalRatings})</span>
                  </div>
                  <span className="fp-joined">Since {new Date(f.joinedAt).getFullYear()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmersPage;
