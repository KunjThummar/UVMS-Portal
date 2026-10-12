import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import instituteService from '../../services/instituteService';
import departmentService from '../../services/departmentService';
import logoImg from '../../assets/logo.png';
import campusImg from '../../assets/charusat-campus.jpg';
import {
  User,
  Hash,
  Mail,
  Phone,
  Lock,
  Building2,
  Building,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const FacultyRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    facultyCode: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    instituteId: '',
    departmentId: ''
  });

  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Load institutes on mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      setIsLoadingInstitutes(true);
      try {
        const res = await instituteService.listInstitutes();
        const list = Array.isArray(res) ? res : (res.data || []);
        setInstitutes(list);
      } catch (err) {
        showError('Could not load university institutes list');
      } finally {
        setIsLoadingInstitutes(false);
      }
    };
    fetchInstitutes();
  }, []);

  // Fetch departments when selected institute changes
  useEffect(() => {
    if (!formData.instituteId) {
      setDepartments([]);
      return;
    }

    const fetchDepartments = async () => {
      setIsLoadingDepts(true);
      try {
        const res = await departmentService.listDepartments(formData.instituteId);
        const list = Array.isArray(res) ? res : (res.data || []);
        setDepartments(list);
      } catch {
        showError('Could not load departments for selected institute');
      } finally {
        setIsLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, [formData.instituteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'instituteId' ? { departmentId: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.facultyCode.trim()) {
      setErrorMsg('Faculty Code is required.');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!formData.email.endsWith('@charusat.ac.in')) {
      setErrorMsg('Faculty registration requires an official @charusat.ac.in email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.registerFaculty({
        fullName: formData.fullName.trim(),
        facultyCode: formData.facultyCode.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        instituteId: formData.instituteId,
        departmentId: formData.departmentId
      });

      setIsSuccess(true);
      showSuccess('Faculty account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/faculty');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check inputs.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
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
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(88, 28, 135, 0.92) 100%), url(${campusImg})`,
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
            <Briefcase size={16} color="#e9d5ff" />
            <span>Faculty Administration Portal</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Faculty Coordinator Registration
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.6 }}>
            Join the University Volunteer Management System to organize campus events, recruit and manage student volunteers, and track departmental participation.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
          CHARUSAT • Charotar University of Science & Technology
        </div>
      </div>

      {/* Right Pane - Form */}
      <div style={{
        width: '100%',
        maxWidth: '580px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <img src={logoImg} alt="CHARUSAT" style={{ height: '44px', objectFit: 'contain', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Register Faculty Account</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Fill in your university faculty credentials and department details.
          </p>
        </div>

        {isSuccess ? (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#065f46' }}>Account Created!</h3>
            <p style={{ fontSize: '14px', color: '#047857', marginTop: '6px' }}>
              Redirecting you to the Faculty Login page...
            </p>
            <Link to="/login/faculty" className="btn btn-primary btn-sm" style={{ marginTop: '16px', background: '#7c3aed' }}>
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMsg && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '13px'
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Prof. / Dr. Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Faculty Code *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="facultyCode"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. FAC-CE-001"
                    value={formData.facultyCode}
                    onChange={handleChange}
                    required
                  />
                  <Hash size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Official Faculty Email *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@charusat.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                Must be an official @charusat.ac.in university domain email.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mobile Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="mobileNumber"
                  maxLength="10"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="10-digit phone number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
                <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Institute *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="instituteId"
                    className="form-select"
                    style={{ paddingLeft: '36px' }}
                    value={formData.instituteId}
                    onChange={handleChange}
                    required
                    disabled={isLoadingInstitutes}
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.code} - {inst.name}
                      </option>
                    ))}
                  </select>
                  <Building2 size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="departmentId"
                    className="form-select"
                    style={{ paddingLeft: '36px' }}
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    disabled={!formData.instituteId || isLoadingDepts}
                  >
                    <option value="">{formData.instituteId ? 'Select Department' : 'First choose institute'}</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <Building size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '10px', background: '#7c3aed' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering Faculty...' : (
                <>
                  <span>Complete Faculty Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: '#64748b' }}>Already registered? </span>
          <Link to="/login/faculty" style={{ color: '#7c3aed', fontWeight: 600 }}>
            Sign In to Faculty Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegisterPage;
