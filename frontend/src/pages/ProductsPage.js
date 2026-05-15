import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './ProductsPage.css';

const CATEGORIES = ['vegetables','fruits','grains','pulses','spices','dairy','poultry','herbs','flowers','other'];
const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Punjab','Haryana','Gujarat','Rajasthan','Uttar Pradesh','Bihar','West Bengal','Odisha','Madhya Pradesh','Kerala'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    isOrganic: '', state: '', minPrice: '', maxPrice: '',
    sort: 'newest', page: 1, search: searchParams.get('search') || ''
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
      const { data } = await getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const clearFilters = () => {
    setFilters({ category: '', isOrganic: '', state: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1, search: '' });
    setSearchInput('');
  };

  return (
    <div className="products-page">
      <div className="pp-header">
        <div className="container">
          <h1>Marketplace</h1>
          <p>Fresh produce directly from verified Indian farmers</p>
          <form onSubmit={handleSearch} className="pp-search">
            <input className="form-input pp-search-input" placeholder="Search products, crops, farms..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <button type="submit" className="btn btn-primary">🔍 Search</button>
          </form>
        </div>
      </div>

      <div className="container pp-body">
        {/* Filters Sidebar */}
        <aside className="pp-sidebar">
          <div className="pp-filter-header">
            <h3>Filters</h3>
            <button className="btn btn-sm btn-secondary" onClick={clearFilters}>Clear All</button>
          </div>

          <div className="pp-filter-section">
            <label className="pp-filter-label">Category</label>
            {CATEGORIES.map(cat => (
              <label key={cat} className="pp-radio-item">
                <input type="radio" name="category" checked={filters.category === cat} onChange={() => setFilter('category', filters.category === cat ? '' : cat)} />
                <span style={{textTransform:'capitalize'}}>{cat}</span>
              </label>
            ))}
            <label className="pp-radio-item">
              <input type="radio" name="category" checked={filters.category === ''} onChange={() => setFilter('category', '')} />
              <span>All Categories</span>
            </label>
          </div>

          <div className="pp-filter-section">
            <label className="pp-filter-label">Farming Type</label>
            <label className="pp-radio-item">
              <input type="radio" name="organic" checked={filters.isOrganic === 'true'} onChange={() => setFilter('isOrganic', filters.isOrganic === 'true' ? '' : 'true')} />
              <span>🌿 Organic Only</span>
            </label>
          </div>

          <div className="pp-filter-section">
            <label className="pp-filter-label">State</label>
            <select className="form-input form-select" value={filters.state} onChange={e => setFilter('state', e.target.value)}>
              <option value="">All States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="pp-filter-section">
            <label className="pp-filter-label">Price Range (₹/unit)</label>
            <div className="pp-price-range">
              <input className="form-input" type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} />
              <span>—</span>
              <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="pp-main">
          <div className="pp-toolbar">
            <span className="pp-count">{total} products found</span>
            <select className="form-input form-select pp-sort" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : products.length > 0 ? (
            <>
              <div className="pp-products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pp-pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
                    <button key={page} className={`page-btn ${filters.page === page ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, page }))}>
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-outline" style={{marginTop: 16}} onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
