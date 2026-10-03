import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import RoleBadge from '../../components/common/RoleBadge';
import Loader from '../../components/common/Loader';
import { Award, Calendar, CheckCircle2, History, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentHistoryPage = () => {
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await studentService.getParticipationHistory();
        setHistoryData(res.data || null);
      } catch {
        showError('Failed to load your participation history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loader message="Loading participation track record..." />;
  }

  const roleBreakdown = historyData?.roleBreakdown || { Coordinator: 0, 'Sub-Coordinator': 0, Volunteer: 0 };
  const historyList = historyData?.history || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Participation History</h1>
          <p className="page-subtitle">
            Your verified volunteer, coordinator, and event leadership history at CHARUSAT.
          </p>
        </div>
      </div>

      {/* Role Breakdown KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-val">{historyData?.totalParticipations || 0}</div>
            <div className="stat-label">Total Verified Events</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Shield size={26} />
          </div>
          <div>
            <div className="stat-val">{roleBreakdown.Coordinator || 0}</div>
            <div className="stat-label">As Coordinator</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{roleBreakdown['Sub-Coordinator'] || 0}</div>
            <div className="stat-label">As Sub-Coordinator</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-val">{roleBreakdown.Volunteer || 0}</div>
            <div className="stat-label">As Volunteer</div>
          </div>
        </div>
      </div>

      {/* Event Timeline Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Completed & Approved Events ({historyList.length})</h3>
        </div>

        {historyList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: '#64748b' }}>
            <History size={42} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              No Participation History Yet
            </h3>
            <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              Once your event applications are approved and you participate in campus events,
              they will be permanently logged here in your verified portfolio.
            </p>
            <Link to="/student/events" className="btn btn-primary btn-sm">
              Explore Open Events
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
                  <th>Role Served</th>
                  <th>Faculty Organizer</th>
                  <th>Approval Date</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                          {item.eventId?.title || 'University Event'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {item.eventId?.eventType && (
                            <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                              {item.eventId.eventType}
                            </span>
                          )}
                          {item.eventId?.eventMode && (
                            <span style={{ fontSize: '11px', background: item.eventId.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb', color: item.eventId.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                              {item.eventId.eventMode}
                            </span>
                          )}
                          {item.eventId?.academicYear && (
                            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                              AY {item.eventId.academicYear}
                            </span>
                          )}
                        </div>
                        {item.eventId?.organizer && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Org: {item.eventId.organizer}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {item.eventId?.eventLevel || 'University'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#334155' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#2563eb" />
                          {item.eventId?.eventDate ? new Date(item.eventId.eventDate).toLocaleDateString() : 'N/A'}
                        </span>
                        {item.eventId?.eventEndDate && new Date(item.eventId.eventEndDate).toLocaleDateString() !== new Date(item.eventId.eventDate).toLocaleDateString() && (
                          <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '20px' }}>
                            to {new Date(item.eventId.eventEndDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={item.appliedRole} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      {item.eventId?.createdBy?.fullName || 'Faculty Organizer'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        {item.decisionAt ? new Date(item.decisionAt).toLocaleDateString() : 'Verified'}
                      </span>
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

export default StudentHistoryPage;
