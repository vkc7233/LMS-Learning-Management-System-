import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Shared
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCoupons from './pages/admin/AdminCoupons';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetail from './pages/student/CourseDetail';
import MyEnrollments from './pages/student/MyEnrollments';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'instructor') return <Navigate to="/instructor" replace />;
  return <Navigate to="/student" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RoleHome />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><DashboardLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>

          {/* Instructor Routes */}
          <Route path="/instructor" element={<PrivateRoute roles={['instructor']}><DashboardLayout /></PrivateRoute>}>
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute roles={['student']}><DashboardLayout /></PrivateRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="catalog" element={<CourseCatalog />} />
            <Route path="catalog/:id" element={<CourseDetail />} />
            <Route path="enrollments" element={<MyEnrollments />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
