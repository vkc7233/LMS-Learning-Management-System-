import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    Promise.all([api.get('/auth/me'), api.get('/payments/my-payments')]).then(([meRes, payRes]) => {
      setEnrollments(meRes.data.user.enrolledCourses || []);
      setPayments(payRes.data.payments);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>My Enrollments</h1><p>Your courses and purchase history</p></div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          My Courses ({enrollments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
          Payment History ({payments.length})
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>No courses enrolled</h3>
              <p>Browse the catalog to find courses</p>
              <Link to="/student/catalog" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
            </div>
          ) : (
            <div className="courses-grid">
              {enrollments.map(course => (
                <Link key={course._id} to={`/student/catalog/${course._id}`} style={{ textDecoration: 'none' }}>
                  <div className="course-card">
                    <div style={{ position: 'relative' }}>
                      <img
                        src={course.thumbnail || `https://placehold.co/600x400/0D9488/white?text=${encodeURIComponent(course.title || 'Course')}`}
                        alt={course.title}
                      />
                      <span style={{ position: 'absolute', top: 8, right: 8 }} className="enrolled-badge">✓ Enrolled</span>
                    </div>
                    <div className="course-card-body">
                      <div className="course-card-title">{course.title}</div>
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                        Continue Learning →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'payments' && (
        <>
          {payments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>No payment history</h3>
            </div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Course</th><th>Original</th><th>Discount</th><th>Paid</th><th>Coupon</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={p.course?.thumbnail || 'https://placehold.co/50x35/0D9488/white?text=C'} alt="" style={{ width: 50, height: 35, objectFit: 'cover', borderRadius: 5 }} />
                            <strong style={{ fontSize: 13 }}>{p.course?.title}</strong>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>₹{p.originalAmount}</td>
                        <td style={{ color: p.discountAmount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                          {p.discountAmount > 0 ? `-₹${p.discountAmount}` : '—'}
                        </td>
                        <td><strong>₹{p.amount}</strong></td>
                        <td>
                          {p.couponUsed
                            ? <span className="badge badge-warning">{p.couponUsed}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td><span className={`badge ${p.status === 'success' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
