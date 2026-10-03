import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import facultyEventService from '../../services/facultyEventService';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useToast();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const res = await facultyEventService.getAllEvents();
        setEvents(res.data || []);
      } catch {
        showError('Could not load faculty events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (isLoading) {
    return <Loader message="Loading faculty portal..." />;
  }

  const myEvents = events.filter((e) => {
    const ownerId = (e.createdBy?._id || e.createdBy)?.toString();
    const currentId = (user?._id || user?.id)?.toString();
    return ownerId === currentId;
  });

  const activeEvents = myEvents.filter((e) => e.status === 'Open');
  const totalCapacity = myEvents.reduce((acc, curr) => acc + (curr.volunteerCapacity || 0), 0);
  const totalApproved = myEvents.reduce((acc, curr) => acc + (curr.approvedCount || 0), 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            <Briefcase size={14} color="#fde047" />
            <span>Faculty Event Management</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Welcome, Professor {user?.fullName}!
          </h1>
          <p style={{ fontSize: '14px', color: '#ede9fe' }}>
            Publish campus volunteer opportunities, evaluate applicant experience, and coordinate student teams.
          </p>
        </div>

        <Link to="/faculty/events/new" className="btn" style={{ background: '#ffffff', color: '#5b21b6', fontWeight: 700 }}>
          <PlusCircle size={16} /> Create New Event
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-val">{myEvents.length}</div>
            <div className="stat-label">Total Events Created</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-val">{activeEvents.length}</div>
            <div className="stat-label">Active Open Events</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{totalApproved}</div>
            <div className="stat-label">Volunteers Mobilized</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-val">{totalCapacity}</div>
            <div className="stat-label">Total Capacity Target</div>
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Recent Events</h3>
          <Link to="/faculty/events" style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 600 }}>
            Manage All Events ({myEvents.length}) →
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              No Events Created Yet
            </h3>
            <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              Publish your first campus event to begin recruiting student volunteers and coordinators.
            </p>
            <Link to="/faculty/events/new" className="btn btn-primary btn-sm" style={{ background: '#7c3aed' }}>
              <PlusCircle size={15} /> Publish An Event
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Level</th>
                  <th>Event Date</th>
                  <th>Capacity Filled</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.slice(0, 5).map((ev) => (
                  <tr key={ev._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {ev.title}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        {ev.eventLevel}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#334155' }}>
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                        {ev.approvedCount || 0} / {ev.volunteerCapacity}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={ev.status} />
                    </td>
                    <td>
                      <Link
                        to={`/faculty/events/${ev._id}/applications`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        Review Applicants <ArrowRight size={13} />
                      </Link>
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

export default FacultyDashboardPage;
