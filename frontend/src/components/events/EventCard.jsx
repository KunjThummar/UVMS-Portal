import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Clock, Users, ArrowRight, Building } from 'lucide-react';

export const EventCard = ({ event, linkTo, actionText = 'View Details' }) => {
  if (!event) return null;

  const capacityPercent = Math.min(
    100,
    Math.round(((event.approvedCount || 0) / (event.volunteerCapacity || 1)) * 100)
  );

  const isDeadlinePassed = new Date(event.applicationDeadline) < new Date();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#2563eb',
            background: '#eff6ff',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            {event.eventLevel} Level
          </span>

          {event.eventType && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#7c3aed',
              background: '#f5f3ff',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              {event.eventType}
            </span>
          )}

          {event.eventMode && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: event.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706',
              background: event.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb',
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'capitalize'
            }}>
              {event.eventMode}
            </span>
          )}
        </div>
        <StatusBadge status={event.status} />
      </div>

      <h3 style={{
        fontSize: '17px',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '8px',
        lineHeight: 1.3
      }}>
        {event.title}
      </h3>

      <p style={{
        fontSize: '13px',
        color: '#64748b',
        lineHeight: 1.5,
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1
      }}>
        {event.description}
      </p>

      {/* Meta Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
            {event.eventEndDate && new Date(event.eventEndDate).toLocaleDateString() !== new Date(event.eventDate).toLocaleDateString() && (
              <> - {new Date(event.eventEndDate).toLocaleDateString()}</>
            )}
            <span style={{ marginLeft: '6px', fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
              {event.eventDay || 1} {(event.eventDay || 1) === 1 ? 'Day' : 'Days'}
            </span>
          </span>
        </div>

        {event.organizer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <Building size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>Organizer:</strong> {event.organizer}{event.subOrganizer ? ` (${event.subOrganizer})` : ''}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} color={isDeadlinePassed ? '#ef4444' : '#f59e0b'} />
          <span>
            <strong>Deadline:</strong> {new Date(event.applicationDeadline).toLocaleDateString()}
            {isDeadlinePassed && <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '6px' }}>(Passed)</span>}
          </span>
        </div>

        {/* Capacity Bar */}
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={14} color="#64748b" /> Capacity:
            </span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {event.approvedCount || 0} / {event.volunteerCapacity} Slots
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${capacityPercent}%`,
                height: '100%',
                background: capacityPercent >= 100 ? '#7c3aed' : '#2563eb',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      <Link
        to={linkTo}
        className="btn btn-outline btn-sm"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '6px', marginTop: 'auto' }}
      >
        <span>{actionText}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default EventCard;
