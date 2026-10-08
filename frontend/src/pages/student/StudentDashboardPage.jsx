import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import studentService from '../../services/studentService';
import StatusBadge from '../../components/common/StatusBadge';
import RoleBadge from '../../components/common/RoleBadge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  History,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useToast();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibleEventsCount, setEligibleEventsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profileRes, appsRes, eventsRes] = await Promise.all([
          studentService.getProfile(),
          studentService.getMyApplications(),
          studentService.getEligibleEvents({ status: 'Open' })
        ]);

        setProfile(profileRes.data || null);
        setApplications(appsRes.data || []);
        setEligibleEventsCount(eventsRes.data ? eventsRes.data.length : 0);
      } catch (err) {
        showError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <Loader message="Loading student dashboard..." />;
  }

  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={14} color="#fde047" />
            <span>CHARUSAT Volunteer Hub</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Welcome, {profile?.fullName || user?.fullName}!
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#dbeafe' }}>
            <span><strong>ID:</strong> {profile?.studentId || user?.studentId}</span>
            <span>•</span>
            <span>{profile?.instituteId?.code || '—'} • {profile?.departmentId?.name || '—'}</span>
            <span>•</span>
            <span>Semester {profile?.semester}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} /> {profile?.mobileNumber || 'No mobile set'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/student/events" className="btn" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 600 }}>
            Browse Open Events
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-val">{eligibleEventsCount}</div>
            <div className="stat-label">Open Eligible Events</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <ClipboardList size={26} />
          </div>
          <div>
            <div className="stat-val">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-val">{pendingCount}</div>
            <div className="stat-label">Pending Decisions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-val">{profile?.totalParticipations ?? approvedCount}</div>
            <div className="stat-label">Past Participations</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <Link to="/student/events" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Explore Opportunities</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Find events and apply for Coordinator or Volunteer positions</p>
          </div>
          <ArrowRight size={20} color="#2563eb" />
        </Link>

        <Link to="/student/history" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Participation History</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Review your role breakdown and past volunteer record</p>
          </div>
          <History size={20} color="#7c3aed" />
        </Link>
      </div>

      {/* Recent Applications Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Recent Applications</h3>
          <Link to="/student/applications" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
            View All ({applications.length}) →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '14px' }}>
            You have not applied to any events yet.
            <div style={{ marginTop: '12px' }}>
              <Link to="/student/events" className="btn btn-primary btn-sm">
                Browse Opportunities Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Event Date</th>
                  <th>Applied Role</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {app.eventId?.title || 'Unknown Event'}
                    </td>
                    <td>
                      {app.eventId?.eventDate ? new Date(app.eventId.eventDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <RoleBadge role={app.appliedRole} />
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
