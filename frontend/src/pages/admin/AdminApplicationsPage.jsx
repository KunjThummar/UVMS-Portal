import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminEventService from '../../services/adminEventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import RoleBadge from '../../components/common/RoleBadge';
import Loader from '../../components/common/Loader';
import {
  ClipboardList,
  Filter,
  Phone,
  Mail,
  RotateCcw,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId') || '';

  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventIdParam);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  const { showError } = useToast();

  // Load events list on mount for the event selector
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const res = await adminEventService.getAllEvents();
        setEventsList(res.data || []);
      } catch {
        showError('Could not fetch events list');
      } finally {
        setIsLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  // Sync selectedEventId with URL query param if present
  useEffect(() => {
    if (eventIdParam && eventIdParam !== selectedEventId) {
      setSelectedEventId(eventIdParam);
    }
  }, [eventIdParam]);

  // Fetch applications when selectedEventId or statusFilter changes
  useEffect(() => {
    const fetchApplications = async () => {
      // If no event selected, clear applications list
      if (!selectedEventId) {
        setApplications([]);
        return;
      }

      setIsLoadingApps(true);
      try {
        const filters = {};
        if (selectedEventId !== 'all') {
          filters.eventId = selectedEventId;
        }
        if (statusFilter && statusFilter !== 'All') {
          filters.status = statusFilter;
        }

        const res = await adminEventService.getAllApplications(filters);
        setApplications(res.data || []);
      } catch {
        showError('Could not fetch applications');
      } finally {
        setIsLoadingApps(false);
      }
    };

    fetchApplications();
  }, [selectedEventId, statusFilter]);

  const handleEventChange = (newId) => {
    setSelectedEventId(newId);
    if (newId && newId !== 'all') {
      setSearchParams({ eventId: newId });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSelectedEventId('');
    setStatusFilter('All');
    setSearchParams({});
  };

  const selectedEvent = eventsList.find((e) => e._id === selectedEventId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Applications Ledger</h1>
          <p className="page-subtitle">Select an event below to inspect and audit student volunteer & coordinator applications.</p>
        </div>
      </div>

      {/* Primary Event Selection & Status Filter Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Select Event to Inspect Applications:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ flex: 1, minWidth: '320px', fontSize: '14px', padding: '10px 14px', borderColor: selectedEventId ? '#2563eb' : '#cbd5e1' }}
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                disabled={isLoadingEvents}
              >
                <option value="">-- Choose an Event to View Applications --</option>
                <option value="all">★ All Events (University-wide Ledger)</option>
                {eventsList.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    [{ev.status}] {ev.title} — {ev.organizer} ({ev.academicYear || (ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A')})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              {selectedEventId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    className="form-select"
                    style={{ width: 'auto', fontSize: '13px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}

              {(selectedEventId || statusFilter !== 'All') && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleClearFilters}
                  style={{ fontSize: '12px' }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Selected Event Details Banner */}
          {selectedEvent && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {selectedEvent.eventLevel} Level
                  </span>
                  <StatusBadge status={selectedEvent.status} />
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                    {selectedEvent.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>Organizer: {selectedEvent.organizer}{selectedEvent.subOrganizer ? ` (${selectedEvent.subOrganizer})` : ''}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString() : 'N/A'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> Deadline: {selectedEvent.applicationDeadline ? new Date(selectedEvent.applicationDeadline).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                  {selectedEvent.approvedCount || 0} / {selectedEvent.volunteerCapacity}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Capacity Filled</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoadingEvents ? (
        <Loader message="Loading university events directory..." />
      ) : !selectedEventId ? (
        /* Prompt state: No event selected yet */
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
          <Sparkles size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Select An Event To Begin</h3>
          <p style={{ fontSize: '14px', marginTop: '6px', maxWidth: '480px', margin: '6px auto 20px', lineHeight: 1.5 }}>
            Choose an individual event from the dropdown above to inspect student applications, or select "All Events" for a university-wide ledger.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleEventChange('all')}
            >
              View All Applications Across University
            </button>
          </div>
        </div>
      ) : isLoadingApps ? (
        <Loader message="Loading applications for selected event..." />
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <ClipboardList size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Applications Found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            {statusFilter !== 'All'
              ? `No applicants currently under "${statusFilter}" status for this event.`
              : 'No students have applied for this event yet.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Target Event</th>
                <th>Role Applied</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Decision Maker</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const student = app.studentId || {};
                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                          {app.fullName || student.fullName || 'Student'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          ID: {app.studentIdNumber || student.studentId} • Sem {app.semester}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                          <Phone size={12} color="#2563eb" /> {app.mobileNumber || student.mobileNumber || 'N/A'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                          <Mail size={12} /> {app.email || student.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                        {app.eventId?.title || 'Unknown Event'}
                      </span>
                    </td>
                    <td>
                      <RoleBadge role={app.appliedRole} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {app.decisionBy?.fullName || (app.status === 'Pending' ? 'Awaiting' : 'System/Faculty')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
