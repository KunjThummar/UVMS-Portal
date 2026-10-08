import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import instituteService from '../../services/instituteService';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Phone, Mail, Users } from 'lucide-react';

export const AdminFacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    instituteId: '',
    departmentId: ''
  });

  const { showSuccess, showError } = useToast();

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const [facRes, instRes, deptRes] = await Promise.all([
        userService.listFaculty(),
        instituteService.listInstitutes(),
        departmentService.listDepartments()
      ]);
      setFacultyList(Array.isArray(facRes) ? facRes : (facRes.data || []));
      setInstitutes(Array.isArray(instRes) ? instRes : (instRes.data || []));
      setDepartments(Array.isArray(deptRes) ? deptRes : (deptRes.data || []));
    } catch {
      showError('Failed to load faculty directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFaculty(null);
    setFormData({
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      instituteId: institutes[0]?._id || '',
      departmentId: departments[0]?._id || ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      fullName: faculty.fullName || '',
      email: faculty.email || '',
      mobileNumber: faculty.mobileNumber || '',
      password: '',
      instituteId: faculty.instituteId?._id || faculty.instituteId || '',
      departmentId: faculty.departmentId?._id || faculty.departmentId || ''
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (editingFaculty) {
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          instituteId: formData.instituteId,
          departmentId: formData.departmentId
        };
        if (formData.password) payload.password = formData.password;

        await userService.updateFaculty(editingFaculty._id, payload);
        showSuccess(`Faculty ${formData.fullName} updated!`);
      } else {
        await userService.createFaculty(formData);
        showSuccess(`Faculty member ${formData.fullName} created!`);
      }

      setIsFormModalOpen(false);
      fetchFaculty();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (faculty) => {
    const newStatus = !faculty.isActive;
    try {
      await userService.toggleFacultyStatus(faculty._id, newStatus);
      showSuccess(`Faculty status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchFaculty();
    } catch {
      showError('Failed to toggle faculty status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!facultyToDelete) return;
    setIsProcessing(true);
    try {
      await userService.deleteFaculty(facultyToDelete._id);
      showSuccess(`Faculty member ${facultyToDelete.fullName} removed.`);
      setFacultyToDelete(null);
      fetchFaculty();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete faculty';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Directory</h1>
          <p className="page-subtitle">Manage university faculty members, contact phone numbers, and departments.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {isLoading ? (
        <Loader message="Loading faculty directory..." />
      ) : facultyList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Faculty Registered</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Contact</th>
                <th>Institute & Dept</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((fac) => (
                <tr key={fac._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                      {fac.fullName}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <Phone size={12} color="#2563eb" /> {fac.mobileNumber || 'N/A'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                        <Mail size={12} /> {fac.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#334155' }}>
                      {fac.instituteId?.code || '—'} • {fac.departmentId?.name || '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(fac)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: fac.isActive ? '#ecfdf5' : '#fef2f2',
                        color: fac.isActive ? '#047857' : '#b91c1c',
                        border: '1px solid',
                        borderColor: fac.isActive ? '#a7f3d0' : '#fecaca'
                      }}
                    >
                      {fac.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {fac.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenEditModal(fac)}
                        title="Edit faculty member"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setFacultyToDelete(fac)}
                        title="Delete faculty member"
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

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Record' : 'Register Faculty Coordinator'}
        maxWidth="540px"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Official Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@charusat.ac.in"
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

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{editingFaculty ? 'New Password (Optional)' : 'Password *'}</label>
            <input
              type="password"
              className="form-input"
              placeholder={editingFaculty ? 'Leave blank to keep unchanged' : 'Min 6 chars'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingFaculty}
            />
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
              {isProcessing ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(facultyToDelete)}
        onClose={() => setFacultyToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Faculty Account"
        message={`Are you sure you want to permanently delete faculty member "${facultyToDelete?.fullName}"?`}
        confirmText="Delete Faculty"
        isDestructive={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdminFacultyPage;
