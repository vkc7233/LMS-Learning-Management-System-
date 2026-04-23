import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${editUser._id}`, form);
      setMsg('User updated!');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Users</h1><p>{users.length} registered accounts</p></div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'instructor' ? 'info' : 'success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div>}
        </div>
      </div>

      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>}
        >
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
