import axiosInstance from '../api/axiosInstance';

export const studentService = {
  getProfile: async () => {
    const res = await axiosInstance.get('/student/profile');
    return res.data;
  },

  getEligibleEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/student/events?${queryString}` : '/student/events';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  getEventById: async (id) => {
    const res = await axiosInstance.get(`/student/events/${id}`);
    return res.data;
  },

  applyToEvent: async (id, data) => {
    // data: { appliedRole: 'Coordinator' | 'Sub-Coordinator' | 'Volunteer', previousExperience: string }
    const res = await axiosInstance.post(`/student/events/${id}/apply`, data);
    return res.data;
  },

  getMyApplications: async (status) => {
    const url = status && status !== 'All' ? `/student/applications?status=${status}` : '/student/applications';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  getParticipationHistory: async () => {
    const res = await axiosInstance.get('/student/history');
    return res.data;
  },
};

export default studentService;
