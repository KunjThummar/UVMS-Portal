import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import EventCard from '../../components/events/EventCard';
import Loader from '../../components/common/Loader';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';

export const StudentEventListPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Open');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { showError } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (statusFilter && statusFilter !== 'All') filters.status = statusFilter;
      if (typeFilter && typeFilter !== 'All') filters.eventType = typeFilter;
      if (modeFilter && modeFilter !== 'All') filters.eventMode = modeFilter.toLowerCase();
      if (academicYearFilter && academicYearFilter !== 'All') filters.academicYear = academicYearFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const res = await studentService.getEligibleEvents(filters);
      setEvents(res.data || []);
    } catch (err) {
      showError('Failed to load eligible events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, typeFilter, modeFilter, academicYearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleReset = () => {
    setStatusFilter('Open');
    setTypeFilter('All');
    setModeFilter('All');
    setAcademicYearFilter('All');
    setSearchQuery('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Eligible Events</h1>
          <p className="page-subtitle">
            Showing verified volunteering and coordination opportunities you are eligible to join.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by title, organizer, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="#64748b" />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="ApplicationClosed">Closed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="NSS">NSS</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Expert Lecture">Expert Lecture</option>
          </select>

          {/* Mode Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          {/* Academic Year Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
          >
            <option value="All">All AY</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
            <option value="2027-28">2027-28</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>

          <button type="button" className="btn btn-outline btn-sm" onClick={handleReset} title="Reset all filters">
            <RotateCcw size={14} />
          </button>
        </form>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <Loader message="Loading available events..." />
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 20px', color: '#64748b' }}>
          <Calendar size={42} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            No Matching Events Found
          </h3>
          <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
            There are currently no events matching your criteria or eligible for your institute/department.
          </p>
          <button className="btn btn-outline btn-sm" onClick={handleReset}>
            View All Open Events
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              linkTo={`/student/events/${event._id}`}
              actionText="View & Apply"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEventListPage;
