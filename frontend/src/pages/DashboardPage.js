import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getOrders, getProducts } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './DashboardPage.css';

const STATUS_COLORS = { pending:'#f59e0b', accepted:'#3b82f6', processing:'#8b5cf6', dispatched:'#10b981', delivered:'#16a34a', rejected:'#ef4444', cancelled:'#6b7280' };

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [getDashboardStats(), getOrders({ limit: 5 })];
    if (user?.role === 'farmer') promises.push(getProducts({ farmer: user._id, limit: 6 }));

    Promise.all(promises).then(([sd, od, pd]) => {
      setStats(sd.data.stats || []);
      setTotalRevenue(sd.data.totalRevenue || 0);
      setRecentOrders(od.data.orders || []);
      if (pd) setMyProducts(pd.data.products || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const totalOrders = stats.reduce((s, st) => s + st.count, 0);
  const pendingOrders = stats.find(s => s._id === 'pending')?.count || 0;
  const deliveredOrders = stats.find(s => s._id === 'delivered')?.count || 0;

  const pieData = stats.map(s => ({ name: s._id, value: s.count, fill: STATUS_COLORS[s._id] || '#94a3b8' }));

  if (loading) return <div className="spinner" style={{marginTop:80}} />;

  return (
    <div className="dashboard container fade-in">
      <div className="dash-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="dash-subtitle">{user?.role === 'farmer' ? user?.farmName || 'Your Farm Dashboard' : user?.businessName || 'Your Business Dashboard'}</p>
        </div>
        <div className="dash-header-actions">
          {user?.role === 'farmer' && <Link to="/add-product" className="btn btn-primary">+ Add Product</Link>}
          {user?.role === 'vendor' && <Link to="/products" className="btn btn-primary">Browse Products</Link>}
          <Link to="/orders" className="btn btn-secondary">View All Orders</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-kpis">
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">💰</div>
          <div className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="kpi-label">Total Revenue</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">📦</div>
          <div className="kpi-value">{totalOrders}</div>
          <div className="kpi-label">Total Orders</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-value">{pendingOrders}</div>
          <div className="kpi-label">Pending Orders</div>
        </div>
        <div className="kpi-card kpi-earth">
          <div className="kpi-icon">✅</div>
          <div className="kpi-value">{deliveredOrders}</div>
          <div className="kpi-label">Delivered</div>
        </div>
      </div>

      <div className="dash-charts-row">
        {/* Order Status Chart */}
        <div className="dash-chart-card">
          <h3>Order Status Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="chart-with-legend">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {pieData.map((entry, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{background: entry.fill}} />
                    <span className="legend-name" style={{textTransform:'capitalize'}}>{entry.name}</span>
                    <span className="legend-value">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state" style={{padding:'30px 0'}}><p>No orders yet</p></div>}
        </div>

        {/* Revenue by Status Bar chart */}
        <div className="dash-chart-card">
          <h3>Revenue by Status</h3>
          {stats.filter(s => s.revenue > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.filter(s => s.revenue > 0)} margin={{top:0,right:0,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="_id" tick={{fontSize: 11, textTransform:'capitalize'}} />
                <YAxis tick={{fontSize:11}} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#16a34a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{padding:'30px 0'}}><p>No revenue data yet</p></div>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2>Recent Orders</h2>
          <Link to="/orders" className="see-all">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders yet</h3></div>
        ) : (
          <div className="orders-table">
            <div className="ot-header">
              <span>Order #</span><span>Date</span><span>{user?.role === 'farmer' ? 'Vendor' : 'Farmer'}</span><span>Amount</span><span>Status</span><span></span>
            </div>
            {recentOrders.map(o => (
              <div key={o._id} className="ot-row">
                <span className="ot-num">{o.orderNumber}</span>
                <span className="ot-date">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                <span className="ot-party">
                  {user?.role === 'farmer' ? (o.vendor?.businessName || o.vendor?.name) : (o.farmer?.farmName || o.farmer?.name)}
                </span>
                <span className="ot-amount">₹{o.totalAmount?.toLocaleString('en-IN')}</span>
                <span><span className={`badge status-${o.status}`}>{o.status}</span></span>
                <span><Link to={`/orders/${o._id}`} className="btn btn-sm btn-secondary">View</Link></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Farmer's Products */}
      {user?.role === 'farmer' && (
        <div className="dash-section">
          <div className="dash-section-header">
            <h2>My Products</h2>
            <Link to="/add-product" className="btn btn-sm btn-primary">+ Add New</Link>
          </div>
          {myProducts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🌾</div><h3>No products listed yet</h3><Link to="/add-product" className="btn btn-primary" style={{marginTop:16}}>List Your First Product</Link></div>
          ) : (
            <div className="my-products-grid">
              {myProducts.map(p => (
                <div key={p._id} className="my-product-card">
                  <div className="mpc-img-wrap">
                    <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=60'} alt={p.name} onError={e => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=60'} />
                  </div>
                  <div className="mpc-body">
                    <div className="mpc-name">{p.name}</div>
                    <div className="mpc-price">₹{p.price}/{p.unit}</div>
                    <div className="mpc-stock">{p.availableQuantity} {p.unit} left</div>
                    <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-earth'}`}>{p.isAvailable ? 'Active' : 'Inactive'}</span>
                    <div className="mpc-actions">
                      <Link to={`/edit-product/${p._id}`} className="btn btn-sm btn-secondary">Edit</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
