import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import RoleBadge from '../../components/common/RoleBadge';
import Loader from '../../components/common/Loader';
import { ClipboardList, Calendar, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const { showError } = useToast();

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await studentService.getMyApplications(activeTab);
      setApplications(res.data || []);
    } catch {
      showError('Failed to fetch your applications list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Event Applications</h1>
          <p className="page-subtitle">
            Track your volunteer and coordination application statuses and faculty reviews.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              background: activeTab === tab ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Applications Content */}
      {isLoading ? (
        <Loader message="Loading your applications..." />
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 20px', color: '#64748b' }}>
          <ClipboardList size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            No {activeTab !== 'All' ? activeTab : ''} Applications Found
          </h3>
          <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
            {activeTab === 'All'
              ? 'You have not submitted any event applications yet.'
              : `You do not have any applications currently in "${activeTab}" status.`}
          </p>
          <Link to="/student/events" className="btn btn-primary btn-sm">
            Browse Open Opportunities
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Details</th>
                <th>Applied Role</th>
                <th>Event Date</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                        {app.eventId?.title || 'Unknown Event'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {app.eventId?.eventType && (
                          <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            {app.eventId.eventType}
                          </span>
                        )}
                        {app.eventId?.eventMode && (
                          <span style={{ fontSize: '11px', background: app.eventId.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb', color: app.eventId.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                            {app.eventId.eventMode}
                          </span>
                        )}
                        {app.eventId?.academicYear && (
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                            AY {app.eventId.academicYear}
                          </span>
                        )}
                      </div>
                      {app.eventId?.organizer && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Org: {app.eventId.organizer}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Level: {app.eventId?.eventLevel || 'University'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={app.appliedRole} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: '#334155' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#2563eb" />
                        {app.eventId?.eventDate ? new Date(app.eventId.eventDate).toLocaleDateString() : 'N/A'}
                      </span>
                      {app.eventId?.eventEndDate && new Date(app.eventId.eventEndDate).toLocaleDateString() !== new Date(app.eventId.eventDate).toLocaleDateString() && (
                        <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '20px' }}>
                          to {new Date(app.eventId.eventEndDate).toLocaleDateString()}
                        </span>
                      )}
                      {app.eventId?.eventDay && (
                        <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, paddingLeft: '20px' }}>
                          {app.eventId.eventDay} {app.eventId.eventDay === 1 ? 'Day' : 'Days'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    {app.eventId?._id && (
                      <Link
                        to={`/student/events/${app.eventId._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        View Event <ArrowRight size={12} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '14px 18px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e40af' }}>
        <strong>University Volunteering Policy:</strong> If an application was not selected (Rejected),
        it does not prevent you from applying again for the same event if it is still open and has remaining capacity.
      </div>
    </div>
  );
};

export default MyApplicationsPage;
