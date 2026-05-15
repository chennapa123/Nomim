import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUser, getProducts, getUserReviews } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './FarmerProfilePage.css';

const FarmerProfilePage = () => {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUser(id), getProducts({ farmer: id }), getUserReviews(id)])
      .then(([fu, fp, fr]) => {
        setFarmer(fu.data.user);
        setProducts(fp.data.products || []);
        setReviews(fr.data.reviews || []);
      }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!farmer) return <div className="empty-state" style={{ marginTop: 80 }}><h3>Farmer not found</h3></div>;

  return (
    <div className="fpp fade-in">
      <div className="fpp-hero">
        <div className="container fpp-hero-inner">
          <div className="fpp-avatar">{farmer.name?.[0]?.toUpperCase()}</div>
          <div className="fpp-hero-info">
            <h1>{farmer.farmName || farmer.name}</h1>
            <p>by {farmer.name} · 📍 {farmer.farmLocation?.city}, {farmer.farmLocation?.state}</p>
            <div className="fpp-badges">
              <span className={`badge ${farmer.farmingType === 'organic' ? 'badge-green' : 'badge-earth'}`}>
                {farmer.farmingType === 'organic' ? '🌿 Organic Farm' : '🌱 ' + farmer.farmingType}
              </span>
              {farmer.isVerified && <span className="badge badge-green">✓ Verified</span>}
              <span className="badge badge-amber">⭐ {farmer.rating > 0 ? farmer.rating.toFixed(1) : 'New'} ({farmer.totalRatings} reviews)</span>
              <span className="badge badge-earth">📅 Since {new Date(farmer.joinedAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container fpp-body">
        <div className="fpp-grid">
          {/* Sidebar */}
          <aside className="fpp-sidebar">
            {farmer.bio && (
              <div className="fpp-card">
                <h3>About the Farm</h3>
                <p>{farmer.bio}</p>
              </div>
            )}
            <div className="fpp-card">
              <h3>Farm Details</h3>
              <div className="fpp-details">
                {farmer.farmSize && <div className="fpp-detail"><span>Farm Size</span><strong>{farmer.farmSize}</strong></div>}
                <div className="fpp-detail"><span>Farming Type</span><strong style={{textTransform:'capitalize'}}>{farmer.farmingType}</strong></div>
                {farmer.farmLocation?.state && <div className="fpp-detail"><span>Location</span><strong>{farmer.farmLocation.city}, {farmer.farmLocation.state}</strong></div>}
                {farmer.phone && <div className="fpp-detail"><span>Contact</span><strong>{farmer.phone}</strong></div>}
              </div>
            </div>
            {(farmer.cropTypes || []).length > 0 && (
              <div className="fpp-card">
                <h3>Crops Grown</h3>
                <div className="fpp-crops">
                  {farmer.cropTypes.map((c, i) => <span key={i} className="badge badge-green fpp-crop">{c}</span>)}
                </div>
              </div>
            )}
            <div className="fpp-stat-cards">
              <div className="fpp-stat"><strong>{products.length}</strong><span>Products Listed</span></div>
              <div className="fpp-stat"><strong>{reviews.length}</strong><span>Reviews</span></div>
            </div>
          </aside>

          {/* Products */}
          <main className="fpp-main">
            <h2>Products ({products.length})</h2>
            {products.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🌾</div><h3>No products listed yet</h3></div>
            ) : (
              <div className="fpp-products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {reviews.length > 0 && (
              <div className="fpp-reviews">
                <h2>Reviews ({reviews.length})</h2>
                <div className="fpp-reviews-grid">
                  {reviews.map(r => (
                    <div key={r._id} className="review-card">
                      <div className="review-header">
                        <div className="review-avatar">{r.reviewer?.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="review-name">{r.reviewer?.name}</div>
                          <div className="review-role badge badge-earth">{r.reviewer?.role}</div>
                        </div>
                        <div className="stars review-stars">
                          {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= r.rating ? '' : 'star-empty'}`}>★</span>)}
                        </div>
                      </div>
                      {r.comment && <p className="review-comment">{r.comment}</p>}
                      <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfilePage;
