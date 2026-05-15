import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">Nomim</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar-links">
          <li><Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>Marketplace</Link></li>
          <li><Link to="/farmers" className={location.pathname.startsWith('/farmers') ? 'active' : ''}>Farmers</Link></li>
          {user && <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>}
          {user && <li><Link to="/orders" className={location.pathname.startsWith('/orders') ? 'active' : ''}>Orders</Link></li>}
        </ul>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user?.role === 'vendor' && (
            <Link to="/cart" className="cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          )}

          {user ? (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar-circle">{user.name?.[0]?.toUpperCase()}</div>
                <span className="profile-name">{user.name?.split(' ')[0]}</span>
                <span className="role-badge">{user.role}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dh-name">{user.name}</div>
                    <div className="dh-email">{user.email}</div>
                  </div>
                  <Link to="/dashboard" className="dropdown-item">📊 Dashboard</Link>
                  <Link to="/orders" className="dropdown-item">📦 My Orders</Link>
                  <Link to="/profile" className="dropdown-item">⚙️ Profile Settings</Link>
                  {user.role === 'farmer' && <Link to="/add-product" className="dropdown-item">➕ Add Product</Link>}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout">🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? 'open' : ''} /><span className={menuOpen ? 'open' : ''} /><span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/products">Marketplace</Link>
          <Link to="/farmers">Farmers</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user?.role === 'farmer' && <Link to="/add-product">Add Product</Link>}
          {user?.role === 'vendor' && <Link to="/cart">Cart ({totalItems})</Link>}
          {user ? (
            <><Link to="/profile">Profile</Link><button onClick={handleLogout}>Sign Out</button></>
          ) : (
            <><Link to="/login">Log In</Link><Link to="/register">Join Free</Link></>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
