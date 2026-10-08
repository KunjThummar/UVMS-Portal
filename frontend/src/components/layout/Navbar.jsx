import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Shield, GraduationCap, Briefcase } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r === 'student') {
      return (
        <span 
          className="navbar-role-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          <GraduationCap size={14} /> Student Portal
        </span>
      );
    }
    if (r === 'faculty') {
      return (
        <span 
          className="navbar-role-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#faf5ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          <Briefcase size={14} /> Faculty Portal
        </span>
      );
    }
    return (
      <span 
        className="navbar-role-badge"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        <Shield size={14} /> Administrator
      </span>
    );
  };

  return (
    <header className="navbar-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            color: '#475569'
          }}
          title="Toggle Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src={logoImg} alt="CHARUSAT" style={{ height: '36px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              CHARUSAT UVMS
            </span>
            <span className="navbar-subtext" style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Volunteer Management System
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getRoleBadge()}

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '8px',
            borderLeft: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              flexShrink: 0
            }}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }} className="user-text-hide">
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                {user?.fullName || 'User'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {user?.studentId || user?.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{
            borderColor: '#fecaca',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px'
          }}
          title="Sign out of account"
        >
          <LogOut size={14} />
          <span className="hide-on-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
