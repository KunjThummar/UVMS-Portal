import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import studentService from '../../services/studentService';
import { Send, UserCheck, Shield, Phone, Mail, Award } from 'lucide-react';

export const ApplyModal = ({ isOpen, onClose, event, onApplicationSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [appliedRole, setAppliedRole] = useState('Volunteer');
  const [previousExperience, setPreviousExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await studentService.applyToEvent(event._id, {
        appliedRole,
        previousExperience
      });

      showSuccess(`Application submitted as ${appliedRole}!`);
      onClose();
      if (onApplicationSuccess) onApplicationSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply for: ${event.title}`} maxWidth="560px">
      <form onSubmit={handleSubmit}>
        {/* Student Profile Snapshot Notice */}
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
            <UserCheck size={16} color="#2563eb" />
            <span>Applicant Profile Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <span><strong>Name:</strong> {user?.fullName}</span>
            <span><strong>ID:</strong> {user?.studentId}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={13} /> {user?.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} /> {user?.mobileNumber || 'Not set'}
            </span>
          </div>
        </div>

        {/* Applied Role Selection */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={15} color="#2563eb" /> Desired Application Role *
          </label>
          <select
            className="form-select"
            value={appliedRole}
            onChange={(e) => setAppliedRole(e.target.value)}
            required
            style={{ fontWeight: 600, color: '#1e293b' }}
          >
            <option value="Volunteer">Volunteer (General participation & support)</option>
            <option value="Sub-Coordinator">Sub-Coordinator (Assisting team coordination)</option>
            <option value="Coordinator">Coordinator (Event leadership & management)</option>
          </select>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Choose the position matching your capacity and experience.
          </span>
        </div>

        {/* Previous Experience */}
        <div className="form-group">
          <label className="form-label">
            Previous Volunteering Experience / Relevant Skills (Optional)
          </label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="Mention any past roles, events organized, or technical/coordination skills..."
            value={previousExperience}
            onChange={(e) => setPreviousExperience(e.target.value)}
          />
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <Send size={14} /> Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyModal;
