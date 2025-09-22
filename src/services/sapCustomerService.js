import axiosInstance from "../library/axios";

/**
 * Fetch customer details from SAP system via backend API
 * @param {string} mobileNumber - Mobile number to search for
 * @returns {Promise<Object>} - Promise that resolves to customer data or null
 */
export const fetchSapCustomerDetails = async (mobileNumber) => {
  try {
    if (!mobileNumber || typeof mobileNumber !== "string") {
      throw new Error("Valid mobile number is required");
    }

    // Clean the mobile number (remove any spaces, dashes, etc.)
    const cleanMobileNumber = mobileNumber.replace(/\D/g, "");

    if (cleanMobileNumber.length < 10) {
      throw new Error("Mobile number must be at least 10 digits");
    }

    console.log(`🔍 Fetching SAP customer details for: ${cleanMobileNumber}`);
    console.log(`📡 Making API call to: /sap/customer/${cleanMobileNumber}`);

    // // Get API key from environment variables
    // const apiKey = import.meta.env.VITE_SAP_API_KEY;

    // if (!apiKey) {
    //   throw new Error("SAP API key not configured in environment variables");
    // }

    // Make the API call to our backend which will proxy to SAP
    const response = await axiosInstance.get(`/sap/customer/${cleanMobileNumber}`);

    // Backend returns standardized response format
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Unexpected response format from backend");
    }
  } catch (error) {
    console.error("❌ SAP Customer API Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });

    // Handle different types of errors
    if (error.response?.data) {
      // Backend already handled the SAP error and returned structured response
      return error.response.data;
    } else if (error.response) {
      // Other backend errors
      const status = error.response.status;
      let message = "Failed to fetch customer details";

      if (status === 401) {
        message = "Authentication required";
      } else if (status === 403) {
        message = "Access denied";
      } else if (status === 500) {
        message = "Server error occurred";
      } else if (status >= 400 && status < 500) {
        message = "Invalid request";
      } else if (status >= 500) {
        message = "Service temporarily unavailable";
      }

      return {
        success: false,
        data: null,
        message: message,
        error: error.response.data || error.message,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        data: null,
        message: "Network error - Unable to connect to server",
        error: error.message,
      };
    } else {
      // Other error
      return {
        success: false,
        data: null,
        message: error.message || "Unknown error occurred",
        error: error.message,
      };
    }
  }
};

/**
 * Get cached customer details (if needed for performance)
 * @param {string} mobileNumber - Mobile number to search for
 * @returns {Object|null} - Cached customer data or null
 */
export const getCachedCustomerDetails = (mobileNumber) => {
  try {
    const cacheKey = `sap_customer_${mobileNumber}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);

      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    }

    return null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
};

/**
 * Cache customer details for performance
 * @param {string} mobileNumber - Mobile number key
 * @param {Object} customerData - Customer data to cache
 */
export const cacheCustomerDetails = (mobileNumber, customerData) => {
  try {
    const cacheKey = `sap_customer_${mobileNumber}`;
    const cacheData = {
      data: customerData,
      timestamp: Date.now(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching data:", error);
  }
};

/**
 * Fetch customer details with caching
 * @param {string} mobileNumber - Mobile number to search for
 * @param {boolean} forceRefresh - Force refresh from API (skip cache)
 * @returns {Promise<Object>} - Promise that resolves to customer data
 */
export const fetchSapCustomerDetailsWithCache = async (mobileNumber, forceRefresh = false) => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedCustomerDetails(mobileNumber);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: "Customer details fetched from cache",
          fromCache: true,
        };
      }
    }

    // Fetch from API
    const result = await fetchSapCustomerDetails(mobileNumber);

    // Cache successful results
    if (result.success && result.data) {
      cacheCustomerDetails(mobileNumber, result.data);
    }

    return {
      ...result,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error in fetchSapCustomerDetailsWithCache:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch customer details",
      error: error.message,
    };
  }
};

export default {
  fetchSapCustomerDetails,
  fetchSapCustomerDetailsWithCache,
  getCachedCustomerDetails,
  cacheCustomerDetails,
};