import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const EMPTY_FORM = { title: '', description: '', price: '', category: '', level: 'beginner', thumbnail: '', isPublished: true };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    const { data } = await api.get('/courses');
    setCourses(data.courses);
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => { setEditCourse(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => { setEditCourse(c); setForm({ title: c.title, description: c.description, price: c.price, category: c.category, level: c.level, thumbnail: c.thumbnail, isPublished: c.isPublished }); setShowModal(true); };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse._id}`, form);
      } else {
        await api.post('/courses', form);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    fetchCourses();
  };

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Courses</h1><p>{courses.length} published courses</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Course</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Level</th><th>Price</th><th>Enrolled</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.category}</td>
                  <td><span className="badge badge-info">{c.level}</span></td>
                  <td>₹{c.price}</td>
                  <td>{c.enrolledStudents?.length || 0}</td>
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
          {courses.length === 0 && <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses yet</h3></div>}
        </div>
      </div>

      {showModal && (
        <Modal title={editCourse ? 'Edit Course' : 'Create Course'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="form-row">
            <div className="form-group"><label>Price (₹)</label><input className="form-control" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
            <div className="form-group"><label>Category</label><input className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Level</label>
              <select className="form-control" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group"><label>Published</label>
              <select className="form-control" value={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.value === 'true'})}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Thumbnail URL</label><input className="form-control" value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} /></div>
        </Modal>
      )}
    </div>
  );
}
