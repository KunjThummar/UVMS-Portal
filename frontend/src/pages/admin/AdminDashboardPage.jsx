import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminEventService from '../../services/adminEventService';
import userService from '../../services/userService';
import instituteService from '../../services/instituteService';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import {
  Shield,
  Calendar,
  ClipboardList,
  GraduationCap,
  Users,
  Building2,
  Building,
  ArrowRight,
  Plus
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [counts, setCounts] = useState({
    events: 0,
    applications: 0,
    students: 0,
    faculty: 0,
    institutes: 0,
    departments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [evRes, appRes, studRes, facRes, instRes, deptRes] = await Promise.all([
          adminEventService.getAllEvents(),
          adminEventService.getAllApplications(),
          userService.listStudents(),
          userService.listFaculty(),
          instituteService.listInstitutes(),
          departmentService.listDepartments()
        ]);

        const instList = Array.isArray(instRes) ? instRes : (instRes.data || []);
        const deptList = Array.isArray(deptRes) ? deptRes : (deptRes.data || []);

        setCounts({
          events: evRes.data?.length || 0,
          applications: appRes.data?.length || 0,
          students: studRes.data?.length || 0,
          faculty: facRes.data?.length || 0,
          institutes: instList.length,
          departments: deptList.length
        });
      } catch {
        showError('Could not fetch administrator statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return <Loader message="Loading platform overview..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            <Shield size={14} color="#94a3b8" />
            <span>Central Management Console</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            CHARUSAT University Control Hub
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Platform-wide governance, event supervision, user accounts, and university structure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/institutes" className="btn btn-primary btn-sm" style={{ background: '#2563eb' }}>
            <Building2 size={15} /> Manage Institutes
          </Link>
          <Link to="/admin/events" className="btn btn-secondary btn-sm">
            <Calendar size={15} /> Supervise Events
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.students}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.faculty}</div>
            <div className="stat-label">Faculty Coordinators</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.events}</div>
            <div className="stat-label">Total Platform Events</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <ClipboardList size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.applications}</div>
            <div className="stat-label">Processed Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.institutes}</div>
            <div className="stat-label">University Institutes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f8fafc', color: '#475569' }}>
            <Building size={26} />
          </div>
          <div>
            <div className="stat-val">{counts.departments}</div>
            <div className="stat-label">Active Departments</div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Link to="/admin/students" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Students Directory</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Inspect student records, mobile numbers, active status</p>
          </div>
          <ArrowRight size={20} color="#2563eb" />
        </Link>

        <Link to="/admin/faculty" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Faculty Directory</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Manage faculty coordinators and department allocations</p>
          </div>
          <ArrowRight size={20} color="#7c3aed" />
        </Link>

        <Link to="/admin/applications" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Master Applications</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>View all volunteer and coordinator applications across events</p>
          </div>
          <ArrowRight size={20} color="#059669" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
