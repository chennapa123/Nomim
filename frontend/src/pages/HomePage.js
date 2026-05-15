import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getFarmers } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { key: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎' },
  { key: 'grains', label: 'Grains', emoji: '🌾' },
  { key: 'pulses', label: 'Pulses', emoji: '🫘' },
  { key: 'spices', label: 'Spices', emoji: '🌶️' },
  { key: 'dairy', label: 'Dairy', emoji: '🥛' },
  { key: 'poultry', label: 'Poultry', emoji: '🥚' },
  { key: 'herbs', label: 'Herbs', emoji: '🌿' },
];

const STATS = [
  { value: '10,000+', label: 'Registered Farmers' },
  { value: '₹50Cr+', label: 'Direct Transactions' },
  { value: '0%', label: 'Middleman Cut' },
  { value: '28', label: 'States Covered' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getFarmers({ limit: 4 })])
      .then(([fp, ff]) => {
        setFeatured(fp.data.products || []);
        setFarmers(ff.data.farmers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-circle hero-circle-1" />
          <div className="hero-circle hero-circle-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag">🌱 India's Farmer-First Marketplace</div>
          <h1 className="hero-title">
            Farm Fresh. <br />
            <span>Zero Middlemen.</span><br />
            Fair Prices.
          </h1>
          <p className="hero-sub">
            AgriMart connects farmers directly with vendors, restaurants, and retailers — ensuring maximum value for growers and fresher produce for buyers.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products 🛒</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Start Selling →</Link>
          </div>
          <div className="hero-chips">
            <span>✅ No Commission</span>
            <span>✅ Direct Payment</span>
            <span>✅ Verified Farmers</span>
            <span>✅ Quality Guaranteed</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How AgriMart Works</h2>
            <p>Simple, transparent, and efficient</p>
          </div>
          <div className="hiw-grid">
            {[
              { icon: '🧑‍🌾', step: '01', title: 'Farmer Lists Produce', desc: 'Farmers create listings with price, quantity, and harvest details directly on the platform.' },
              { icon: '🔍', step: '02', title: 'Vendor Discovers', desc: 'Vendors browse, filter by category, location, and organic certification to find what they need.' },
              { icon: '🤝', step: '03', title: 'Direct Deal', desc: 'Vendors place orders directly — no agents, no commission, negotiation happens on-platform.' },
              { icon: '🚚', step: '04', title: 'Delivery & Payment', desc: 'Farmer delivers or vendor picks up. Payment is made directly — 100% to the farmer.' },
            ].map((step, i) => (
              <div key={i} className="hiw-card">
                <div className="hiw-step-num">{step.step}</div>
                <div className="hiw-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products" className="see-all">See all →</Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/products?category=${cat.key}`} className="category-chip">
                <span className="cat-emoji">{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="see-all">View all →</Link>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>Products coming soon!</h3>
              <p>Farmers are listing their produce. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Farmers */}
      {farmers.length > 0 && (
        <section className="farmers-section">
          <div className="container">
            <div className="section-header">
              <h2>Top Farmers</h2>
              <Link to="/farmers" className="see-all">Meet all farmers →</Link>
            </div>
            <div className="farmers-grid">
              {farmers.map(f => (
                <Link key={f._id} to={`/farmers/${f._id}`} className="farmer-card">
                  <div className="fc-avatar">{f.name?.[0]?.toUpperCase()}</div>
                  <div className="fc-info">
                    <div className="fc-name">{f.farmName || f.name}</div>
                    <div className="fc-location">📍 {f.farmLocation?.city}, {f.farmLocation?.state}</div>
                    <div className="fc-type">{f.farmingType === 'organic' ? '🌿 Organic' : '🌱 ' + f.farmingType}</div>
                  </div>
                  <div className="fc-rating">
                    <span className="star">★</span> {f.rating > 0 ? f.rating.toFixed(1) : 'New'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <h2>Are you a Farmer?</h2>
            <p>Join thousands of farmers selling directly to vendors across India — no agents, no cuts.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Register as Farmer</Link>
            <Link to="/register?role=vendor" className="btn btn-outline btn-lg" style={{borderColor:'white',color:'white'}}>Register as Vendor</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
