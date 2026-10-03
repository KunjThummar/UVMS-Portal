import axiosInstance from '../api/axiosInstance';

export const adminEventService = {
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.eventLevel) params.append('eventLevel', filters.eventLevel);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = qs ? `/admin/events?${qs}` : '/admin/events';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  getEventById: async (id) => {
    const res = await axiosInstance.get(`/admin/events/${id}`);
    return res.data;
  },

  createEvent: async (data) => {
    const res = await axiosInstance.post('/admin/events', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await axiosInstance.put(`/admin/events/${id}`, data);
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await axiosInstance.delete(`/admin/events/${id}`);
    return res.data;
  },

  archiveEvent: async (id) => {
    const res = await axiosInstance.patch(`/admin/events/${id}/archive`);
    return res.data;
  },

  getAllApplications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.eventId) params.append('eventId', filters.eventId);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.status) params.append('status', filters.status);

    const qs = params.toString();
    const url = qs ? `/admin/applications?${qs}` : '/admin/applications';
    const res = await axiosInstance.get(url);
    return res.data;
  },

  exportEventsExcel: async (academicYear = '') => {
    const params = new URLSearchParams();
    if (academicYear && academicYear !== 'All') {
      params.append('academicYear', academicYear);
    }
    const qs = params.toString();
    const url = qs ? `/admin/events/export?${qs}` : '/admin/events/export';
    const res = await axiosInstance.get(url, { responseType: 'blob' });
    return res.data;
  },
};

export default adminEventService;
