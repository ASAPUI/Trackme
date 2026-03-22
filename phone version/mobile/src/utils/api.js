import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Change this to your backend URL or ngrok URL when testing on device
export const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) AsyncStorage.removeItem('ft_token');
    return Promise.reject(err);
  }
);

export default api;
