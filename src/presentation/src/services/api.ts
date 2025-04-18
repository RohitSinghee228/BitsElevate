import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced post method with more logging
const enhancedPost = async (url: string, data: any) => {
  try {
    console.log(`API POST request to ${url}:`, JSON.stringify(data, null, 2));
    const response = await api.post(url, data);
    console.log(`API POST response from ${url}:`, response.data);
    return response;
  } catch (error) {
    console.error(`API POST error for ${url}:`, error);
    throw error;
  }
};

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API response error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// Export enhanced methods
export default {
  ...api,
  post: enhancedPost
}; 