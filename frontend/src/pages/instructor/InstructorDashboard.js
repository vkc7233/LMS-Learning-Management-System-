import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/instructor/my-courses').then(({ data }) => {
      setCourses(data.courses);
      setLoading(false);
    });
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0);

  if (loading) return <div className="loading-center"><span className="spinner"></span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's how your courses are performing</p>
        </div>
        <Link to="/instructor/courses" className="btn btn-primary">+ New Course</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card colored">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-sub">Across all courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Courses</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-sub">Published & live</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Lessons</div>
          <div className="stat-value">{courses.reduce((s, c) => s + (c.lessons?.length || 0), 0)}</div>
          <div className="stat-sub">Across all courses</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Your Courses</h3>
        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses yet</h3>
            <p>Create your first course to get started</p>
            <Link to="/instructor/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Create Course</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Course</th><th>Level</th><th>Price</th><th>Students</th><th>Lessons</th></tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={c.thumbnail || 'https://placehold.co/60x40/0D9488/white?text=Course'} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                        <div>
                          <strong>{c.title}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.category}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{c.level}</span></td>
                    <td>₹{c.price}</td>
                    <td><strong>{c.enrolledStudents?.length || 0}</strong></td>
                    <td>{c.lessons?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
