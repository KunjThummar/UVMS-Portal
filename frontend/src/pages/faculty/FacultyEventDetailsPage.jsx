import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import facultyEventService from '../../services/facultyEventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  Building2,
  Building,
  User,
  Mail,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const FacultyEventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await facultyEventService.getEventById(id);
        setEvent(res.data || null);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load event details';
        showError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return <Loader message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Event Not Found</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>
          This event could not be found or you may not have permission to view it.
        </p>
        <Link to="/faculty/explore" className="btn btn-primary btn-sm">
          Return to Explore Events
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = new Date(event.applicationDeadline) < new Date();
  const capacityPercent = Math.min(
    100,
    Math.round(((event.approvedCount || 0) / (event.volunteerCapacity || 1)) * 100)
  );

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => navigate('/faculty/explore')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} /> Back to Explore Events
        </button>
      </div>

      {/* Faculty Notice: Read-only */}
      <div style={{
        background: '#f5f3ff',
        border: '1px solid #ddd6fe',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#5b21b6'
      }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Faculty Information Mode:</strong> You are viewing details for this university event.
          Application and volunteer registration controls are restricted to students.
        </span>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="event-details-grid">
        {/* Left Column: Event Core Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            {/* Top metadata tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#7c3aed',
                background: '#f5f3ff',
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                {event.eventLevel} Level Event
              </span>
              {event.eventType && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2563eb',
                  background: '#eff6ff',
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
              <StatusBadge status={event.status} />
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
              {event.title}
            </h1>

            {/* Organizer Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', marginBottom: '24px', flexWrap: 'wrap' }}>
              <Building2 size={16} />
              <span>Organizer: <strong style={{ color: '#334155' }}>{event.organizer}</strong></span>
              {event.subOrganizer && (
                <span>• Sub-Organizer: <strong style={{ color: '#334155' }}>{event.subOrganizer}</strong></span>
              )}
              {event.academicYear && (
                <span>• AY: <strong>{event.academicYear}</strong></span>
              )}
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                Event Overview & Description
              </h3>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </p>
            </div>
          </div>

          {/* Scope and Target Criteria */}
          {(event.eventLevel === 'Institute' || event.eventLevel === 'Department') && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>
                Eligible Target Scope
              </h3>

              {event.targetInstituteIds && event.targetInstituteIds.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                    Target Institutes:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {event.targetInstituteIds.map((inst) => (
                      <span key={inst._id || inst} style={{ fontSize: '12px', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {inst.name || inst.code || inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.targetDepartmentIds && event.targetDepartmentIds.length > 0 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                    Target Departments:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {event.targetDepartmentIds.map((dept) => (
                      <span key={dept._id || dept} style={{ fontSize: '12px', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {dept.name || dept.code || dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Schedule, Capacity, Coordinator sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Schedule & Timing Card */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Schedule & Timing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Start Date</span>
                <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#2563eb" /> {new Date(event.eventDate).toLocaleDateString()}
                </span>
              </div>

              {event.eventEndDate && (
                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>End Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#2563eb" /> {new Date(event.eventEndDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Duration</span>
                <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                  {event.eventDay || 1} {(event.eventDay || 1) === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Application Deadline</span>
                <span style={{ fontWeight: 600, color: isDeadlinePassed ? '#ef4444' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> {new Date(event.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Volunteer Capacity Card */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>
              Volunteer Capacity
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>
                {event.approvedCount || 0}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                of {event.volunteerCapacity} filled
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div
                style={{
                  width: `${capacityPercent}%`,
                  height: '100%',
                  background: capacityPercent >= 100 ? '#ef4444' : '#2563eb',
                  borderRadius: '4px'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{capacityPercent}% filled</span>
          </div>

          {/* Event Coordinator Info */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              Faculty Coordinator
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
                <User size={15} color="#7c3aed" />
                <span>{event.createdBy?.fullName || 'Faculty Organizer'}</span>
              </div>
              {event.createdBy?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                  <Mail size={13} />
                  <span>{event.createdBy.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyEventDetailsPage;
