import api from './api';

export const getInvestigations = (params) => api.get('/investigations', { params });
export const getInvestigation = (id) => api.get(`/investigations/${id}`);
export const createInvestigation = (data) => api.post('/investigations', data);
export const updateInvestigation = (id, data) => api.put(`/investigations/${id}`, data);
export const deleteInvestigation = (id) => api.delete(`/investigations/${id}`);
export const getStats = () => api.get('/investigations/stats');
export const getRecentActivity = () => api.get('/investigations/recent-activity');

export const getLogs = (invId, params) => api.get(`/investigations/${invId}/logs`, { params });
export const addLog = (invId, data) => api.post(`/investigations/${invId}/logs`, data);
export const updateLogTag = (invId, logId, tag) => api.patch(`/investigations/${invId}/logs/${logId}/tag`, { tag });
export const deleteLog = (invId, logId) => api.delete(`/investigations/${invId}/logs/${logId}`);

export const getDatasets = () => api.get('/datasets');
export const uploadDataset = (formData) => api.post('/datasets/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteDataset = (id) => api.delete(`/datasets/${id}`);

export const getSessions = (params) => api.get('/activity/sessions', { params });
export const getActivityStats = () => api.get('/activity/stats');
export const flagSession = (id, reason) => api.patch(`/activity/sessions/${id}/flag`, { reason });
