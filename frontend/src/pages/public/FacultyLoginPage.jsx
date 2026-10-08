import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.png';
import campusImg from '../../assets/charusat-campus.jpg';
import { Mail, Lock, Eye, EyeOff, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';

export const FacultyLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authService.loginFaculty(email, password);
      const token = res.token || res.data?.token;
      const faculty = res.faculty || res.data?.faculty || res.user;
      login(token, faculty, 'faculty');
      showSuccess(`Welcome, Professor ${faculty?.fullName || 'Faculty'}!`);
      navigate('/faculty/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Pane - Campus Background */}
      <div 
        className="auth-campus-pane"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(88, 28, 135, 0.88) 100%), url(${campusImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to University Home
        </Link>

        <div style={{ maxWidth: '460px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <Briefcase size={16} color="#e9d5ff" />
            <span>Faculty Portal</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Event Organization & Volunteer Leadership
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.6 }}>
            Publish department and institute opportunities, review applications, inspect candidate experience, and manage team capacities.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
          CHARUSAT • Faculty Administration
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="auth-form-pane">
        {/* Mobile Back Link */}
        <div className="show-on-mobile" style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
            <ArrowLeft size={15} /> Home
          </Link>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <img src={logoImg} alt="CHARUSAT" style={{ height: '42px', objectFit: 'contain', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Faculty Login</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Enter your Charusat faculty credentials to access event management.
          </p>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Faculty Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. name@charusat.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Must end with @charusat.ac.in</span>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px', background: '#7c3aed' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : (
              <>
                <span>Sign In to Faculty Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', flexWrap: 'wrap' }}>
          <Link to="/login/student" style={{ color: '#2563eb', fontWeight: 600 }}>← Switch to Student Login</Link>
          <Link to="/login/admin" style={{ color: '#64748b' }}>Admin Portal →</Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyLoginPage;
