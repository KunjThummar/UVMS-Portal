import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import facultyEventService from '../../services/facultyEventService';
import adminEventService from '../../services/adminEventService';
import instituteService from '../../services/instituteService';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Calendar, Save, Bell, Users, Building2, Building, CheckSquare, Square } from 'lucide-react';

export const FacultyEventFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const eventService = isAdminRoute ? adminEventService : facultyEventService;
  const backUrl = isAdminRoute ? '/admin/events' : '/faculty/events';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventEndDate: '',
    academicYear: '',
    organizer: '',
    subOrganizer: '',
    eventType: 'Workshop',
    eventMode: 'offline',
    eventDay: 1,
    applicationDeadline: '',
    volunteerCapacity: 10,
    eventLevel: 'University',
    targetInstituteIds: [],
    targetDepartmentIds: []
  });

  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper: Academic year matching backend July-to-July cycle
  const calculateAcademicYear = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = d.getMonth(); // 6 = July
    const startYear = month >= 6 ? year : year - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  };

  // Helper: Event day count matching backend
  const calculateEventDay = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.round((end - start) / msPerDay) + 1;
    return Math.max(1, diff);
  };

  // Fetch reference lookup data
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [instRes, deptRes] = await Promise.all([
          instituteService.listInstitutes(),
          departmentService.listDepartments()
        ]);
        const instList = Array.isArray(instRes) ? instRes : (instRes.data || []);
        const deptList = Array.isArray(deptRes) ? deptRes : (deptRes.data || []);
        setInstitutes(instList);
        setDepartments(deptList);
      } catch {
        showError('Could not load institute/department references');
      }
    };

    fetchReferences();
  }, []);

  // If in edit mode, fetch existing event details
  useEffect(() => {
    if (!isEditMode) return;

    const fetchExistingEvent = async () => {
      setIsLoading(true);
      try {
        const res = await eventService.getEventById(id);
        const ev = res.data;
        if (ev) {
          const targetDeptIds = ev.targetDepartmentIds ? ev.targetDepartmentIds.map((d) => d._id || d) : [];
          let targetInstIds = ev.targetInstituteIds ? ev.targetInstituteIds.map((i) => i._id || i) : [];

          // If Department level and targetInstituteIds is empty, infer from departments
          if (ev.eventLevel === 'Department' && targetInstIds.length === 0 && targetDeptIds.length > 0) {
            const inferred = new Set();
            targetDeptIds.forEach((dId) => {
              const deptObj = departments.find((d) => (d._id || d).toString() === dId.toString());
              if (deptObj) {
                const instId = deptObj.instituteId?._id || deptObj.instituteId;
                if (instId) inferred.add(instId.toString());
              }
            });
            targetInstIds = Array.from(inferred);
          }

          setFormData({
            title: ev.title || '',
            description: ev.description || '',
            eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 16) : '',
            eventEndDate: ev.eventEndDate ? new Date(ev.eventEndDate).toISOString().slice(0, 16) : (ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 16) : ''),
            academicYear: ev.academicYear || (ev.eventDate ? calculateAcademicYear(ev.eventDate) : ''),
            organizer: ev.organizer || '',
            subOrganizer: ev.subOrganizer || '',
            eventType: ev.eventType || 'Workshop',
            eventMode: ev.eventMode || 'offline',
            eventDay: ev.eventDay || 1,
            applicationDeadline: ev.applicationDeadline ? new Date(ev.applicationDeadline).toISOString().slice(0, 16) : '',
            volunteerCapacity: ev.volunteerCapacity || 10,
            eventLevel: ev.eventLevel || 'University',
            targetInstituteIds: targetInstIds,
            targetDepartmentIds: targetDeptIds
          });
        }
      } catch {
        showError('Failed to load event data for editing');
      } finally {
        setIsLoading(false);
      }
    };

    if (departments.length > 0 || !isEditMode) {
      fetchExistingEvent();
    }
  }, [id, isEditMode, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };

      if (name === 'eventDate') {
        updated.academicYear = calculateAcademicYear(value);
        if (updated.eventEndDate) {
          updated.eventDay = calculateEventDay(value, updated.eventEndDate);
        }
      }

      if (name === 'eventEndDate') {
        if (updated.eventDate) {
          updated.eventDay = calculateEventDay(updated.eventDate, value);
        }
      }

      if (name === 'organizer') {
        const selectedInst = institutes.find((i) => i.name === value);
        if (selectedInst) {
          const validDept = departments.some(
            (d) =>
              (d.instituteId?._id || d.instituteId)?.toString() === selectedInst._id.toString() &&
              d.name === prev.subOrganizer
          );
          if (!validDept) {
            updated.subOrganizer = '';
          }
        } else {
          updated.subOrganizer = '';
        }
      }

      return updated;
    });
  };

  const handleInstituteToggle = (instId) => {
    setFormData((prev) => {
      const isCurrentlySelected = prev.targetInstituteIds.includes(instId);
      const newInstIds = isCurrentlySelected
        ? prev.targetInstituteIds.filter((i) => i !== instId)
        : [...prev.targetInstituteIds, instId];

      let newDeptIds = [...prev.targetDepartmentIds];
      if (isCurrentlySelected && prev.eventLevel === 'Department') {
        // Remove departments of the unselected institute
        const instDeptIds = new Set(
          departments
            .filter((d) => (d.instituteId?._id || d.instituteId)?.toString() === instId.toString())
            .map((d) => d._id)
        );
        newDeptIds = newDeptIds.filter((dId) => !instDeptIds.has(dId));
      }

      return {
        ...prev,
        targetInstituteIds: newInstIds,
        targetDepartmentIds: newDeptIds
      };
    });
  };

  const handleSelectAllInstitutes = () => {
    setFormData((prev) => ({
      ...prev,
      targetInstituteIds: institutes.map((i) => i._id)
    }));
  };

  const handleClearAllInstitutes = () => {
    setFormData((prev) => ({
      ...prev,
      targetInstituteIds: [],
      targetDepartmentIds: prev.eventLevel === 'Department' ? [] : prev.targetDepartmentIds
    }));
  };

  const handleDepartmentToggle = (deptId) => {
    setFormData((prev) => {
      const exists = prev.targetDepartmentIds.includes(deptId);
      return {
        ...prev,
        targetDepartmentIds: exists
          ? prev.targetDepartmentIds.filter((d) => d !== deptId)
          : [...prev.targetDepartmentIds, deptId]
      };
    });
  };

  const handleSelectAllForInstitute = (instId) => {
    const instDeptIds = departments
      .filter((d) => (d.instituteId?._id || d.instituteId)?.toString() === instId.toString())
      .map((d) => d._id);

    setFormData((prev) => ({
      ...prev,
      targetDepartmentIds: Array.from(new Set([...prev.targetDepartmentIds, ...instDeptIds]))
    }));
  };

  const handleClearAllForInstitute = (instId) => {
    const instDeptIds = new Set(
      departments
        .filter((d) => (d.instituteId?._id || d.instituteId)?.toString() === instId.toString())
        .map((d) => d._id)
    );

    setFormData((prev) => ({
      ...prev,
      targetDepartmentIds: prev.targetDepartmentIds.filter((dId) => !instDeptIds.has(dId))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const eventDateObj = new Date(formData.eventDate);
    const eventEndDateObj = new Date(formData.eventEndDate);
    const deadlineObj = new Date(formData.applicationDeadline);

    if (deadlineObj >= eventDateObj) {
      setErrorMsg('Application deadline must occur before the event start date.');
      return;
    }

    if (eventEndDateObj < eventDateObj) {
      setErrorMsg('Event end date must occur on or after the event start date.');
      return;
    }

    if (!formData.organizer || formData.organizer.trim().length === 0) {
      setErrorMsg('Please select an organizing institute.');
      return;
    }

    if (formData.volunteerCapacity < 1) {
      setErrorMsg('Volunteer capacity must be at least 1.');
      return;
    }

    if (formData.eventLevel === 'Institute') {
      if (formData.targetInstituteIds.length === 0) {
        setErrorMsg('Please select at least one target institute for Institute level events.');
        return;
      }
    }

    if (formData.eventLevel === 'Department') {
      if (formData.targetInstituteIds.length === 0) {
        setErrorMsg('Please select at least one institute in Step 1 to configure departments.');
        return;
      }
      if (formData.targetDepartmentIds.length === 0) {
        setErrorMsg('Please select at least one target department for Department level events.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventDate: eventDateObj.toISOString(),
        eventEndDate: eventEndDateObj.toISOString(),
        academicYear: formData.academicYear || calculateAcademicYear(formData.eventDate),
        organizer: formData.organizer.trim(),
        subOrganizer: formData.subOrganizer ? formData.subOrganizer.trim() : '',
        eventType: formData.eventType,
        eventMode: formData.eventMode,
        eventDay: calculateEventDay(formData.eventDate, formData.eventEndDate),
        applicationDeadline: deadlineObj.toISOString(),
        volunteerCapacity: Number(formData.volunteerCapacity),
        eventLevel: formData.eventLevel,
        targetInstituteIds: (formData.eventLevel === 'Institute' || formData.eventLevel === 'Department')
          ? formData.targetInstituteIds
          : [],
        targetDepartmentIds: formData.eventLevel === 'Department' ? formData.targetDepartmentIds : []
      };

      if (isEditMode) {
        await eventService.updateEvent(id, payload);
        showSuccess('Event updated successfully!');
      } else {
        await eventService.createEvent(payload);
        showSuccess('Event published! Automatic announcement emails dispatched to eligible students.');
      }

      navigate(backUrl);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save event';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading event information..." />;
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={backUrl} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={15} /> Back to Events
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ fontSize: '20px' }}>
            {isEditMode ? 'Edit Campus Event' : 'Create New Volunteer Opportunity'}
          </h2>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. CHARUSAT Tech Fest 2026 - Hackathon"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Event Description & Volunteer Scope *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="5"
              placeholder="Outline event schedule, volunteer roles, duties, benefits, and requirements..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Event Classification & Mode */}
          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event Type *</label>
              <select
                name="eventType"
                className="form-select"
                value={formData.eventType}
                onChange={handleChange}
                required
              >
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="NSS">NSS</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Expert Lecture">Expert Lecture</option>
              </select>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Primary activity category</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event Mode *</label>
              <select
                name="eventMode"
                className="form-select"
                value={formData.eventMode}
                onChange={handleChange}
                required
              >
                <option value="offline">Offline (In-Person / On Campus)</option>
                <option value="online">Online (Virtual / Remote)</option>
              </select>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Delivery medium</span>
            </div>
          </div>

          {/* Organizing Institute & Department */}
          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Organizer (Institute) *</label>
              <select
                name="organizer"
                className="form-select"
                value={formData.organizer}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Organizing Institute --</option>
                {institutes.map((inst) => (
                  <option key={inst._id} value={inst.name}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Hosting institute</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sub-Organizer (Department)</label>
              <select
                name="subOrganizer"
                className="form-select"
                value={formData.subOrganizer}
                onChange={handleChange}
                disabled={!formData.organizer}
              >
                <option value="">None / Institute Level</option>
                {(() => {
                  const selectedInst = institutes.find((i) => i.name === formData.organizer);
                  if (!selectedInst) return null;
                  return departments
                    .filter((d) => (d.instituteId?._id || d.instituteId)?.toString() === selectedInst._id.toString())
                    .map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ));
                })()}
              </select>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {formData.organizer ? 'Hosting department (optional)' : 'Select an institute first'}
              </span>
            </div>
          </div>

          {/* Dates: Event Start Date, Event End Date & Application Deadline */}
          <div className="form-grid-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event Start Date & Time *</label>
              <input
                type="datetime-local"
                name="eventDate"
                className="form-input"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event End Date & Time *</label>
              <input
                type="datetime-local"
                name="eventEndDate"
                className="form-input"
                value={formData.eventEndDate}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Must be on or after start date</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Application Deadline *</label>
              <input
                type="datetime-local"
                name="applicationDeadline"
                className="form-input"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Must precede event start date</span>
            </div>
          </div>

          {/* Auto-Calculated Details Card */}
          {(formData.academicYear || (formData.eventDate && formData.eventEndDate)) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              flexWrap: 'wrap'
            }}>
              {formData.academicYear && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                  <strong style={{ color: '#2563eb' }}>Academic Year:</strong>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {formData.academicYear}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>(Auto-derived from start date)</span>
                </span>
              )}
              {formData.eventDate && formData.eventEndDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                  <strong style={{ color: '#7c3aed' }}>Duration:</strong>
                  <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {formData.eventDay || 1} {(formData.eventDay || 1) === 1 ? 'Day' : 'Days'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>(Calculated from start & end date)</span>
                </span>
              )}
            </div>
          )}

          {/* Volunteer Capacity & Event Level */}
          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Volunteer Capacity Target *</label>
              <input
                type="number"
                name="volunteerCapacity"
                className="form-input"
                min="1"
                value={formData.volunteerCapacity}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Slots available for approved students</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Eligibility Target Level *</label>
              <select
                name="eventLevel"
                className="form-select"
                value={formData.eventLevel}
                onChange={handleChange}
                required
              >
                <option value="University">University Level (Open to all CHARUSAT students)</option>
                <option value="Institute">Institute Level (Applies to all departments of selected institutes)</option>
                <option value="Department">Department Level (Specific departments under selected institutes)</option>
              </select>
            </div>
          </div>

          {/* University Level Information */}
          {formData.eventLevel === 'University' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '13px'
            }}>
              <Users size={22} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <strong>University-Wide Opportunity:</strong> This event is open to all registered CHARUSAT students across all institutes and departments. No institute or department restrictions apply.
              </div>
            </div>
          )}

          {/* Institute Level Target Selection */}
          {formData.eventLevel === 'Institute' && (
            <div className="form-group" style={{ margin: 0, padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Building2 size={16} color="#2563eb" /> Select Target Institute(s) *
                  </label>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Select the institutes eligible for this event. The event will automatically apply to <strong>all departments</strong> within the selected institutes.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                    onClick={handleSelectAllInstitutes}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                    onClick={handleClearAllInstitutes}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '8px' }}>
                {institutes.map((inst) => {
                  const checked = formData.targetInstituteIds.includes(inst._id);
                  return (
                    <label
                      key={inst._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: checked ? '#eff6ff' : '#ffffff',
                        border: checked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                        boxShadow: checked ? '0 1px 2px rgba(37,99,235,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleInstituteToggle(inst._id)}
                      />
                      <span><strong>{inst.code}</strong> - {inst.name}</span>
                    </label>
                  );
                })}
              </div>

              {formData.targetInstituteIds.length > 0 && (
                <div style={{
                  padding: '10px 12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  color: '#15803d',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  ✓ {formData.targetInstituteIds.length} institute(s) selected. All departments in these institutes will be automatically included.
                </div>
              )}
            </div>
          )}

          {/* Department Level Target Selection */}
          {formData.eventLevel === 'Department' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1: Select Target Institutes */}
              <div className="form-group" style={{ margin: 0, padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Building2 size={16} color="#2563eb" /> Step 1: Select Target Institute(s) *
                    </label>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Select the institutes whose departments you want to configure.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                      onClick={handleSelectAllInstitutes}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                      onClick={handleClearAllInstitutes}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '8px' }}>
                  {institutes.map((inst) => {
                    const checked = formData.targetInstituteIds.includes(inst._id);
                    return (
                      <label
                        key={inst._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: checked ? '#eff6ff' : '#ffffff',
                          border: checked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                          boxShadow: checked ? '0 1px 2px rgba(37,99,235,0.08)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleInstituteToggle(inst._id)}
                        />
                        <span><strong>{inst.code}</strong> - {inst.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Departments Grouped Separately by Each Selected Institute */}
              {formData.targetInstituteIds.length === 0 ? (
                <div style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '13px'
                }}>
                  <Building2 size={24} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                  Please select one or more institutes in Step 1 above to view and configure their departments.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={16} color="#7c3aed" /> Step 2: Configure Departments for Selected Institutes *
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      {formData.targetDepartmentIds.length} department(s) selected
                    </span>
                  </div>

                  {formData.targetInstituteIds.map((instId) => {
                    const instObj = institutes.find((i) => i._id === instId);
                    if (!instObj) return null;

                    const instDepts = departments.filter(
                      (d) => (d.instituteId?._id || d.instituteId)?.toString() === instId.toString()
                    );
                    const selectedInThisInst = instDepts.filter((d) => formData.targetDepartmentIds.includes(d._id));

                    return (
                      <div
                        key={instId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Institute Group Header */}
                        <div style={{
                          background: '#f1f5f9',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #e2e8f0',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {instObj.code}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                              {instObj.name}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                              ({selectedInThisInst.length} / {instDepts.length} selected)
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                              onClick={() => handleSelectAllForInstitute(instId)}
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '11px', padding: '2px 8px', background: '#ffffff' }}
                              onClick={() => handleClearAllForInstitute(instId)}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Departments List for this Institute */}
                        <div style={{ padding: '12px' }}>
                          {instDepts.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              No departments registered under {instObj.code}.
                            </span>
                          ) : (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                              gap: '8px'
                            }}>
                              {instDepts.map((dept) => {
                                const checked = formData.targetDepartmentIds.includes(dept._id);
                                return (
                                  <label
                                    key={dept._id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      background: checked ? '#eff6ff' : '#ffffff',
                                      border: checked ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleDepartmentToggle(dept._id)}
                                    />
                                    <span><strong>{dept.code}</strong> - {dept.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Automatic Email Notification Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            padding: '14px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#5b21b6'
          }}>
            <Bell size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Automated University Broadcast:</strong> When you publish this opportunity,
              the UVMS notification engine automatically notifies all eligible students via their university email.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(backUrl)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: isAdminRoute ? '#2563eb' : '#7c3aed' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Event...' : (
                <>
                  <Save size={16} /> {isEditMode ? 'Update Event' : 'Publish Opportunity'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyEventFormPage;
