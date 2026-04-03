import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

// Text detection
export const detectText = async (text, title = '') => {
  const response = await api.post('/detect/text', { text, title });
  return response.data;
};

// Image detection
export const detectImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/detect/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Video detection
export const detectVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/detect/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  });
  return response.data;
};

// Get result by ID
export const getResult = async (id) => {
  const response = await api.get(`/results/${id}`);
  return response.data;
};

// Get detection history
export const getHistory = async (limit = 50) => {
  const response = await api.get(`/history?limit=${limit}`);
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
