import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import { getUserRole, isAuthenticated } from './utils/auth';

// Protected Route Component with role checking
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('access_token');

  if (!token || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard if wrong role
      return <Navigate to={`/${userRole === 'admin' ? 'admin' : userRole === 'department' ? 'department' : 'dashboard'}`} replace />;
    }
  }

  return children;
};

// Auto-redirect to appropriate dashboard
const AutoRedirect = () => {
  const role = getUserRole();
  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'department':
      return <Navigate to="/department" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Dashboard - Only for admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Department Dashboard - Only for department role */}
          <Route
            path="/department"
            element={
              <ProtectedRoute allowedRoles={['department']}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Dashboard - For regular users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Root path - redirect based on role */}
          <Route path="/" element={
            isAuthenticated() ? <AutoRedirect /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
