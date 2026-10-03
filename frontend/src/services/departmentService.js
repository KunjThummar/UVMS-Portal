import axiosInstance from '../api/axiosInstance';

export const departmentService = {
  listDepartments: async (instituteId) => {
    const url = instituteId ? `/departments?instituteId=${instituteId}` : '/departments';
    const res = await axiosInstance.get(url);
    const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return { success: true, data: items };
  },

  createDepartment: async (data) => {
    const res = await axiosInstance.post('/departments', data);
    return res.data;
  },

  updateDepartment: async (id, data) => {
    const res = await axiosInstance.put(`/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (id) => {
    const res = await axiosInstance.delete(`/departments/${id}`);
    return res.data;
  },
};

export default departmentService;
