import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotAuthorizedPage = () => {
  const { role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        textAlign: 'center',
        background: '#ffffff',
        padding: '48px 32px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ef4444'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Access Restricted (403)
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
          You do not possess the required university role permissions to view this section.
        </p>
        <Link to={getDashboardLink()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Go to My Portal Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
