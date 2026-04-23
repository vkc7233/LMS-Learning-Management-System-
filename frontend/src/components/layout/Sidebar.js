import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/payments', label: 'Payments', icon: '💳' },
  { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
];

const instructorLinks = [
  { to: '/instructor', label: 'Dashboard', icon: '📊', end: true },
  { to: '/instructor/courses', label: 'My Courses', icon: '📚' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '📊', end: true },
  { to: '/student/catalog', label: 'Browse Courses', icon: '🔍' },
  { to: '/student/enrollments', label: 'My Courses', icon: '🎓' },
];

const linksByRole = { admin: adminLinks, instructor: instructorLinks, student: studentLinks };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 'var(--sidebar-w)', height: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'white', borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--primary)' }}>
          LearnHub
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
          {user?.role} Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {links.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 4, fontSize: 14, fontWeight: 600,
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            background: isActive ? 'var(--primary-light)' : 'transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
