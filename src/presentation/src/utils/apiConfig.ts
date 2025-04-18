// API Base URL configuration
export const API_BASE_URL = 'http://localhost:3001/api';

// Endpoints
export const ENDPOINTS = {
  // Course Management
  COURSES: {
    CREATE: `${API_BASE_URL}/courses/courseManagement/create`,
    GET_ALL: `${API_BASE_URL}/courses/courseManagement/getAll`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/courses/courseManagement/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/courses/courseManagement/${id}`,
    ENROLL: `${API_BASE_URL}/courses/courseManagement/enroll`,
    COMPLETED_COURSE: `${API_BASE_URL}/courses/courseManagement/completedCourse`,
    SAVE_PROGRESS: `${API_BASE_URL}/courses/courseManagement/saveProgress`,
    ENROLLED_COURSES: (userId: string) => `${API_BASE_URL}/courses/courseManagement/enrolledCourses/${userId}`,
    ENROLLED_COURSE_DETAILS: (userId: string, courseId: string) => 
      `${API_BASE_URL}/courses/courseManagement/enrolledCourses/${userId}/${courseId}`,
    COMPLETED_COURSES: (userId: string) => `${API_BASE_URL}/courses/courseManagement/completedCourses/${userId}`,
  },
  // Add other endpoints here as needed
};

// Get Authorization header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export default {
  API_BASE_URL,
  ENDPOINTS,
  getAuthHeader,
}; 