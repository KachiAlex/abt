// API Client Service for ABT Frontend
// Centralized API communication with authentication and error handling

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('gpt_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

/**
 * Base fetch wrapper with authentication and error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('gpt_auth');
      window.location.href = '/';
      throw new Error('Authentication expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('API request was aborted');
      throw new Error('Request timeout. Please try again.');
    }
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Upload file with multipart/form-data
 */
const uploadFile = async (endpoint, formData) => {
  const token = getAuthToken();
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData, // FormData sets its own Content-Type with boundary
    });

    if (response.status === 401) {
      localStorage.removeItem('gpt_auth');
      window.location.href = '/';
      throw new Error('Authentication expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

export const authAPI = {
  login: (credentials) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) => 
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => 
    apiFetch('/auth/profile'),

  updateProfile: (userData) => 
    apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (passwordData) => 
    apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// ============================================================================
// PROJECT APIs
// ============================================================================

export const projectAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/projects?${params}`);
  },

  getById: (id) => 
    apiFetch(`/projects/${id}`),

  create: (projectData) => 
    apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  update: (id, projectData) => 
    apiFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  delete: (id) => 
    apiFetch(`/projects/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => 
    apiFetch('/projects/stats'),
};

// ============================================================================
// CONTRACTOR APIs
// ============================================================================

export const contractorAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/contractors?${params}`);
  },

  getById: (id) => 
    apiFetch(`/contractors/${id}`),

  getStats: (id) => 
    apiFetch(`/contractors/${id}/stats`),

  update: (id, contractorData) => 
    apiFetch(`/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contractorData),
    }),

  getPerformance: (id) => 
    apiFetch(`/contractors/${id}/performance`),

  assignProject: (assignmentData) => 
    apiFetch('/contractors/assign-project', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    }),
};

// ============================================================================
// SUBMISSION APIs
// ============================================================================

export const submissionAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/submissions?${params}`);
  },

  getById: (id) => 
    apiFetch(`/submissions/${id}`),

  create: (submissionData) => 
    apiFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),

  update: (id, submissionData) => 
    apiFetch(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    }),

  review: (id, reviewData) => 
    apiFetch(`/submissions/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),

  delete: (id) => 
    apiFetch(`/submissions/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => 
    apiFetch('/submissions/stats'),
};

// ============================================================================
// DASHBOARD APIs
// ============================================================================

export const dashboardAPI = {
  getStats: () => 
    apiFetch('/dashboard/stats'),

  getProjectStatusChart: () => 
    apiFetch('/dashboard/project-status-chart'),

  getBudgetAnalysis: () => 
    apiFetch('/dashboard/budget-analysis'),

  getLGAPerformance: () => 
    apiFetch('/dashboard/lga-performance'),

  getRecentActivity: () => 
    apiFetch('/dashboard/recent-activity'),
};

// ============================================================================
// PUBLIC APIs (No authentication required)
// ============================================================================

export const publicAPI = {
  getProjects: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/public/projects?${params}`);
  },

  getProjectById: (id) => 
    apiFetch(`/public/projects/${id}`),

  getStats: () => 
    apiFetch('/public/stats'),

  getProjectsByCategory: () => 
    apiFetch('/public/projects-by-category'),

  getProjectsByLGA: () => 
    apiFetch('/public/projects-by-lga'),

  searchProjects: (query) => 
    apiFetch(`/public/projects/search?q=${encodeURIComponent(query)}`),
};

// ============================================================================
// REPORT APIs
// ============================================================================

export const reportAPI = {
  getAll: () => 
    apiFetch('/reports'),

  generate: (reportConfig) => 
    apiFetch('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportConfig),
    }),

  download: (id) => {
    const token = getAuthToken();
    // For file downloads, we need to handle differently
    const url = `${API_BASE_URL}/reports/${id}/download`;
    window.open(url, '_blank');
  },
};

// ============================================================================
// USER APIs
// ============================================================================

export const userAPI = {
  getAll: () => 
    apiFetch('/users'),

  uploadProfileImage: (formData) => 
    uploadFile('/users/upload-profile-image', formData),

  getNotifications: () => 
    apiFetch('/users/notifications'),

  markNotificationRead: (id) => 
    apiFetch(`/users/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () => 
    apiFetch('/users/notifications/read-all', {
      method: 'PUT',
    }),
};

// ============================================================================
// DOCUMENT APIs
// ============================================================================

export const documentAPI = {
  upload: (formData) => 
    uploadFile('/documents/upload', formData),

  delete: (id) => 
    apiFetch(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Export everything as default as well
export default {
  authAPI,
  projectAPI,
  contractorAPI,
  submissionAPI,
  dashboardAPI,
  publicAPI,
  reportAPI,
  userAPI,
  documentAPI,
};

