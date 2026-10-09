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
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const StudentRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    instituteId: '',
    departmentId: '',
    semester: 1
  });

  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
      // Reset department if institute changes
      ...(name === 'instituteId' ? { departmentId: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!formData.email.endsWith('@charusat.edu.in')) {
      setErrorMsg('Student registration requires an official @charusat.edu.in email address.');
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
      await authService.registerStudent({
        fullName: formData.fullName.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        instituteId: formData.instituteId,
        departmentId: formData.departmentId,
        semester: Number(formData.semester)
      });

      setIsSuccess(true);
      showSuccess('Registration completed successfully! Please log in.');
      setTimeout(() => {
        navigate('/login/student');
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
            <GraduationCap size={16} color="#93c5fd" />
            <span>Join CHARUSAT Volunteer Network</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Begin Your Volunteer & Leadership Journey
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Join university symposiums, annual fests, technical hackathons, and community camps.
            Build an official verified participation track record on campus.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          CHARUSAT • Student Registration
        </div>
      </div>

      {/* Right Pane - Registration Form */}
      <div style={{
        width: '100%',
        maxWidth: '580px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
        overflowY: 'auto',
        maxHeight: '100vh'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <img src={logoImg} alt="CHARUSAT" style={{ height: '42px', objectFit: 'contain', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Student Registration</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Fill in your university academic and contact details to register.
          </p>
        </div>

        {isSuccess ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px'
          }}>
            <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>
              Registration Successful!
            </h3>
            <p style={{ fontSize: '14px', color: '#047857' }}>
              Redirecting you to the student login page...
            </p>
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
                marginBottom: '18px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Full Name & Student ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="e.g. Rahul Patel"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                    <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Student ID / Roll No *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="studentId"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="e.g. 21DCS045"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                    />
                    <Hash size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              {/* Email & Mobile Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">University Email *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="id@charusat.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mobile Number *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      name="mobileNumber"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="10-digit number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      maxLength="10"
                      required
                    />
                    <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              {/* Institute & Department Cascading Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Institute *</label>
                  <select
                    name="instituteId"
                    className="form-select"
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
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department *</label>
                  <select
                    name="departmentId"
                    className="form-select"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    disabled={!formData.instituteId || isLoadingDepts}
                  >
                    {!formData.instituteId ? (
                      <option value="">Select Institute First</option>
                    ) : isLoadingDepts ? (
                      <option value="">Loading departments...</option>
                    ) : departments.length === 0 ? (
                      <option value="">No departments found for this institute</option>
                    ) : (
                      <option value="">Select Department</option>
                    )}
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.code} - {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Semester *</label>
                <select
                  name="semester"
                  className="form-select"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering Account...' : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login/student" style={{ color: '#2563eb', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
