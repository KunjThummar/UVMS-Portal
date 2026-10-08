import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import facultyEventService from '../../services/facultyEventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import RoleBadge from '../../components/common/RoleBadge';
import PastHistoryModal from '../../components/applications/PastHistoryModal';
import Loader from '../../components/common/Loader';
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Phone,
  Mail,
  Search,
  History
} from 'lucide-react';

export const FacultyApplicationsPage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();

  const [event, setEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected student for Past History modal
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [selectedPastHistoryList, setSelectedPastHistoryList] = useState([]);

  // Action states
  const [actionInProgressId, setActionInProgressId] = useState(null);

  const fetchEventAndApplications = async () => {
    try {
      const [eventRes, appsRes] = await Promise.all([
        facultyEventService.getEventById(id),
        facultyEventService.getApplicationsForEvent(id, activeStatusTab)
      ]);

      setEvent(eventRes.data || null);
      setApplications(appsRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load event applications';
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndApplications();
  }, [id, activeStatusTab]);

  const handleApprove = async (appId, studentName) => {
    setActionInProgressId(appId);
    try {
      await facultyEventService.approveApplication(appId);
      showSuccess(`Application for ${studentName} approved!`);
      // Refetch full list so capacity counters update atomically
      fetchEventAndApplications();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Approval failed';
      showError(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (appId, studentName) => {
    setActionInProgressId(appId);
    try {
      await facultyEventService.rejectApplication(appId);
      showSuccess(`Application for ${studentName} rejected.`);
      fetchEventAndApplications();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Rejection failed';
      showError(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleOpenPastHistory = (student, pastParticipations) => {
    setSelectedStudentForHistory(student);
    setSelectedPastHistoryList(pastParticipations || []);
  };

  // Filter applications by search query
  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = app.fullName?.toLowerCase().includes(q) || app.studentId?.fullName?.toLowerCase().includes(q);
    const idMatch = app.studentIdNumber?.toLowerCase().includes(q) || app.studentId?.studentId?.toLowerCase().includes(q);
    const emailMatch = app.email?.toLowerCase().includes(q);
    const roleMatch = app.appliedRole?.toLowerCase().includes(q);
    return nameMatch || idMatch || emailMatch || roleMatch;
  });

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;

  if (isLoading) {
    return <Loader message="Loading applicants and review history..." />;
  }

  if (!event) {
    return (
      <div>
        <div style={{ marginBottom: '18px' }}>
          <Link to="/faculty/events" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} /> Back to Events Management
          </Link>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>Unable to Load Event Applications</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>The event could not be found or you may not be authorized to view its applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <Link to="/faculty/events" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={15} /> Back to Events Management
        </Link>
      </div>

      {/* Event Header Banner */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {event?.eventLevel} Level Event
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {event?.title}
            </h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#2563eb" /> {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#d97706" /> Deadline: {event?.applicationDeadline ? new Date(event.applicationDeadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
                {event?.approvedCount || approvedCount} / {event?.volunteerCapacity}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Capacity Filled</div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Awaiting Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: activeStatusTab === tab ? '#7c3aed' : '#ffffff',
                color: activeStatusTab === tab ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: activeStatusTab === tab ? '#7c3aed' : '#e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%', flex: '1 1 200px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '13px' }}
            placeholder="Search applicant name, ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Applicants Table */}
      {filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Applicants Found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            {activeStatusTab !== 'All'
              ? `No applicants currently under "${activeStatusTab}" status.`
              : 'No students have applied for this event yet.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Information</th>
                <th>Contact</th>
                <th>Role Applied</th>
                <th>Past Experience</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Decision Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const studentData = app.studentId || {};
                const studentName = app.fullName || studentData.fullName || 'Student';
                const studentIdNumber = app.studentIdNumber || studentData.studentId || 'N/A';
                const mobile = app.mobileNumber || studentData.mobileNumber || 'N/A';
                const pastCount = app.pastParticipationCount || 0;
                const isPending = app.status === 'Pending';
                const isProcessing = actionInProgressId === app._id;

                return (
                  <tr key={app._id}>
                    {/* Student Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                          {studentName}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          ID: {studentIdNumber} • Sem {app.semester || studentData.semester}
                        </span>
                      </div>
                    </td>

                    {/* Contact (Mobile & Email) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: '#334155' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Phone size={12} color="#2563eb" /> {mobile}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                          <Mail size={12} /> {app.email || studentData.email}
                        </span>
                      </div>
                    </td>

                    {/* Applied Role */}
                    <td>
                      <RoleBadge role={app.appliedRole} />
                    </td>

                    {/* Past Experience & Participation Track */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        {pastCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPastHistory(studentData.fullName ? studentData : { fullName: studentName, studentId: studentIdNumber, email: app.email, mobileNumber: mobile }, app.pastParticipations)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="View student's previous approved events and roles"
                          >
                            <History size={12} /> {pastCount} Past Event{pastCount > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>First-time applicant</span>
                        )}

                        {app.previousExperience && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', maxWidth: '180px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.previousExperience}>
                            "{app.previousExperience}"
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ background: '#059669', fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => handleApprove(app._id, studentName)}
                            disabled={isProcessing}
                            title="Approve applicant"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => handleReject(app._id, studentName)}
                            disabled={isProcessing}
                            title="Reject applicant"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Decided on {app.decisionAt ? new Date(app.decisionAt).toLocaleDateString() : 'Record'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Past History Modal */}
      <PastHistoryModal
        isOpen={Boolean(selectedStudentForHistory)}
        onClose={() => setSelectedStudentForHistory(null)}
        student={selectedStudentForHistory}
        pastParticipations={selectedPastHistoryList}
      />
    </div>
  );
};

export default FacultyApplicationsPage;
