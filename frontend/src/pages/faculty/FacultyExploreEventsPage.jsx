import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import facultyEventService from '../../services/facultyEventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Compass,
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  ArrowRight,
  Filter,
  Eye,
  Info
} from 'lucide-react';

export const FacultyExploreEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { showError } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter && statusFilter !== 'All') filters.status = statusFilter;

      const res = await facultyEventService.getAllEvents(filters);
      setEvents(res.data || []);
    } catch {
      showError('Could not load university events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  // Client-side filtering for Level and Type
  const filteredEvents = events.filter((ev) => {
    if (levelFilter !== 'All' && ev.eventLevel !== levelFilter) return false;
    if (typeFilter !== 'All' && ev.eventType !== typeFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore University Events</h1>
          <p className="page-subtitle">
            Discover volunteer opportunities, seminars, and initiatives across CHARUSAT departments and institutes.
          </p>
        </div>
      </div>

      {/* Informative Faculty Banner */}
      <div style={{
        background: '#f5f3ff',
        border: '1px solid #ddd6fe',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#5b21b6'
      }}>
        <Info size={22} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Faculty Information Portal:</strong> You are viewing campus events published across the entire university.
          Faculty members can inspect event itineraries and capacity metrics. Volunteer registrations are reserved for students.
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by event title, organizer, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Level Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="All">All Event Levels</option>
            <option value="University">University Level</option>
            <option value="Institute">Institute Level</option>
            <option value="Department">Department Level</option>
          </select>

          {/* Type Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="NSS">NSS</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Expert Lecture">Expert Lecture</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Status Tab Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'All Statuses', value: 'All' },
              { label: 'Open', value: 'Open' },
              { label: 'Closed', value: 'Closed' }
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isActive ? '#7c3aed' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: isActive ? '#7c3aed' : '#e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <strong>{filteredEvents.length}</strong> event{filteredEvents.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <Loader message="Loading university events directory..." />
      ) : filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Compass size={44} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Events Found</h3>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>No events match your current search filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((ev) => {
            const isDeadlinePassed = new Date(ev.applicationDeadline) < new Date();
            const capacityRatio = (ev.approvedCount || 0) / (ev.volunteerCapacity || 1);
            const capacityPercent = Math.min(100, Math.round(capacityRatio * 100));

            return (
              <div
                key={ev._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#f5f3ff',
                      color: '#7c3aed',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {ev.eventLevel} Level
                    </span>
                    <StatusBadge status={ev.status} />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.35 }}>
                    {ev.title}
                  </h3>

                  {/* Organizer and department */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    <Building2 size={14} color="#64748b" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.organizer}{ev.subOrganizer ? ` • ${ev.subOrganizer}` : ''}
                    </span>
                  </div>

                  {/* Schedule Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                      <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                      {ev.eventEndDate && new Date(ev.eventEndDate).toLocaleDateString() !== new Date(ev.eventDate).toLocaleDateString() && (
                        <span> to {new Date(ev.eventEndDate).toLocaleDateString()}</span>
                      )}
                      <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, marginLeft: 'auto' }}>
                        {ev.eventDay || 1} {(ev.eventDay || 1) === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isDeadlinePassed ? '#ef4444' : '#64748b' }}>
                      <Clock size={14} style={{ flexShrink: 0 }} />
                      <span>Deadline: {new Date(ev.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Volunteer Capacity:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>
                        {ev.approvedCount || 0} / {ev.volunteerCapacity}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${capacityPercent}%`,
                          height: '100%',
                          background: capacityPercent >= 100 ? '#ef4444' : '#7c3aed',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    By: {ev.createdBy?.fullName || 'Faculty Organizer'}
                  </span>
                  <Link
                    to={`/faculty/explore/${ev._id}`}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: '#7c3aed', color: '#7c3aed' }}
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyExploreEventsPage;
