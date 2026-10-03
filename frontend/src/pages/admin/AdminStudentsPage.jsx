import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import instituteService from '../../services/instituteService';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Phone, Mail, GraduationCap } from 'lucide-react';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    mobileNumber: '',
    password: '',
    instituteId: '',
    departmentId: '',
    semester: 1
  });

  const { showSuccess, showError } = useToast();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const [studRes, instRes, deptRes] = await Promise.all([
        userService.listStudents(),
        instituteService.listInstitutes(),
        departmentService.listDepartments()
      ]);
      setStudents(Array.isArray(studRes) ? studRes : (studRes.data || []));
      setInstitutes(Array.isArray(instRes) ? instRes : (instRes.data || []));
      setDepartments(Array.isArray(deptRes) ? deptRes : (deptRes.data || []));
    } catch {
      showError('Failed to load students directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      studentId: '',
      email: '',
      mobileNumber: '',
      password: '',
      instituteId: institutes[0]?._id || '',
      departmentId: departments[0]?._id || '',
      semester: 1
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName || '',
      studentId: student.studentId || '',
      email: student.email || '',
      mobileNumber: student.mobileNumber || '',
      password: '',
      instituteId: student.instituteId?._id || student.instituteId || '',
      departmentId: student.departmentId?._id || student.departmentId || '',
      semester: student.semester || 1
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (editingStudent) {
        const updatePayload = {
          fullName: formData.fullName,
          studentId: formData.studentId,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          instituteId: formData.instituteId,
          departmentId: formData.departmentId,
          semester: Number(formData.semester)
        };
        if (formData.password) updatePayload.password = formData.password;

        await userService.updateStudent(editingStudent._id, updatePayload);
        showSuccess(`Student ${formData.fullName} updated!`);
      } else {
        await userService.createStudent({
          ...formData,
          semester: Number(formData.semester)
        });
        showSuccess(`Student ${formData.fullName} created successfully!`);
      }

      setIsFormModalOpen(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const newStatus = !student.isActive;
    try {
      await userService.toggleStudentStatus(student._id, newStatus);
      showSuccess(`Student account marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchStudents();
    } catch {
      showError('Failed to update student status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsProcessing(true);
    try {
      await userService.deleteStudent(studentToDelete._id);
      showSuccess(`Student ${studentToDelete.fullName} removed.`);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete student';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">Manage university student records, contact numbers, and access status.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {isLoading ? (
        <Loader message="Loading students..." />
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <GraduationCap size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Students Registered</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Info</th>
                <th>Contact</th>
                <th>Institute & Dept</th>
                <th>Semester</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {st.fullName}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        ID: {st.studentId}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <Phone size={12} color="#2563eb" /> {st.mobileNumber || 'N/A'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                        <Mail size={12} /> {st.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#334155' }}>
                      {st.instituteId?.code || 'CSPIT'} • {st.departmentId?.name || 'CE'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Sem {st.semester}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(st)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: st.isActive ? '#ecfdf5' : '#fef2f2',
                        color: st.isActive ? '#047857' : '#b91c1c',
                        border: '1px solid',
                        borderColor: st.isActive ? '#a7f3d0' : '#fecaca'
                      }}
                      title="Click to toggle account status"
                    >
                      {st.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {st.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenEditModal(st)}
                        title="Edit student"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setStudentToDelete(st)}
                        title="Delete student"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        maxWidth="560px"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Student ID *</label>
              <input
                type="text"
                className="form-input"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">University Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                className="form-input"
                maxLength="10"
                placeholder="10-digit number"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Institute *</label>
              <select
                className="form-select"
                value={formData.instituteId}
                onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
                required
              >
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
                className="form-select"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Semester *</label>
              <select
                className="form-select"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{editingStudent ? 'New Password (Optional)' : 'Password *'}</label>
              <input
                type="password"
                className="form-input"
                placeholder={editingStudent ? 'Leave blank to keep current' : 'Min 6 chars'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingStudent}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Account"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.fullName}" (${studentToDelete?.studentId})?`}
        confirmText="Delete Student"
        isDestructive={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdminStudentsPage;
