import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import campusImg from '../../assets/charusat-campus.jpg';
import {
  GraduationCap,
  Briefcase,
  Shield,
  Award,
  Users,
  CalendarCheck,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top University Nav */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logoImg} alt="CHARUSAT Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              CHARUSAT UVMS
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              University Volunteer Management System
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login/student" className="btn btn-outline btn-sm">
            Student Login
          </Link>
          <Link to="/login/faculty" className="btn btn-primary btn-sm">
            Faculty Portal
          </Link>
        </div>
      </header>

      {/* Hero Section with Campus Background */}
      <section style={{
        position: 'relative',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        color: '#ffffff',
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.85) 100%), url(${campusImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <Award size={15} color="#60a5fa" />
            <span>Official University Volunteering & Leadership Platform</span>
          </div>

          <h2 style={{
            fontSize: '40px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '18px'
          }}>
            Charotar University of Science & Technology
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#e2e8f0',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '680px',
            margin: '0 auto 32px'
          }}>
            Empowering students to connect with campus opportunities, coordinate university festivals,
            and build verified volunteer leadership history.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register/student" className="btn btn-primary btn-lg" style={{ background: '#2563eb', color: '#fff' }}>
              <span>Student Registration</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login/student" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Role Access Cards */}
      <section style={{ maxWidth: '1140px', margin: '-50px auto 40px', padding: '0 24px', width: '100%', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Student Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #2563eb' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Student Portal</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Browse verified events targeted to your department or institute. Apply as a Volunteer,
              Sub-Coordinator, or Coordinator, and view your verified participation history.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link to="/login/student" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Student Login
              </Link>
              <Link to="/register/student" className="btn btn-outline btn-sm">
                Register
              </Link>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #7c3aed' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#faf5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Faculty Portal</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Publish events with specific audience scopes, review applicants with past event experience
              track records, and send automated announcements to eligible students.
            </p>
            <Link to="/login/faculty" className="btn btn-primary btn-sm" style={{ background: '#7c3aed', marginTop: '8px' }}>
              Faculty Login
            </Link>
          </div>

          {/* Admin Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #0f172a' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Admin Console</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Manage university institutes and departments, oversee all platform events and applications,
              and maintain university student/faculty directories.
            </p>
            <Link to="/login/admin" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
              Admin Access
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section style={{ maxWidth: '1140px', margin: '30px auto', padding: '0 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Designed for Official University Operations</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>Streamlining campus engagement across departments and institutes</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <CalendarCheck size={28} color="#2563eb" style={{ marginBottom: '14px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Targeted Eligibility</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Events can be scoped to the entire University, specific Institutes (e.g. CSPIT, DEPSTAR), or designated Departments.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <Users size={28} color="#7c3aed" style={{ marginBottom: '14px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Multi-Role Applications</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Students can apply for Coordinator, Sub-Coordinator, or Volunteer positions, showcasing previous experience.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <Award size={28} color="#059669" style={{ marginBottom: '14px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Tracked Participation</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Faculties inspect applicant past event history directly during review, while students build a verified history portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        background: '#0f172a',
        color: '#94a3b8',
        padding: '36px 24px',
        borderTop: '1px solid #1e293b',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>CHARUSAT</span>
            <span>•</span>
            <span>Charotar University of Science and Technology, Changa - 388421</span>
          </div>
          <p>© {new Date().getFullYear()} CHARUSAT University Volunteer Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
