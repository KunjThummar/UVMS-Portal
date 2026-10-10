import axiosInstance from '../api/axiosInstance';

export const authService = {
  // Student Auth
  loginStudent: async (email, password) => {
    const res = await axiosInstance.post('/auth/student/login', { email, password });
    return res.data?.data || res.data;
  },

  registerStudent: async (data) => {
    const res = await axiosInstance.post('/auth/student/register', data);
    return res.data?.data || res.data;
  },

  // Faculty Auth
  loginFaculty: async (email, password) => {
    const res = await axiosInstance.post('/auth/faculty/login', { email, password });
    return res.data?.data || res.data;
  },

  registerFaculty: async (data) => {
    const res = await axiosInstance.post('/auth/faculty/register', data);
    return res.data?.data || res.data;
  },

  // Admin Auth
  loginAdmin: async (email, password) => {
    const res = await axiosInstance.post('/auth/admin/login', { email, password });
    return res.data?.data || res.data;
  },

  // Fetch Current Logged-in User
  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res.data;
  },

  // Logout
  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data;
  },
};

export default authService;
