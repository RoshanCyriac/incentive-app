import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create axios instance with baseURL from environment variable
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
});

/**
 * Request interceptor - adds JWT token to every request
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('incentive_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles 401 errors and redirects to login
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('incentive_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');

      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Auth API ====================
/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Token response with access_token, token_type, user_role, user_name
 */
export const login = (email, password) => {
  return client.post('/auth/login', { email, password });
};

/**
 * Get current user profile
 * @returns {Promise} Current user profile data
 */
export const getMe = () => {
  return client.get('/auth/me');
};

// ==================== Car Models API ====================
/**
 * Get all active car models
 * @returns {Promise} List of car models
 */
export const getCars = () => {
  return client.get('/admin/cars');
};

/**
 * Create a new car model
 * @param {object} data - Car model data (name, base_suffix, variant)
 * @returns {Promise} Created car model
 */
export const createCar = (data) => {
  return client.post('/admin/cars', data);
};

/**
 * Update existing car model
 * @param {string} id - Car model ID
 * @param {object} data - Updated car model data
 * @returns {Promise} Updated car model
 */
export const updateCar = (id, data) => {
  return client.put(`/admin/cars/${id}`, data);
};

/**
 * Delete (soft delete) car model
 * @param {string} id - Car model ID
 * @returns {Promise} Delete response
 */
export const deleteCar = (id) => {
  return client.delete(`/admin/cars/${id}`);
};

// ==================== Slab Rules API ====================
/**
 * Get all active slab rules
 * @returns {Promise} List of slab rules
 */
export const getSlabs = () => {
  return client.get('/admin/slabs');
};

/**
 * Create a new slab rule
 * @param {object} data - Slab rule data (min_qty, max_qty, incentive_per_car)
 * @returns {Promise} Created slab rule
 */
export const createSlab = (data) => {
  return client.post('/admin/slabs', data);
};

/**
 * Update existing slab rule
 * @param {string} id - Slab rule ID
 * @param {object} data - Updated slab rule data
 * @returns {Promise} Updated slab rule
 */
export const updateSlab = (id, data) => {
  return client.put(`/admin/slabs/${id}`, data);
};

/**
 * Delete slab rule
 * @param {string} id - Slab rule ID
 * @returns {Promise} Delete response
 */
export const deleteSlab = (id) => {
  return client.delete(`/admin/slabs/${id}`);
};

// ==================== User Management API ====================
/**
 * Get all officers
 * @returns {Promise} List of officers
 */
export const getUsers = () => {
  return client.get('/admin/users');
};

/**
 * Create new officer user
 * @param {object} data - User data (name, email, password, role)
 * @returns {Promise} Created user
 */
export const createUser = (data) => {
  return client.post('/admin/users', data);
};

// ==================== Sales Entry API ====================
/**
 * Get sales entries for specific month/year for current officer
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise} List of sales entries
 */
export const getSales = (month, year) => {
  return client.get('/officer/sales', {
    params: { month, year },
  });
};

/**
 * Create or update sales entry (upsert)
 * @param {object} data - Sales entry data (car_model_id, month, year, units_sold)
 * @returns {Promise} Upserted sales entry
 */
export const upsertSale = (data) => {
  return client.post('/officer/sales', data);
};

// ==================== Incentive Calculation API ====================
/**
 * Get incentive breakdown for specific month/year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise} Incentive breakdown with total_units, matched_slab, total_payout, etc.
 */
export const getIncentive = (month, year) => {
  return client.get('/officer/incentive', {
    params: { month, year },
  });
};

/**
 * Get sales history for last 12 months
 * @returns {Promise} List of monthly summaries (month, year, total_units, total_payout)
 */
export const getHistory = () => {
  return client.get('/officer/history');
};

// ==================== Officer Car Models API ====================
/**
 * Get available car models for officer (for sales entry form)
 * @returns {Promise} List of active car models
 */
export const getOfficerCars = () => {
  return client.get('/officer/cars');
};

export default client;
