import React, { useState, useEffect } from 'react';
import instituteService from '../../services/instituteService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

export const AdminInstitutesPage = () => {
  const [institutes, setInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [instituteToDelete, setInstituteToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({ name: '', code: '' });
  const { showSuccess, showError } = useToast();

  const fetchInstitutes = async () => {
    setIsLoading(true);
    try {
      const res = await instituteService.listInstitutes();
      const list = Array.isArray(res) ? res : (res.data || []);
      setInstitutes(list);
    } catch {
      showError('Failed to load institutes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleOpenCreate = () => {
    setEditingInstitute(null);
    setFormData({ name: '', code: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst) => {
    setEditingInstitute(inst);
    setFormData({ name: inst.name, code: inst.code });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingInstitute) {
        await instituteService.updateInstitute(editingInstitute._id, formData);
        showSuccess(`Institute "${formData.code}" updated!`);
      } else {
        await instituteService.createInstitute(formData);
        showSuccess(`Institute "${formData.code}" added!`);
      }
      setIsModalOpen(false);
      fetchInstitutes();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!instituteToDelete) return;
    setIsProcessing(true);
    try {
      await instituteService.deleteInstitute(instituteToDelete._id);
      showSuccess(`Institute "${instituteToDelete.code}" deleted.`);
      setInstituteToDelete(null);
      fetchInstitutes();
    } catch (err) {
      // Backend returns 409 if departments or users are linked
      const msg = err.response?.data?.message || err.message || 'Cannot delete institute (departments or users still linked)';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Institutes</h1>
          <p className="page-subtitle">Configure constituent institutes (e.g. CSPIT, DEPSTAR, CMPICA, I2IM).</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add Institute
        </button>
      </div>

      {isLoading ? (
        <Loader message="Loading institutes..." />
      ) : institutes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <Building2 size={40} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>No Institutes Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institute Code</th>
                <th>Institute Full Name</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map((inst) => (
                <tr key={inst._id}>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      {inst.code}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                      {inst.name}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenEdit(inst)}
                        title="Edit institute"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setInstituteToDelete(inst)}
                        title="Delete institute"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstitute ? 'Edit Institute' : 'Add New Institute'}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Institute Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CSPIT, DEPSTAR"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Institute Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Chandubhai S. Patel Institute of Technology"
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
              {isProcessing ? 'Saving...' : editingInstitute ? 'Update Institute' : 'Create Institute'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(instituteToDelete)}
        onClose={() => setInstituteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Institute"
        message={`Are you sure you want to delete institute "${instituteToDelete?.name}" (${instituteToDelete?.code})? This will fail if departments or users are still attached.`}
        confirmText="Delete Institute"
        isDestructive={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdminInstitutesPage;
