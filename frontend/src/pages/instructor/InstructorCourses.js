import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const EMPTY_COURSE = { title: '', description: '', price: '', category: '', level: 'beginner', thumbnail: '' };
const EMPTY_LESSON = { title: '', content: '', videoUrl: '', duration: '' };

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  const fetchCourses = async () => {
    const { data } = await api.get('/courses/instructor/my-courses');
    setCourses(data.courses);
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, []);

  const openCreateCourse = () => { setEditCourse(null); setCourseForm(EMPTY_COURSE); setError(''); setShowCourseModal(true); };
  const openEditCourse = (c) => {
    setEditCourse(c);
    setCourseForm({ title: c.title, description: c.description, price: c.price, category: c.category, level: c.level, thumbnail: c.thumbnail });
    setError(''); setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    setError(''); setSaving(true);
    try {
      if (editCourse) await api.put(`/courses/${editCourse._id}`, courseForm);
      else await api.post('/courses', courseForm);
      setShowCourseModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving course');
    } finally { setSaving(false); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    fetchCourses();
    if (selectedCourse?._id === id) setSelectedCourse(null);
  };

  const openAddLesson = (course) => {
    setSelectedCourse(course);
    setLessonForm(EMPTY_LESSON);
    setError('');
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    setError(''); setSaving(true);
    try {
      await api.post(`/courses/${selectedCourse._id}/lessons`, lessonForm);
      setShowLessonModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving lesson');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>My Courses</h1><p>Create and manage your course content</p></div>
        <button className="btn btn-primary" onClick={openCreateCourse}>+ New Course</button>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses yet</h3>
            <p>Create your first course to start teaching</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreateCourse}>Create Course</button>
          </div>
        </div>
      ) : (
        courses.map(course => (
          <div key={course._id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img
                src={course.thumbnail || 'https://placehold.co/120x80/0D9488/white?text=Course'}
                alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{course.title}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{course.level}</span>
                      <span className="badge badge-purple">{course.category}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>₹{course.price}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👥 {course.enrolledStudents?.length || 0} students</span>
                    </div>
                  </div>
                  <div className="actions-cell">
                    <button className="btn btn-secondary btn-sm" onClick={() => openAddLesson(course)}>+ Lesson</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditCourse(course)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                  </div>
                </div>

                {/* Lessons list */}
                {course.lessons?.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      {course.lessons.length} Lessons
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {course.lessons.map((lesson, i) => (
                        <div key={lesson._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg)', borderRadius: 6 }}>
                          <span style={{ width: 22, height: 22, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{lesson.title}</span>
                          {lesson.duration > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{lesson.duration} min</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <Modal
          title={editCourse ? 'Edit Course' : 'Create Course'}
          onClose={() => setShowCourseModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveCourse} disabled={saving}>{saving ? 'Saving...' : 'Save Course'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Title</label><input className="form-control" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Price (₹)</label><input className="form-control" type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} /></div>
            <div className="form-group"><label>Category</label><input className="form-control" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} /></div>
          </div>
          <div className="form-group">
            <label>Level</label>
            <select className="form-control" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group"><label>Thumbnail URL</label><input className="form-control" value={courseForm.thumbnail} onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })} placeholder="https://..." /></div>
        </Modal>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <Modal
          title={`Add Lesson — ${selectedCourse?.title}`}
          onClose={() => setShowLessonModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveLesson} disabled={saving}>{saving ? 'Saving...' : 'Add Lesson'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Lesson Title</label><input className="form-control" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Introduction to React Hooks" /></div>
          <div className="form-group"><label>Content / Description</label><textarea className="form-control" rows={4} value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="What this lesson covers..." /></div>
          <div className="form-row">
            <div className="form-group"><label>Video URL (optional)</label><input className="form-control" value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></div>
            <div className="form-group"><label>Duration (minutes)</label><input className="form-control" type="number" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} placeholder="15" /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
