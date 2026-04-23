import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([api.get(`/courses/${id}`), api.get('/auth/me')]).then(([cRes, mRes]) => {
      setCourse(cRes.data.course);
      const enrolled = (mRes.data.user.enrolledCourses || []).map(c => c._id || c);
      setIsEnrolled(enrolled.includes(id));
      setLoading(false);
    });
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCheckingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, price: course.price });
      setCouponInfo(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setCouponInfo(null);
    } finally { setCheckingCoupon(false); }
  };

  const handlePurchase = async () => {
    setPurchaseError(''); setPurchasing(true);
    try {
      await api.post('/payments/checkout', { courseId: id, couponCode: couponInfo ? couponCode : null });
      setPurchaseSuccess(true);
      setIsEnrolled(true);
    } catch (err) {
      setPurchaseError(err.response?.data?.message || 'Payment failed');
    } finally { setPurchasing(false); }
  };

  const finalPrice = couponInfo ? couponInfo.finalPrice : course?.price;

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;
  if (!course) return <div className="empty-state"><h3>Course not found</h3></div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, marginBottom: 16, cursor: 'pointer', fontSize: 14 }}>
        ← Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left: Course Info */}
        <div>
          <img
            src={course.thumbnail || `https://placehold.co/800x400/0D9488/white?text=${encodeURIComponent(course.title)}`}
            alt={course.title}
            style={{ width: '100%', borderRadius: 12, marginBottom: 20, maxHeight: 320, objectFit: 'cover' }}
          />

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-info">{course.level}</span>
            <span className="badge badge-purple">{course.category}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👥 {course.enrolledStudents?.length || 0} students</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📖 {course.lessons?.length || 0} lessons</span>
          </div>

          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginBottom: 8 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>by <strong>{course.instructor?.name}</strong></p>

          {/* Tabs */}
          <div className="tabs" style={{ marginTop: 20 }}>
            {['overview', 'lessons'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div>
              <p style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>{course.description}</p>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              {course.lessons?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No lessons added yet.</p>
              ) : (
                course.lessons.map((lesson, i) => (
                  <div key={lesson._id || i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: isEnrolled ? 'var(--primary)' : 'var(--border)', color: isEnrolled ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{lesson.title}</div>
                      {isEnrolled && lesson.content && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{lesson.content}</p>}
                      {!isEnrolled && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔒 Enroll to access</span>}
                    </div>
                    {lesson.duration > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{lesson.duration} min</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Purchase / Enrolled card */}
        <div className="card" style={{ position: 'sticky', top: 20 }}>
          {purchaseSuccess || isEnrolled ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ marginBottom: 8 }}>You're Enrolled!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>You now have full access to this course.</p>
              <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>
                ✓ {course.lessons?.length || 0} lessons unlocked
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>
                {course.price === 0 ? 'FREE' : `₹${finalPrice}`}
              </div>
              {couponInfo && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 4 }}>₹{course.price}</div>
              )}
              {couponInfo && (
                <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: 13 }}>
                  🎉 {couponInfo.coupon.discountType === 'percentage' ? `${couponInfo.coupon.discountValue}%` : `₹${couponInfo.coupon.discountValue}`} off applied! You save ₹{couponInfo.discountAmount}
                </div>
              )}

              {/* Coupon input */}
              <div style={{ margin: '16px 0' }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Coupon Code
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-control"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponInfo(null); setCouponError(''); }}
                    placeholder="SAVE10"
                    style={{ flex: 1, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleApplyCoupon} disabled={checkingCoupon || !couponCode.trim()}>
                    {checkingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{couponError}</div>}
              </div>

              {purchaseError && <div className="alert alert-error">{purchaseError}</div>}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handlePurchase} disabled={purchasing}>
                {purchasing ? <><span className="spinner"></span> Processing...</> : course.price === 0 ? '🎓 Enroll for Free' : `💳 Buy Now — ₹${finalPrice}`}
              </button>

              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>✓ Lifetime access</div>
                <div>✓ {course.lessons?.length || 0} lessons</div>
                <div>✓ Certificate of completion</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
