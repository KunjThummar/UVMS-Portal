import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import StudentLoginPage from '../pages/public/StudentLoginPage';
import FacultyLoginPage from '../pages/public/FacultyLoginPage';
import AdminLoginPage from '../pages/public/AdminLoginPage';
import StudentRegisterPage from '../pages/public/StudentRegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import NotAuthorizedPage from '../pages/NotAuthorizedPage';

// Student Pages
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import StudentEventListPage from '../pages/student/StudentEventListPage';
import StudentEventDetailsPage from '../pages/student/StudentEventDetailsPage';
import MyApplicationsPage from '../pages/student/MyApplicationsPage';
import StudentHistoryPage from '../pages/student/StudentHistoryPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';

// Faculty Pages
import FacultyDashboardPage from '../pages/faculty/FacultyDashboardPage';
import FacultyExploreEventsPage from '../pages/faculty/FacultyExploreEventsPage';
import FacultyEventDetailsPage from '../pages/faculty/FacultyEventDetailsPage';
import FacultyEventListPage from '../pages/faculty/FacultyEventListPage';
import FacultyEventFormPage from '../pages/faculty/FacultyEventFormPage';
import FacultyApplicationsPage from '../pages/faculty/FacultyApplicationsPage';
import FacultyProfilePage from '../pages/faculty/FacultyProfilePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminEventListPage from '../pages/admin/AdminEventListPage';
import AdminApplicationsPage from '../pages/admin/AdminApplicationsPage';
import AdminStudentsPage from '../pages/admin/AdminStudentsPage';
import AdminFacultyPage from '../pages/admin/AdminFacultyPage';
import AdminInstitutesPage from '../pages/admin/AdminInstitutesPage';
import AdminDepartmentsPage from '../pages/admin/AdminDepartmentsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/student" element={<StudentLoginPage />} />
      <Route path="/login/faculty" element={<FacultyLoginPage />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />
      <Route path="/register/student" element={<StudentRegisterPage />} />
      <Route path="/not-authorized" element={<NotAuthorizedPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="events" element={<StudentEventListPage />} />
        <Route path="events/:id" element={<StudentEventDetailsPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="history" element={<StudentHistoryPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboardPage />} />
        <Route path="explore" element={<FacultyExploreEventsPage />} />
        <Route path="explore/:id" element={<FacultyEventDetailsPage />} />
        <Route path="events" element={<FacultyEventListPage />} />
        <Route path="events/new" element={<FacultyEventFormPage />} />
        <Route path="events/:id/edit" element={<FacultyEventFormPage />} />
        <Route path="events/:id/applications" element={<FacultyApplicationsPage />} />
        <Route path="profile" element={<FacultyProfilePage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="events" element={<AdminEventListPage />} />
        <Route path="events/new" element={<FacultyEventFormPage />} />
        <Route path="events/:id/edit" element={<FacultyEventFormPage />} />
        <Route path="applications" element={<AdminApplicationsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="faculty" element={<AdminFacultyPage />} />
        <Route path="institutes" element={<AdminInstitutesPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
