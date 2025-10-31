import axiosInstance from '../library/axios';

/**
 * Fetch vehicle data from the backend API
 * @returns {Promise} Vehicle data response
 */
export const getVehicleData = async () => {
  try {
    const response = await axiosInstance.get('/vehicles/tracking');

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch vehicle data');
    }
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    throw error;
  }
};

/**
 * Parse vehicle data - now returns data as-is since backend already formats it
 * @param {Array} data - Vehicle data from backend
 * @returns {Array} Array of vehicle objects
 */
export const parseVehicleData = (data) => {
  // Backend already returns the data in the correct format
  return data;
};
