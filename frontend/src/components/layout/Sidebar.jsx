import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  History,
  User,
  PlusCircle,
  Users,
  Building2,
  Building,
  GraduationCap,
  Compass
} from 'lucide-react';

export const Sidebar = ({ isCollapsed }) => {
  const { role } = useAuth();
  const normalizedRole = role ? role.toLowerCase() : '';

  const getNavLinks = () => {
    if (normalizedRole === 'student') {
      return [
        { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/student/events', label: 'Browse Events', icon: Calendar },
        { to: '/student/applications', label: 'My Applications', icon: ClipboardList },
        { to: '/student/history', label: 'Participation History', icon: History },
        { to: '/student/profile', label: 'My Profile', icon: User },
      ];
    }

    if (normalizedRole === 'faculty') {
      return [
        { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/faculty/explore', label: 'Explore Events', icon: Compass },
        { to: '/faculty/events', label: 'Manage Events', icon: Calendar },
        { to: '/faculty/events/new', label: 'Create New Event', icon: PlusCircle },
        { to: '/faculty/profile', label: 'Faculty Profile', icon: User },
      ];
    }

    if (normalizedRole === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/admin/events', label: 'Manage Events', icon: Calendar },
        { to: '/admin/applications', label: 'All Applications', icon: ClipboardList },
        { to: '/admin/students', label: 'Students Directory', icon: GraduationCap },
        { to: '/admin/faculty', label: 'Faculty Directory', icon: Users },
        { to: '/admin/institutes', label: 'Institutes', icon: Building2 },
        { to: '/admin/departments', label: 'Departments', icon: Building },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <aside style={{
      width: isCollapsed ? '76px' : '240px',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      transition: 'width 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: '6px',
      flexShrink: 0
    }}>
      {navLinks.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith('/dashboard') || item.to === '/admin/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: isCollapsed ? '12px 0' : '11px 16px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: '8px',
              color: isActive ? '#2563eb' : '#475569',
              background: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'background 0.2s ease, color 0.2s ease'
            })}
            title={item.label}
          >
            <Icon size={20} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
