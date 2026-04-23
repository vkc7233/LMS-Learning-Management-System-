import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const EMPTY_FORM = { code: '', discountType: 'percentage', discountValue: '', maxUses: 100, isActive: true, expiresAt: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    const { data } = await api.get('/coupons');
    setCoupons(data.coupons);
    setLoading(false);
  };
  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setEditCoupon(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, maxUses: c.maxUses, isActive: c.isActive, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase() };
      if (editCoupon) {
        await api.put(`/coupons/${editCoupon._id}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    fetchCoupons();
  };

  const toggleActive = async (coupon) => {
    await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    fetchCoupons();
  };

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Coupons</h1><p>Manage discount codes</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Coupon</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Used / Max</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><strong style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 }}>{c.code}</strong></td>
                  <td><span className="badge badge-info">{c.discountType}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{c.usedCount} / {c.maxUses}</span>
                      <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 4, minWidth: 60 }}>
                        <div style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%`, background: 'var(--primary)', height: '100%', borderRadius: 4 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(c)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <div className="empty-state"><div className="empty-icon">🏷️</div><h3>No coupons yet</h3></div>}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editCoupon ? 'Edit Coupon' : 'Create Coupon'}
          onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Coupon Code</label>
            <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 2 }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Discount Type</label>
              <select className="form-control" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value {form.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
              <input className="form-control" type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '10' : '200'} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Max Uses</label>
              <input className="form-control" type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Expires At (optional)</label>
              <input className="form-control" type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
