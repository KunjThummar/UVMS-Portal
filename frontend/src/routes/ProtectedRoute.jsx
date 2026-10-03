import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    // Determine the most appropriate login redirect
    const requestedPath = location.pathname;
    let targetLogin = '/';
    if (requestedPath.startsWith('/student')) targetLogin = '/login/student';
    else if (requestedPath.startsWith('/faculty')) targetLogin = '/login/faculty';
    else if (requestedPath.startsWith('/admin')) targetLogin = '/login/admin';

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  const normalizedAllowedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => r.toLowerCase())
    : [allowedRoles.toLowerCase()];

  if (!normalizedAllowedRoles.includes(role.toLowerCase())) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
