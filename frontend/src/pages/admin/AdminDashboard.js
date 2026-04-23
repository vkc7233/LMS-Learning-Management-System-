import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, paymentsRes, couponsRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/payments'),
          api.get('/coupons'),
        ]);
        setStats({
          users: usersRes.data.count,
          courses: coursesRes.data.count,
          revenue: paymentsRes.data.totalRevenue,
          payments: paymentsRes.data.count,
          coupons: couponsRes.data.count,
          recentPayments: paymentsRes.data.payments.slice(0, 5),
          recentUsers: usersRes.data.users.slice(0, 5),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview and key metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card colored">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{stats?.revenue?.toLocaleString()}</div>
          <div className="stat-sub">All time earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.users}</div>
          <div className="stat-sub">Registered accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Courses</div>
          <div className="stat-value">{stats?.courses}</div>
          <div className="stat-sub">Published courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{stats?.payments}</div>
          <div className="stat-sub">Successful payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Coupons</div>
          <div className="stat-value">{stats?.coupons}</div>
          <div className="stat-sub">Active discount codes</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Payments */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Recent Payments</h3>
          {stats?.recentPayments?.length === 0
            ? <p className="text-muted">No payments yet.</p>
            : <div className="table-wrapper">
                <table>
                  <thead><tr><th>User</th><th>Course</th><th>Amount</th></tr></thead>
                  <tbody>
                    {stats?.recentPayments?.map(p => (
                      <tr key={p._id}>
                        <td>{p.user?.name}</td>
                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.course?.title}</td>
                        <td><strong>₹{p.amount}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Recent Users</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {stats?.recentUsers?.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'instructor' ? 'info' : 'success'}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
