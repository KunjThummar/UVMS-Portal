import axiosInstance from '../api/axiosInstance';

export const instituteService = {
  listInstitutes: async () => {
    const res = await axiosInstance.get('/institutes');
    const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return { success: true, data: items };
  },

  createInstitute: async (data) => {
    const res = await axiosInstance.post('/institutes', data);
    return res.data;
  },

  updateInstitute: async (id, data) => {
    const res = await axiosInstance.put(`/institutes/${id}`, data);
    return res.data;
  },

  deleteInstitute: async (id) => {
    const res = await axiosInstance.delete(`/institutes/${id}`);
    return res.data;
  },
};

export default instituteService;
