import React from 'react';
import Modal from '../common/Modal';
import RoleBadge from '../common/RoleBadge';
import { Calendar, Award, CheckCircle2, User, Phone, Mail } from 'lucide-react';

export const PastHistoryModal = ({ isOpen, onClose, student, pastParticipations = [] }) => {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Participation History: ${student.fullName || 'Student'}`}
      maxWidth="620px"
    >
      {/* Student Details Pill */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#475569',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
          <User size={16} color="#2563eb" />
          <span>{student.fullName} ({student.studentId})</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '2px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mail size={13} /> {student.email}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={13} /> {student.mobileNumber || 'N/A'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
          Approved Past Events ({pastParticipations.length})
        </h4>
      </div>

      {pastParticipations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          background: '#f8fafc',
          borderRadius: '8px',
          color: '#64748b',
          fontSize: '13px'
        }}>
          No previous event participations found on platform.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
          {pastParticipations.map((item, idx) => (
            <div
              key={item.applicationId || idx}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {item.eventTitle}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                  {item.eventType && (
                    <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                      {item.eventType}
                    </span>
                  )}
                  {item.eventMode && (
                    <span style={{ fontSize: '11px', background: item.eventMode.toLowerCase() === 'online' ? '#ecfdf5' : '#fffbeb', color: item.eventMode.toLowerCase() === 'online' ? '#059669' : '#d97706', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                      {item.eventMode}
                    </span>
                  )}
                  {item.academicYear && (
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                      AY {item.academicYear}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : 'N/A'}
                  </span>
                  <span>Level: {item.eventLevel || 'University'}</span>
                </div>
                {item.previousExperience && (
                  <span style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                    "{item.previousExperience}"
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <RoleBadge role={item.appliedRole} />
                <span style={{
                  fontSize: '11px',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={12} /> Approved
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default PastHistoryModal;
