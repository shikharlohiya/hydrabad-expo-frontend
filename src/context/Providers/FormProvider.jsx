import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../library/axios";
import FormContext from "../FormContext";

// Form status constants
export const FORM_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUBMITTING: "submitting",
  SUBMITTED: "submitted",
  ERROR: "error",
};

const FormProvider = ({ children }) => {
  // Form state management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState(FORM_STATUS.IDLE);
  const [currentCallDetails, setCurrentCallDetails] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    CallId: "",
    EmployeeId: "",
    callDateTime: "",
    callType: "",
    supportTypeId: "",
    inquiryNumber: "",
    processTypeId: "",
    queryTypeId: "",
    remarks: "",
    attachments: [],
    status: "closed",
    followUpDate: "",
  });

  // Dropdown options state
  const [dropdownOptions, setDropdownOptions] = useState({
    supportTypes: [],
    processTypes: [],
    queryTypes: [],
  });

  const [loadingOptions, setLoadingOptions] = useState({
    supportTypes: false,
    processTypes: false,
    queryTypes: false,
  });

  // Customer data state
  const [customerData, setCustomerData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  // Customer search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // UI state
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Error handling
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState(null);
  const [lastError, setLastError] = useState(null);

  // User data
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  // Mock customer database - replace with actual API
  const mockCustomerDatabase = {
    9301196473: {
      name: "John Doe",
      email: "john.doe@example.com",
      accountId: "ACC123456",
      phoneNumber: "9301196473",
      joinDate: "2023-01-15",
      lastActivity: "2024-12-20",
      accountType: "Premium",
      totalCalls: 12,
      status: "Active",
    },
    "+1234567890": {
      name: "John Doe",
      email: "john.doe@example.com",
      accountId: "ACC123456",
      phoneNumber: "+1234567890",
      joinDate: "2023-01-15",
      lastActivity: "2024-12-20",
      accountType: "Premium",
      totalCalls: 12,
      status: "Active",
    },
  };

  const mockCallHistoryDatabase = {
    ACC123456: [
      {
        id: 1,
        date: "2024-12-18",
        time: "14:30",
        duration: "12:45",
        type: "support",
        category: "technical",
        priority: "high",
        resolution: "Issue resolved - password reset",
        satisfaction: "satisfied",
        agent: "Agent Smith",
      },
    ],
  };

  // Fetch dropdown options from APIs
  const fetchDropdownOptions = async () => {
    try {
      // Fetch support types
      setLoadingOptions((prev) => ({ ...prev, supportTypes: true }));
      const supportTypesResponse = await axiosInstance.get("/support-types");
      if (supportTypesResponse.data.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          supportTypes: supportTypesResponse.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching support types:", error);
      setLastError("Failed to load support types");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, supportTypes: false }));
    }

    try {
      // Fetch process types
      setLoadingOptions((prev) => ({ ...prev, processTypes: true }));
      const processTypesResponse = await axiosInstance.get("/process-types");
      if (processTypesResponse.data.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          processTypes: processTypesResponse.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching process types:", error);
      setLastError("Failed to load process types");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, processTypes: false }));
    }

    try {
      // Fetch query types
      setLoadingOptions((prev) => ({ ...prev, queryTypes: true }));
      const queryTypesResponse = await axiosInstance.get("/query-types");
      if (queryTypesResponse.data.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          queryTypes: queryTypesResponse.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching query types:", error);
      setLastError("Failed to load query types");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, queryTypes: false }));
    }
  };

  // Initialize dropdown options on mount
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  // Open form with call details
  const openForm = (callDetails) => {
    console.log("📝 Opening form with call details:", callDetails);

    setCurrentCallDetails(callDetails);
    setIsFormOpen(true);
    setFormStatus(FORM_STATUS.IDLE);
    setErrors({});
    setSubmissionError(null);

    // Auto-populate form data
    populateFormData(callDetails);

    // Auto-search customer if phone number is available
    if (callDetails?.number) {
      searchCustomer(callDetails.number);
    }
  };

  // Close form and reset state
  const closeForm = () => {
    console.log("📝 Closing form");

    setIsFormOpen(false);
    setFormStatus(FORM_STATUS.IDLE);
    setCurrentCallDetails(null);
    resetFormData();
    resetCustomerData();
    setErrors({});
    setSubmissionError(null);
    setLastError(null);
  };

  // Populate form with call details
  const populateFormData = (callDetails) => {
    const callDateTime = callDetails?.startTime
      ? new Date(callDetails.startTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    const callType =
      callDetails?.callType === "incoming" ? "InBound" : "OutBound";
    const inquiryNumber = orderData?.orderId || customerData?.accountId || "";

    setFormData((prev) => ({
      ...prev,
      CallId: callDetails?.CallId || "",
      EmployeeId: userData?.EmployeeId || callDetails?.EmployeeId || "",
      callDateTime: callDateTime,
      callType: callType,
      inquiryNumber: inquiryNumber,
    }));
  };

  // Reset form data to initial state
  const resetFormData = () => {
    setFormData({
      CallId: "",
      EmployeeId: "",
      callDateTime: "",
      callType: "",
      supportTypeId: "",
      inquiryNumber: "",
      processTypeId: "",
      queryTypeId: "",
      remarks: "",
      attachments: [],
      status: "closed",
      followUpDate: "",
    });
  };

  // Reset customer data
  const resetCustomerData = () => {
    setCustomerData(null);
    setOrderData(null);
    setCallHistory([]);
    setIsSearching(false);
    setSearchError(null);
    setHasSearched(false);
    setShowCustomerPanel(false);
    setActiveTab("info");
  };

  // Handle form input changes
  const updateFormData = useCallback(
    (name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear follow-up date if status is changed to closed
      if (name === "status" && value === "closed") {
        setFormData((prev) => ({
          ...prev,
          followUpDate: "",
        }));
      }

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  // Handle file attachments
  const updateFormFiles = (files) => {
    setFormData((prev) => ({
      ...prev,
      attachments: Array.from(files),
    }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee ID is required";
    }

    if (!formData.callDateTime) {
      newErrors.callDateTime = "Call date and time is required";
    }

    if (!formData.supportTypeId) {
      newErrors.supportTypeId = "Support type is required";
    }

    if (!formData.processTypeId) {
      newErrors.processTypeId = "Process type is required";
    }

    if (!formData.queryTypeId) {
      newErrors.queryTypeId = "Query type is required";
    }

    if (!formData.remarks.trim()) {
      newErrors.remarks = "Remarks are required";
    }

    if (formData.status === "open" && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required for open tickets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form data
  // Submit form data
  const submitForm = async () => {
    console.log("📝 Submitting form data");

    if (!validateForm()) {
      setFormStatus(FORM_STATUS.ERROR);
      return Promise.reject(new Error("Form validation failed"));
    }

    try {
      setFormStatus(FORM_STATUS.SUBMITTING);
      setSubmissionError(null);

      // Prepare form data for submission
      const enhancedFormData = {
        ...formData,
        // Set inquiryNumber to customerPhoneNumber instead of account ID
        inquiryNumber: currentCallDetails?.number || formData.inquiryNumber,
        // Don't include callDuration and customerPhoneNumber in payload
      };

      console.log("📝 Enhanced form data:", enhancedFormData);

      // Create FormData for multipart submission
      const submissionData = new FormData();

      // List of fields to exclude from the payload
      const excludedFields = [
        "callDuration",
        "customerPhoneNumber",
        "customerData",
        "orderData",
        "submittedAt",
        "attachments", // Handle attachments separately
      ];

      Object.keys(enhancedFormData).forEach((key) => {
        if (key === "attachments") {
          if (
            enhancedFormData.attachments &&
            enhancedFormData.attachments.length > 0
          ) {
            enhancedFormData.attachments.forEach((file) => {
              submissionData.append("attachments", file);
            });
          }
        } else if (excludedFields.includes(key)) {
          // Skip these fields - don't include them in the payload
          return;
        } else if (
          enhancedFormData[key] !== "" &&
          enhancedFormData[key] !== null &&
          enhancedFormData[key] !== undefined
        ) {
          submissionData.append(key, enhancedFormData[key]);
        }
      });

      const response = await axiosInstance.post(
        "/form-details",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Submission failed");
      }

      console.log("✅ Form submitted successfully:", response.data);
      setFormStatus(FORM_STATUS.SUBMITTED);

      // Auto-close form after successful submission (with a small delay for user feedback)
      setTimeout(() => {
        closeForm();
      }, 1500);

      return Promise.resolve(response.data);
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setFormStatus(FORM_STATUS.ERROR);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while submitting the form";

      setSubmissionError(errorMessage);
      setLastError(errorMessage);

      return Promise.reject(new Error(errorMessage));
    }
  };

  // Customer search functionality
  const searchCustomerAPI = async (searchTerm) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer = mockCustomerDatabase[searchTerm];
        const history = customer
          ? mockCallHistoryDatabase[customer.accountId] || []
          : [];
        resolve({ customer, history });
      }, 1000);
    });
  };

  const searchCustomer = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchError("Please enter a customer ID or phone number");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const { customer, history } = await searchCustomerAPI(searchTerm.trim());

      if (customer) {
        setCustomerData(customer);
        setCallHistory(history);
        setShowCustomerPanel(true);
        setSearchError(null);

        console.log("✅ Customer found:", customer);
      } else {
        setCustomerData(null);
        setCallHistory([]);
        setSearchError(
          "Customer not found. Please check the ID or phone number."
        );

        console.log("❌ Customer not found for:", searchTerm);
      }
    } catch (error) {
      console.error("❌ Customer search error:", error);
      setSearchError("Search failed. Please try again.");
      setCustomerData(null);
      setCallHistory([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper functions
  const hasFormData = () => {
    return (
      formData.supportTypeId ||
      formData.processTypeId ||
      formData.queryTypeId ||
      formData.remarks.trim() ||
      formData.attachments.length > 0 ||
      formData.status !== "closed" ||
      formData.followUpDate
    );
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && validateForm();
  };

  const getStatusColor = () => {
    switch (formStatus) {
      case FORM_STATUS.SUBMITTED:
        return "text-green-500";
      case FORM_STATUS.SUBMITTING:
      case FORM_STATUS.LOADING:
        return "text-yellow-500";
      case FORM_STATUS.ERROR:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (formStatus) {
      case FORM_STATUS.IDLE:
        return "Ready";
      case FORM_STATUS.LOADING:
        return "Loading...";
      case FORM_STATUS.SUBMITTING:
        return "Submitting...";
      case FORM_STATUS.SUBMITTED:
        return "Submitted Successfully";
      case FORM_STATUS.ERROR:
        return "Error";
      default:
        return "Unknown";
    }
  };

  // Context value
  const value = {
    // Form state
    isFormOpen,
    formStatus,
    currentCallDetails,
    formData,
    errors,
    submissionError,
    lastError,

    // Dropdown options
    dropdownOptions,
    loadingOptions,

    // Customer data
    customerData,
    orderData,
    callHistory,
    isSearching,
    searchError,
    hasSearched,

    // UI state
    showCustomerPanel,
    activeTab,

    // User data
    userData,

    // Actions
    openForm,
    closeForm,
    updateFormData,
    updateFormFiles,
    submitForm,
    searchCustomer,
    setShowCustomerPanel,
    setActiveTab,
    fetchDropdownOptions,

    // Helpers
    hasFormData,
    isFormValid,
    getStatusColor,
    getStatusText,
    validateForm,

    // Constants
    FORM_STATUS,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export default FormProvider;
