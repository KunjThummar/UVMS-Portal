import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.png';
import campusImg from '../../assets/charusat-campus.jpg';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Reset token is missing from the link. Please request a new reset email.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
      showSuccess('Password reset successfully! Please log in.');
      setTimeout(() => {
        navigate('/login/student');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired reset link. Please request a new one.';
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
            <span>Reset Password</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Create New Password
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Choose a strong password to ensure your account security across the UVMS Portal.
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Reset Your Password</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Enter and confirm your new password below.
          </p>
        </div>

        {!token ? (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <AlertTriangle size={40} color="#b91c1c" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
              Invalid Reset Link
            </h3>
            <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '20px', lineHeight: 1.5 }}>
              This link is missing a valid reset token. Please request a new password reset email.
            </p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Request New Link
            </Link>
          </div>
        ) : isSuccess ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
              Password Reset Complete!
            </h3>
            <p style={{ fontSize: '14px', color: '#15803d', marginBottom: '20px' }}>
              Redirecting you to the login page...
            </p>
            <Link to="/login/student" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Go to Login Now
            </Link>
          </div>
        ) : (
          <>
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
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
