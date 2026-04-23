import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/payments/my-payments'),
    ]).then(([meRes, payRes]) => {
      setEnrollments(meRes.data.user.enrolledCourses || []);
      setPayments(payRes.data.payments);
      setLoading(false);
    });
  }, []);

  const totalSpent = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 🎓</h1>
          <p>Continue your learning journey</p>
        </div>
        <Link to="/student/catalog" className="btn btn-primary">Browse Courses</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card colored">
          <div className="stat-label">Enrolled Courses</div>
          <div className="stat-value">{enrollments.length}</div>
          <div className="stat-sub">Active enrollments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{totalSpent.toLocaleString()}</div>
          <div className="stat-sub">Investment in learning</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Purchases</div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-sub">Payment transactions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Enrolled courses */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>My Courses</h3>
            <Link to="/student/enrollments" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View All →</Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">📚</div>
              <h3 style={{ fontSize: 15 }}>No courses yet</h3>
              <p style={{ fontSize: 13 }}>Browse the catalog to enroll</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enrollments.slice(0, 4).map(course => (
                <Link key={course._id} to={`/student/catalog/${course._id}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px', borderRadius: 8, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <img src={course.thumbnail || 'https://placehold.co/50x35/0D9488/white?text=C'} alt="" style={{ width: 50, height: 35, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{course.title}</span>
                  <span className="enrolled-badge" style={{ marginLeft: 'auto', flexShrink: 0 }}>enrolled</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Payments</h3>
          {payments.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">💳</div>
              <h3 style={{ fontSize: 15 }}>No payments yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {payments.slice(0, 4).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.course?.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.amount}</div>
                    {p.discountAmount > 0 && <div style={{ fontSize: 11, color: 'var(--success)' }}>Saved ₹{p.discountAmount}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
