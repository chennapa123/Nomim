import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getProductReviews } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([pd, rv]) => {
        setProduct(pd.data.product);
        setReviews(rv.data.reviews);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{marginTop: 80}} />;
  if (!product) return <div className="empty-state" style={{marginTop: 80}}><h3>Product not found</h3></div>;

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${qty} ${product.unit} of ${product.name} added to cart!`);
  };

  const images = product.images?.length > 0 ? product.images : [{ url: PLACEHOLDER }];

  return (
    <div className="pdp container fade-in">
      <div className="pdp-breadcrumb">
        <Link to="/products">Marketplace</Link> / <span style={{textTransform:'capitalize'}}>{product.category}</span> / {product.name}
      </div>

      <div className="pdp-grid">
        {/* Images */}
        <div className="pdp-images">
          <div className="pdp-main-img">
            <img src={images[activeImg]?.url || PLACEHOLDER} alt={product.name} onError={e => e.target.src = PLACEHOLDER} />
            {product.isOrganic && <span className="badge badge-green pdp-organic-badge">🌿 Certified Organic</span>}
          </div>
          {images.length > 1 && (
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <button key={i} className={`pdp-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img.url} alt="" onError={e => e.target.src = PLACEHOLDER} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pdp-info">
          <div className="pdp-category-tag">{product.category}</div>
          <h1 className="pdp-name">{product.name}</h1>

          <div className="pdp-rating">
            <div className="stars">
              {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(product.rating) ? '' : 'star-empty'}`}>★</span>)}
            </div>
            <span>{product.rating?.toFixed(1) || 'No ratings'} ({product.totalRatings} reviews)</span>
          </div>

          <div className="pdp-price">
            <span className="pdp-price-amt">₹{product.price}</span>
            <span className="pdp-price-unit">per {product.unit}</span>
          </div>

          <p className="pdp-description">{product.description}</p>

          <div className="pdp-details-grid">
            {product.harvestDate && <div className="pdp-detail"><span>🗓 Harvested</span><strong>{new Date(product.harvestDate).toLocaleDateString('en-IN')}</strong></div>}
            {product.expiryDate && <div className="pdp-detail"><span>⏳ Best Before</span><strong>{new Date(product.expiryDate).toLocaleDateString('en-IN')}</strong></div>}
            <div className="pdp-detail"><span>📦 Min Order</span><strong>{product.minOrderQuantity} {product.unit}</strong></div>
            <div className="pdp-detail"><span>📊 Available</span><strong>{product.availableQuantity} {product.unit}</strong></div>
            <div className="pdp-detail"><span>📍 Location</span><strong>{product.location?.city}, {product.location?.state}</strong></div>
            <div className="pdp-detail"><span>🌱 Type</span><strong>{product.isOrganic ? 'Organic' : 'Conventional'}</strong></div>
          </div>

          <div className="pdp-delivery">
            <h4>Delivery Options</h4>
            <div className="pdp-delivery-tags">
              {product.deliveryOptions?.vendorPickup && <span className="badge badge-green">✓ Vendor Pickup</span>}
              {product.deliveryOptions?.farmerDelivery && <span className="badge badge-green">✓ Farmer Delivery</span>}
              {product.deliveryOptions?.shippingAvailable && <span className="badge badge-green">✓ Shipping</span>}
            </div>
          </div>

          {user?.role === 'vendor' && product.availableQuantity > 0 && (
            <div className="pdp-order">
              <div className="pdp-qty-wrap">
                <button className="qty-btn" onClick={() => setQty(Math.max(product.minOrderQuantity || 1, qty - 1))}>−</button>
                <span className="qty-val">{qty} {product.unit}</span>
                <button className="qty-btn" onClick={() => setQty(Math.min(product.availableQuantity, qty + 1))}>+</button>
              </div>
              <div className="pdp-order-total">Total: <strong>₹{(product.price * qty).toLocaleString('en-IN')}</strong></div>
              <button className="btn btn-primary btn-lg pdp-cart-btn" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
            </div>
          )}
          {product.availableQuantity === 0 && <div className="pdp-out-stock">❌ Out of Stock</div>}
          {!user && <div className="pdp-login-prompt"><Link to="/login" className="btn btn-outline btn-lg" style={{width:'100%', justifyContent:'center'}}>Login to Order</Link></div>}
        </div>
      </div>

      {/* Farmer Info */}
      <div className="pdp-farmer-section">
        <h2>About the Farmer</h2>
        <Link to={`/farmers/${product.farmer?._id}`} className="pdp-farmer-card">
          <div className="pdp-farmer-avatar">{product.farmer?.name?.[0]?.toUpperCase()}</div>
          <div className="pdp-farmer-details">
            <h3>{product.farmer?.farmName || product.farmer?.name}</h3>
            <p>📍 {product.farmer?.farmLocation?.city}, {product.farmer?.farmLocation?.state}</p>
            <p>🌱 {product.farmer?.farmingType} farming · Joined {new Date(product.farmer?.joinedAt).toLocaleDateString('en-IN', {year:'numeric', month:'long'})}</p>
            {product.farmer?.bio && <p className="pdp-farmer-bio">{product.farmer.bio}</p>}
          </div>
          <div className="pdp-farmer-rating">
            <span className="star" style={{fontSize:'1.2rem'}}>★</span>
            <strong>{product.farmer?.rating?.toFixed(1) || 'New'}</strong>
            <span>({product.farmer?.totalRatings} ratings)</span>
          </div>
        </Link>
      </div>

      {/* Reviews */}
      <div className="pdp-reviews">
        <h2>Customer Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💬</div><h3>No reviews yet</h3><p>Be the first to review this product!</p></div>
        ) : (
          <div className="pdp-reviews-grid">
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
                <p className="review-comment">{r.comment}</p>
                <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
