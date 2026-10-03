import axiosInstance from '../api/axiosInstance';

export const userService = {
  // Student Directory
  listStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const qs = params.toString();
    const url = qs ? `/admin/students?${qs}` : '/admin/students';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  createStudent: async (data) => {
    const res = await axiosInstance.post('/admin/students', data);
    return res.data;
  },

  updateStudent: async (id, data) => {
    const res = await axiosInstance.put(`/admin/students/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id) => {
    const res = await axiosInstance.delete(`/admin/students/${id}`);
    return res.data;
  },

  toggleStudentStatus: async (id, isActive) => {
    const res = await axiosInstance.patch(`/admin/students/${id}/status`, { isActive });
    return res.data;
  },

  // Faculty Directory
  listFaculty: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const qs = params.toString();
    const url = qs ? `/admin/faculty?${qs}` : '/admin/faculty';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  createFaculty: async (data) => {
    const res = await axiosInstance.post('/admin/faculty', data);
    return res.data;
  },

  updateFaculty: async (id, data) => {
    const res = await axiosInstance.put(`/admin/faculty/${id}`, data);
    return res.data;
  },

  deleteFaculty: async (id) => {
    const res = await axiosInstance.delete(`/admin/faculty/${id}`);
    return res.data;
  },

  toggleFacultyStatus: async (id, isActive) => {
    const res = await axiosInstance.patch(`/admin/faculty/${id}/status`, { isActive });
    return res.data;
  },
};

export default userService;
