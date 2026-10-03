import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminEventService from '../../services/adminEventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { Search, Trash2, Archive, Calendar, Users, Eye, ArrowRight, Plus, Edit, FileSpreadsheet } from 'lucide-react';

export const AdminEventListPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToArchive, setEventToArchive] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedExportYear, setSelectedExportYear] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  const { showSuccess, showError } = useToast();

  const defaultYears = ['2026-27'];
  const eventYears = events.map((e) => e.academicYear).filter(Boolean);
  const availableAcademicYears = Array.from(new Set([...defaultYears, ...eventYears])).sort().reverse();

  const fetchEvents = async (selectedStatus = statusFilter) => {
    setIsLoading(true);
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedStatus && selectedStatus !== 'All') filters.status = selectedStatus;

      const res = await adminEventService.getAllEvents(filters);
      setEvents(res.data || []);
    } catch {
      showError('Could not fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    fetchEvents(status);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setIsProcessing(true);
    try {
      await adminEventService.deleteEvent(eventToDelete._id);
      showSuccess(`Event "${eventToDelete.title}" permanently deleted.`);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete event';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!eventToArchive) return;
    setIsProcessing(true);
    try {
      await adminEventService.archiveEvent(eventToArchive._id);
      showSuccess(`Event "${eventToArchive.title}" archived successfully.`);
      setEventToArchive(null);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to archive event';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportByAcademicYear = async () => {
    setIsExporting(true);
    try {
      const blobData = await adminEventService.exportEventsExcel(selectedExportYear);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      const yearSuffix = selectedExportYear && selectedExportYear !== 'All'
        ? `_AY_${selectedExportYear.replace(/[^a-zA-Z0-9_-]/g, '_')}`
        : '_All_Years';
      link.setAttribute('download', `UVMS_Events_Report${yearSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess(`Events report (${selectedExportYear === 'All' ? 'All Academic Years' : selectedExportYear}) downloaded successfully.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to download events Excel report';
      showError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">University Event Oversight</h1>
          <p className="page-subtitle">Inspect all campus events, supervise capacities, create, or manage records.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedExportYear}
              onChange={(e) => setSelectedExportYear(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
              title="Select Academic Year for Excel Export"
            >
              <option value="All">All Academic Years</option>
              {availableAcademicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportByAcademicYear}
              disabled={isExporting}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              title="Download Excel file of events for selected academic year"
            >
              <FileSpreadsheet size={18} />
              <span>{isExporting ? 'Exporting...' : 'Download Excel'}</span>
            </button>
          </div>
          <Link to="/admin/events/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'All Events', value: 'All' },
              { label: 'Open', value: 'Open' },
              { label: 'Closed', value: 'Closed' },
              { label: 'Completed', value: 'Completed' }
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleStatusChange(tab.value)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isActive ? '#2563eb' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: isActive ? '#2563eb' : '#e2e8f0',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong>{events.length}</strong> event{events.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search across all university events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setSearchQuery(''); fetchEvents(statusFilter); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {isLoading ? (
        <Loader message="Loading university events..." />
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Events Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Organizer</th>
                <th>Level</th>
                <th>Event Date</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {ev.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {ev.eventType && (
                          <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            {ev.eventType}
                          </span>
                        )}
                        {ev.eventMode && (
                          <span style={{ fontSize: '11px', background: ev.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb', color: ev.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                            {ev.eventMode}
                          </span>
                        )}
                        {ev.academicYear && (
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                            AY {ev.academicYear}
                          </span>
                        )}
                      </div>
                      {ev.organizer && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Org: {ev.organizer}{ev.subOrganizer ? ` (${ev.subOrganizer})` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                      {ev.createdBy?.fullName || 'Faculty'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        to={`/admin/applications?eventId=${ev._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        title="View event applications"
                      >
                        <Eye size={14} />
                      </Link>

                      <Link
                        to={`/admin/events/${ev._id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '12px', padding: '5px 8px', color: '#2563eb' }}
                        title="Edit event"
                      >
                        <Edit size={14} />
                      </Link>

                      {!ev.isArchived && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '12px', color: '#b45309', borderColor: '#fde68a', padding: '5px 8px' }}
                          onClick={() => setEventToArchive(ev)}
                          title="Archive event"
                        >
                          <Archive size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        onClick={() => setEventToDelete(ev)}
                        title="Permanently hard-delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Permanently Delete Event"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? This is an irreversible administrative override that permanently removes the event and its associated applications.`}
        confirmText="Hard Delete Event"
        isDestructive={true}
        isLoading={isProcessing}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(eventToArchive)}
        onClose={() => setEventToArchive(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive Event"
        message={`Archive "${eventToArchive?.title}" to protect it from automated cleanups?`}
        confirmText="Archive Event"
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdminEventListPage;
