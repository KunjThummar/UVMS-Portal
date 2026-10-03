import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import { User, Mail, Phone, Building2, Building, GraduationCap, Award, Shield } from 'lucide-react';

export const StudentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getProfile();
        setProfile(res.data || null);
      } catch {
        showError('Could not load student profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <Loader message="Loading profile..." />;
  }

  if (!profile) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Student Profile</h1>
          <p className="page-subtitle">Your registered university academic details and contact information.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Personal & Contact Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {profile.fullName?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{profile.fullName}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Student ID: {profile.studentId}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                <Mail size={16} color="#64748b" />
                <span><strong>Email:</strong> {profile.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                <Phone size={16} color="#64748b" />
                <span><strong>Mobile Number:</strong> {profile.mobileNumber || 'Not provided'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                <Award size={16} color="#059669" />
                <span><strong>Verified Participations:</strong> {profile.totalParticipations || 0} events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Affiliation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Academic Affiliation</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Building2 size={20} color="#2563eb" style={{ marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>INSTITUTE</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {profile.instituteId?.name} ({profile.instituteId?.code})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Building size={20} color="#7c3aed" style={{ marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>DEPARTMENT</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {profile.departmentId?.name} ({profile.departmentId?.code})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <GraduationCap size={20} color="#d97706" style={{ marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CURRENT SEMESTER</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Semester {profile.semester}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
