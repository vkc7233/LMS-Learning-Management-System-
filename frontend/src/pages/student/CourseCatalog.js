import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const LEVELS = ['All', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['All', 'Web Development', 'Backend', 'Database', 'Mobile', 'Data Science', 'DevOps'];

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [category, setCategory] = useState('All');
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/auth/me')]).then(([cRes, mRes]) => {
      setCourses(cRes.data.courses);
      setEnrolledIds((mRes.data.user.enrolledCourses || []).map(c => c._id || c));
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        c.description.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'All' || c.level === level;
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchLevel && matchCat;
  });

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Course Catalog</h1><p>{courses.length} courses available</p></div>
      </div>

      {/* Filters */}
      <div className="search-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="search-input-wrap" style={{ flex: '1 1 220px' }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 140 }} value={level} onChange={e => setLevel(e.target.value)}>
          {LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No courses match your filters</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.includes(course._id);
            return (
              <Link key={course._id} to={`/student/catalog/${course._id}`} style={{ textDecoration: 'none' }}>
                <div className="course-card">
                  <div style={{ position: 'relative' }}>
                    <img
                      src={course.thumbnail || `https://placehold.co/600x400/0D9488/white?text=${encodeURIComponent(course.title)}`}
                      alt={course.title}
                    />
                    {isEnrolled && (
                      <span style={{ position: 'absolute', top: 8, right: 8 }} className="enrolled-badge">✓ Enrolled</span>
                    )}
                  </div>
                  <div className="course-card-body">
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{course.level}</span>
                      <span className="badge badge-purple">{course.category}</span>
                    </div>
                    <div className="course-card-title">{course.title}</div>
                    <div className="course-card-desc">{course.description}</div>
                    <div className="course-card-meta">
                      <span className={`course-price ${course.price === 0 ? 'free' : ''}`}>
                        {course.price === 0 ? 'FREE' : `₹${course.price}`}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        by {course.instructor?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
