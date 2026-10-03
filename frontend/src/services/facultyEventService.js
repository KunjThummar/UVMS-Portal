import axiosInstance from '../api/axiosInstance';

export const facultyEventService = {
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = qs ? `/faculty/events?${qs}` : '/faculty/events';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  getEventById: async (id) => {
    const res = await axiosInstance.get(`/faculty/events/${id}`);
    return res.data;
  },

  createEvent: async (data) => {
    const res = await axiosInstance.post('/faculty/events', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await axiosInstance.put(`/faculty/events/${id}`, data);
    return res.data;
  },

  reopenEvent: async (id) => {
    const res = await axiosInstance.patch(`/faculty/events/${id}/reopen`);
    return res.data;
  },

  archiveEvent: async (id) => {
    const res = await axiosInstance.patch(`/faculty/events/${id}/archive`);
    return res.data;
  },

  notifyStudents: async (id) => {
    const res = await axiosInstance.post(`/faculty/events/${id}/notify`);
    return res.data;
  },

  getApplicationsForEvent: async (eventId, status) => {
    const url = status && status !== 'All' 
      ? `/faculty/events/${eventId}/applications?status=${status}` 
      : `/faculty/events/${eventId}/applications`;
    const res = await axiosInstance.get(url);
    return res.data;
  },

  approveApplication: async (applicationId) => {
    const res = await axiosInstance.patch(`/faculty/applications/${applicationId}/approve`);
    return res.data;
  },

  rejectApplication: async (applicationId) => {
    const res = await axiosInstance.patch(`/faculty/applications/${applicationId}/reject`);
    return res.data;
  },

  getStudentHistory: async (studentId) => {
    const res = await axiosInstance.get(`/applications/student/${studentId}/history`);
    return res.data;
  }
};

export default facultyEventService;
