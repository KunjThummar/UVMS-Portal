import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Building2, Building, Briefcase } from 'lucide-react';

export const FacultyProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Profile</h1>
          <p className="page-subtitle">Your university academic and faculty administrative profile.</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Faculty Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#faf5ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800
              }}>
                {user?.fullName?.charAt(0) || 'F'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{user?.fullName}</h3>
                <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 600 }}>University Faculty Coordinator</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                <Mail size={16} color="#64748b" />
                <span><strong>Official Email:</strong> {user?.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                <Phone size={16} color="#64748b" />
                <span><strong>Mobile Number:</strong> {user?.mobileNumber || 'Not configured'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                <Building2 size={16} color="#64748b" />
                <span><strong>Institute:</strong> {user?.instituteId?.name || user?.instituteId?.code || 'CHARUSAT'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                <Building size={16} color="#64748b" />
                <span><strong>Department:</strong> {user?.departmentId?.name || user?.departmentId?.code || 'Department'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfilePage;
