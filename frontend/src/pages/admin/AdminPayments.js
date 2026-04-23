import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/payments').then(({ data }) => {
      setPayments(data.payments);
      setTotalRevenue(data.totalRevenue);
      setLoading(false);
    });
  }, []);

  const filtered = payments.filter(p =>
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId?.includes(search)
  );

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Payments</h1><p>{payments.length} total transactions</p></div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card colored">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{payments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">With Coupons</div>
          <div className="stat-value">{payments.filter(p => p.couponUsed).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Discounts</div>
          <div className="stat-value">₹{payments.reduce((s, p) => s + p.discountAmount, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by user, course, or transaction ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Transaction ID</th><th>User</th><th>Course</th><th>Original</th><th>Discount</th><th>Paid</th><th>Coupon</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.transactionId?.slice(0, 12)}…</td>
                  <td><strong>{p.user?.name}</strong><br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.user?.email}</span></td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.course?.title}</td>
                  <td>₹{p.originalAmount}</td>
                  <td style={{ color: p.discountAmount > 0 ? 'var(--success)' : 'inherit' }}>
                    {p.discountAmount > 0 ? `-₹${p.discountAmount}` : '—'}
                  </td>
                  <td><strong>₹{p.amount}</strong></td>
                  <td>
                    {p.couponUsed
                      ? <span className="badge badge-warning">{p.couponUsed}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><div className="empty-icon">💳</div><h3>No payments found</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
