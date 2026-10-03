import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import RoleBadge from '../../components/common/RoleBadge';
import ApplyModal from '../../components/applications/ApplyModal';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Share2
} from 'lucide-react';

export const StudentEventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [event, setEvent] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const fetchEventData = async () => {
    setIsLoading(true);
    setErrorDetails('');
    try {
      const [eventRes, myAppsRes] = await Promise.all([
        studentService.getEventById(id),
        studentService.getMyApplications()
      ]);

      setEvent(eventRes.data || null);

      // Check if student already applied for this event
      const app = (myAppsRes.data || []).find((a) => {
        const appEventId = a.eventId?._id || a.eventId;
        return appEventId === id && (a.status === 'Pending' || a.status === 'Approved');
      });
      setExistingApplication(app || null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load event details';
      setErrorDetails(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  if (isLoading) {
    return <Loader message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Event Not Available</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>
          {errorDetails || 'This event could not be found or you may not be eligible to view it based on department/institute criteria.'}
        </p>
        <Link to="/student/events" className="btn btn-primary btn-sm">
          Return to Events
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = new Date(event.applicationDeadline) < new Date();
  const isOpen = event.status === 'Open' && !isDeadlinePassed;
  const capacityPercent = Math.min(
    100,
    Math.round(((event.approvedCount || 0) / (event.volunteerCapacity || 1)) * 100)
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/student/events')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} /> Back to Events List
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="event-details-grid">
        {/* Main Event Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  background: '#eff6ff',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {event.eventLevel} Level Event
                </span>

                {event.eventType && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#7c3aed',
                    background: '#f5f3ff',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {event.eventType}
                  </span>
                )}

                {event.eventMode && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: event.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706',
                    background: event.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    textTransform: 'capitalize'
                  }}>
                    {event.eventMode} Mode
                  </span>
                )}

                {event.academicYear && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    AY: {event.academicYear}
                  </span>
                )}

                {event.eventLevel === 'Institute' && Array.isArray(event.targetInstituteIds) && event.targetInstituteIds.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    Target Institutes: {event.targetInstituteIds.map((i) => i.code || i.name || i).join(', ')}
                  </span>
                )}

                {event.eventLevel === 'Department' && Array.isArray(event.targetDepartmentIds) && event.targetDepartmentIds.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#7c3aed',
                    background: '#f5f3ff',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    Target Departments: {event.targetDepartmentIds.map((d) => d.code || d.name || d).join(', ')}
                  </span>
                )}
              </div>
              <StatusBadge status={event.status} />
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.2 }}>
              {event.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              flexWrap: 'wrap',
              fontSize: '13px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Calendar size={16} color="#2563eb" />
                <strong>Starts:</strong> {new Date(event.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              {event.eventEndDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <Calendar size={16} color="#7c3aed" />
                  <strong>Ends:</strong> {new Date(event.eventEndDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Clock size={16} color="#059669" />
                <strong>Duration:</strong> {event.eventDay || 1} {(event.eventDay || 1) === 1 ? 'Day' : 'Days'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Clock size={16} color={isDeadlinePassed ? '#ef4444' : '#d97706'} />
                <strong>Deadline:</strong> {new Date(event.applicationDeadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Users size={16} color="#7c3aed" />
                <strong>Capacity:</strong> {event.approvedCount || 0} / {event.volunteerCapacity} Filled
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                About this Opportunity
              </h3>
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {event.description}
              </div>
            </div>

            {/* Organizer Info */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {event.organizer && (
                <div>
                  <span>Organizing Institute: </span>
                  <strong style={{ color: '#1e293b' }}>{event.organizer}</strong>
                  {event.subOrganizer && (
                    <span style={{ color: '#64748b' }}> ({event.subOrganizer})</span>
                  )}
                </div>
              )}
              <div>
                <span>Faculty Coordinator: </span>
                <strong style={{ color: '#1e293b' }}>
                  {event.createdBy?.fullName || 'University Faculty'}
                </strong>
                {event.createdBy?.email && (
                  <span style={{ color: '#64748b' }}> ({event.createdBy.email})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Action Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Application Status
            </h3>

            {existingApplication ? (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, marginBottom: '6px' }}>
                  <CheckCircle2 size={18} />
                  <span>You Have Applied!</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#047857' }}>
                  <span><strong>Role Applied:</strong> <RoleBadge role={existingApplication.appliedRole} /></span>
                  <span><strong>Status:</strong> <StatusBadge status={existingApplication.status} /></span>
                  <span style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                    Submitted on {new Date(existingApplication.appliedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <Link to="/student/applications" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View in My Applications
                  </Link>
                </div>
              </div>
            ) : isOpen ? (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '18px' }}>
                  Applications are currently open! You can apply for a Volunteer, Sub-Coordinator, or Coordinator role.
                </p>
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Apply Now
                </button>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}>
                <AlertCircle size={28} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <strong style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Applications are Closed
                </strong>
                {isDeadlinePassed ? 'The application deadline for this event has passed.' : 'Volunteer capacity has been filled.'}
              </div>
            )}

            {/* Capacity Visual */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Slots Filled</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{capacityPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${capacityPercent}%`,
                    height: '100%',
                    background: capacityPercent >= 100 ? '#7c3aed' : '#2563eb'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal with Role Selection */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        event={event}
        onApplicationSuccess={fetchEventData}
      />
    </div>
  );
};

export default StudentEventDetailsPage;
