import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';

const categoryEmoji = {
  vegetables: '🥦', fruits: '🍎', grains: '🌾', pulses: '🫘',
  spices: '🌶️', dairy: '🥛', poultry: '🥚', herbs: '🌿', flowers: '🌸', other: '📦'
};

const StarRating = ({ rating, total }) => (
  <div className="pc-rating">
    <div className="stars">
      {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? '' : 'star-empty'}`}>★</span>)}
    </div>
    <span className="pc-rating-text">{rating > 0 ? `${rating.toFixed(1)} (${total})` : 'New'}</span>
  </div>
);

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const imageUrl = product.images?.[0]?.url || PLACEHOLDER;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="pc-image-wrap">
        <img src={imageUrl} alt={product.name} className="pc-image" onError={e => e.target.src = PLACEHOLDER} />
        <div className="pc-badges">
          {product.isOrganic && <span className="badge badge-green pc-badge">🌿 Organic</span>}
          {product.isFeatured && <span className="badge badge-amber pc-badge">⭐ Featured</span>}
        </div>
        <div className="pc-category-tag">
          <span>{categoryEmoji[product.category] || '📦'}</span>
          <span>{product.category}</span>
        </div>
      </div>

      <div className="pc-body">
        <h3 className="pc-name">{product.name}</h3>
        <p className="pc-desc">{product.description?.substring(0, 80)}...</p>

        <div className="pc-farmer">
          <div className="pc-farmer-avatar">{product.farmer?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="pc-farmer-name">{product.farmer?.farmName || product.farmer?.name}</div>
            <div className="pc-farmer-loc">📍 {product.farmer?.farmLocation?.city || product.location?.city}, {product.location?.state}</div>
          </div>
        </div>

        <StarRating rating={product.rating || 0} total={product.totalRatings || 0} />

        <div className="pc-footer">
          <div className="pc-price">
            <span className="pc-price-amount">₹{product.price}</span>
            <span className="pc-price-unit">/{product.unit}</span>
          </div>
          <div className="pc-stock">
            {product.availableQuantity > 0
              ? <span className="pc-in-stock">{product.availableQuantity} {product.unit} left</span>
              : <span className="pc-out-stock">Out of stock</span>}
          </div>
        </div>

        {user?.role === 'vendor' && product.availableQuantity > 0 && (
          <button className="btn btn-primary btn-sm pc-cart-btn" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
