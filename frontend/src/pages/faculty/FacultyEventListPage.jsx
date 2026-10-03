import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import facultyEventService from '../../services/facultyEventService';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import {
  PlusCircle,
  Search,
  Calendar,
  Users,
  Edit,
  RotateCcw,
  Archive,
  Bell,
  ArrowRight
} from 'lucide-react';

export const FacultyEventListPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForArchive, setSelectedEventForArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [notifyingEventId, setNotifyingEventId] = useState(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await facultyEventService.getAllEvents({ search: searchQuery });
      setEvents(res.data || []);
    } catch {
      showError('Failed to fetch events list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleArchiveConfirm = async () => {
    if (!selectedEventForArchive) return;
    setIsArchiving(true);
    try {
      await facultyEventService.archiveEvent(selectedEventForArchive._id);
      showSuccess(`Event "${selectedEventForArchive.title}" archived successfully!`);
      setSelectedEventForArchive(null);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to archive event';
      showError(msg);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleReopen = async (eventId, title) => {
    try {
      await facultyEventService.reopenEvent(eventId);
      showSuccess(`Event "${title}" reopened for applications!`);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cannot reopen event';
      showError(msg);
    }
  };

  const handleNotify = async (eventId, title) => {
    setNotifyingEventId(eventId);
    try {
      const res = await facultyEventService.notifyStudents(eventId);
      const count = res.data?.sentCount || 0;
      showSuccess(`Emails dispatched to ${count} eligible students for "${title}"!`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to dispatch email notifications';
      showError(msg);
    } finally {
      setNotifyingEventId(null);
    }
  };

  const currentUserId = user?._id || user?.id;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Campus Events</h1>
          <p className="page-subtitle">Oversee event lifecycle, applicants review, and student notifications.</p>
        </div>
        <Link to="/faculty/events/new" className="btn btn-primary" style={{ background: '#7c3aed' }}>
          <PlusCircle size={16} /> Create New Event
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Filter by event title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <Loader message="Loading events..." />
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Events Available</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>No campus events found matching your search.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Details</th>
                <th>Level</th>
                <th>Event Date</th>
                <th>Deadline</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const isOwner = (ev.createdBy?._id || ev.createdBy)?.toString() === currentUserId?.toString();
                const isDeadlinePassed = new Date(ev.applicationDeadline) < new Date();

                return (
                  <tr key={ev._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                          {ev.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {ev.eventType && (
                            <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {ev.eventType}
                            </span>
                          )}
                          {ev.eventMode && (
                            <span style={{ fontSize: '11px', background: ev.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb', color: ev.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                              {ev.eventMode}
                            </span>
                          )}
                          {ev.academicYear && (
                            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                              AY {ev.academicYear}
                            </span>
                          )}
                        </div>
                        {ev.organizer && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Org: {ev.organizer}{ev.subOrganizer ? ` (${ev.subOrganizer})` : ''}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          By: {ev.createdBy?.fullName || 'Faculty'} {isOwner && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        {ev.eventLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#334155' }}>
                        <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                        {ev.eventEndDate && new Date(ev.eventEndDate).toLocaleDateString() !== new Date(ev.eventDate).toLocaleDateString() && (
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            to {new Date(ev.eventEndDate).toLocaleDateString()}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>
                          {ev.eventDay || 1} {(ev.eventDay || 1) === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: isDeadlinePassed ? '#ef4444' : '#334155' }}>
                        {new Date(ev.applicationDeadline).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                        {ev.approvedCount || 0} / {ev.volunteerCapacity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusBadge status={ev.status} />
                        {ev.isArchived && (
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {isOwner ? (
                          <Link
                            to={`/faculty/events/${ev._id}/applications`}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '12px', background: '#2563eb' }}
                            title="Review student applications"
                          >
                            Applicants
                          </Link>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Organizer only</span>
                        )}

                        {isOwner && (
                          <>
                            <Link
                              to={`/faculty/events/${ev._id}/edit`}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              title="Edit event"
                            >
                              <Edit size={13} />
                            </Link>

                            {ev.status !== 'Open' && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '12px', color: '#059669', borderColor: '#a7f3d0' }}
                                onClick={() => handleReopen(ev._id, ev.title)}
                                title="Reopen applications"
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}

                            {!ev.isArchived && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '12px', color: '#b45309', borderColor: '#fde68a' }}
                                onClick={() => setSelectedEventForArchive(ev)}
                                title="Archive event"
                              >
                                <Archive size={13} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '12px', color: '#7c3aed', borderColor: '#ddd6fe' }}
                              onClick={() => handleNotify(ev._id, ev.title)}
                              disabled={notifyingEventId === ev._id}
                              title="Dispatch email notification to eligible students"
                            >
                              <Bell size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedEventForArchive)}
        onClose={() => setSelectedEventForArchive(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive Campus Event"
        message={`Are you sure you want to archive "${selectedEventForArchive?.title}"? Archiving protects this event and its records from automated cleanup.`}
        confirmText="Archive Event"
        isLoading={isArchiving}
      />
    </div>
  );
};

export default FacultyEventListPage;
