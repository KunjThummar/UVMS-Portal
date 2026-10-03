import React, { useState, useEffect } from 'react';
import departmentService from '../../services/departmentService';
import instituteService from '../../services/instituteService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { Building, Plus, Edit, Trash2, Filter } from 'lucide-react';

export const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({ name: '', code: '', instituteId: '' });
  const { showSuccess, showError } = useToast();

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const [deptRes, instRes] = await Promise.all([
        departmentService.listDepartments(selectedInstituteFilter),
        instituteService.listInstitutes()
      ]);
      const depts = Array.isArray(deptRes) ? deptRes : (deptRes.data || []);
      const insts = Array.isArray(instRes) ? instRes : (instRes.data || []);
      setDepartments(depts);
      setInstitutes(insts);
    } catch {
      showError('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [selectedInstituteFilter]);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', instituteId: institutes[0]?._id || '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      instituteId: dept.instituteId?._id || dept.instituteId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, formData);
        showSuccess(`Department "${formData.code}" updated!`);
      } else {
        await departmentService.createDepartment(formData);
        showSuccess(`Department "${formData.code}" added!`);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setIsProcessing(true);
    try {
      await departmentService.deleteDepartment(deptToDelete._id);
      showSuccess(`Department "${deptToDelete.code}" deleted.`);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cannot delete department (events or users linked)';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Departments</h1>
          <p className="page-subtitle">Configure constituent academic departments across institutes.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Filter by Institute */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Filter size={16} color="#64748b" />
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Filter by Institute:</label>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '220px' }}
          value={selectedInstituteFilter}
          onChange={(e) => setSelectedInstituteFilter(e.target.value)}
        >
          <option value="">All Institutes</option>
          {institutes.map((inst) => (
            <option key={inst._id} value={inst._id}>
              {inst.code} - {inst.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loader message="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Building size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Departments Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Code</th>
                <th>Department Name</th>
                <th>Parent Institute</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: '#7c3aed',
                      background: '#f5f3ff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      {dept.code}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                      {dept.name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                      {dept.instituteId?.code || 'CSPIT'} - {dept.instituteId?.name}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit department"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setDeptToDelete(dept)}
                        title="Delete department"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Parent Institute *</label>
            <select
              className="form-select"
              value={formData.instituteId}
              onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
              required
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
            <label className="form-label">Department Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CE, CSE, IT, ME"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Computer Engineering"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deptToDelete)}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete department "${deptToDelete?.name}" (${deptToDelete?.code})?`}
        confirmText="Delete Department"
        isDestructive={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdminDepartmentsPage;
