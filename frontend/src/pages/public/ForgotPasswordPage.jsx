import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.png';
import campusImg from '../../assets/charusat-campus.jpg';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reset link. Please check your email.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Left Pane - Campus Background */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.88) 100%), url(${campusImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff'
      }} className="auth-campus-pane">
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
            <KeyRound size={16} color="#93c5fd" />
            <span>Account Security</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Password Recovery
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Enter your official CHARUSAT email to receive secure instructions to reset your account password.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          CHARUSAT • Charotar University of Science and Technology
        </div>
      </div>

      {/* Right Pane - Form */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <img src={logoImg} alt="CHARUSAT" style={{ height: '48px', objectFit: 'contain', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Forgot Password</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            We'll send a password reset link to your university email address.
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

        {isSubmitted ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
              Check Your Inbox
            </h3>
            <p style={{ fontSize: '14px', color: '#15803d', lineHeight: 1.5, marginBottom: '20px' }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
            </p>
            <Link
              to="/login/student"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">University Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. 21ce001@charusat.edu.in or name@charusat.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Must be an official @charusat.edu.in or @charusat.ac.in email
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending Link...' : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Remembered your password?{' '}
          <Link to="/login/student" style={{ color: '#2563eb', fontWeight: 600 }}>
            Back to Student Login
          </Link>
          {' · '}
          <Link to="/login/faculty" style={{ color: '#2563eb', fontWeight: 600 }}>
            Faculty Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
