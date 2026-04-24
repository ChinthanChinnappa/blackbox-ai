import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};

export const register = async (username, email, password) => {
  const res = await api.post('/auth/register', { username, email, password });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
