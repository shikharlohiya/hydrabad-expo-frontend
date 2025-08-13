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

// Helper function to get persisted form state
const getPersistedFormState = () => {
  try {
    const persistedState = localStorage.getItem("formState");
    return persistedState ? JSON.parse(persistedState) : null;
  } catch (error) {
    console.error("Error loading persisted form state:", error);
    return null;
  }
};

const FormProvider = ({ children }) => {
  // Load persisted state on mount
  const persistedFormState = getPersistedFormState();

  // Form state management - initialize with persisted values if available
  const [isFormOpen, setIsFormOpen] = useState(
    persistedFormState?.isFormOpen || false
  );
  const [formStatus, setFormStatus] = useState(
    persistedFormState?.formStatus || FORM_STATUS.IDLE
  );
  const [currentCallDetails, setCurrentCallDetails] = useState(
    persistedFormState?.currentCallDetails || null
  );
  // Saved contact info from /contact/mobile API
  const [savedContactData, setSavedContactData] = useState(
    persistedFormState?.savedContactData || null
  );

  // Form data state - initialize with persisted values if available
  const [formData, setFormData] = useState(
    persistedFormState?.formData || {
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
    }
  );

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

  // Trader Not Found form state
  const [traderNotFoundData, setTraderNotFoundData] = useState(
    persistedFormState?.traderNotFoundData || {
      name: "",
      region: "",
      type: "Trader",
    }
  );

  // Customer data state - initialize with persisted values if available
  const [customerData, setCustomerData] = useState(
    persistedFormState?.customerData || null
  );
  const [orderData, setOrderData] = useState(
    persistedFormState?.orderData || null
  );
  const [callHistory, setCallHistory] = useState(
    persistedFormState?.callHistory || []
  );

  // Customer search state - initialize with persisted values if available
  const [isSearching, setIsSearching] = useState(false); // Don't persist loading states
  const [searchError, setSearchError] = useState(null); // Don't persist errors
  const [hasSearched, setHasSearched] = useState(
    persistedFormState?.hasSearched || false
  );

  // UI state - initialize with persisted values if available
  const [showCustomerPanel, setShowCustomerPanel] = useState(
    persistedFormState?.showCustomerPanel || false
  );
  const [activeTab, setActiveTab] = useState(
    persistedFormState?.activeTab || "info"
  );

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

  // Function to persist form state to localStorage
  const persistFormState = () => {
    try {
      const stateToSave = {
        isFormOpen,
        formStatus,
        currentCallDetails,
        formData: {
          ...formData,
          attachments: [], // Don't persist file objects
        },
        traderNotFoundData,
        customerData,
        savedContactData,
        orderData,
        callHistory,
        hasSearched,
        showCustomerPanel,
        activeTab,
        timestamp: Date.now(), // Add timestamp for expiry check
      };

      localStorage.setItem("formState", JSON.stringify(stateToSave));
      console.log("📝 Form state persisted:", stateToSave);
    } catch (error) {
      console.error("❌ Error persisting form state:", error);
    }
  };

  // Auto-persist form state whenever it changes
  useEffect(() => {
    // Only persist if form is open or has meaningful data
    if (isFormOpen || formData.CallId || formData.remarks || customerData) {
      persistFormState();
    }
  }, [
    isFormOpen,
    formStatus,
    currentCallDetails,
    formData,
    customerData,
    orderData,
    callHistory,
    hasSearched,
    showCustomerPanel,
    activeTab,
  ]);

  // Clear expired persisted form state on mount and handle recovery
  useEffect(() => {
    if (persistedFormState?.timestamp) {
      const now = Date.now();
      const stateAge = now - persistedFormState.timestamp;
      const maxAge = 30 * 60 * 1000; // 30 minutes

      if (stateAge > maxAge) {
        console.log("🧹 Clearing expired form state");
        localStorage.removeItem("formState");
      } else {
        console.log(
          "📝 Restored form state from localStorage:",
          persistedFormState
        );

        // If the form was open before refresh and we have call details, keep it open
        if (
          persistedFormState.isFormOpen &&
          persistedFormState.currentCallDetails
        ) {
          console.log("🔄 Form was open before refresh, keeping it open");
          // Form state is already restored through initialization
        }
      }
    }
  }, []);

  const fetchSavedContactData = async (phoneNumber) => {
    if (!phoneNumber) return;

    try {
      const res = await axiosInstance.get(`/trader/mobile/${phoneNumber}`);
      if (res.data?.success && res.data?.data) {
        setSavedContactData(res.data.data);
      } else {
        setSavedContactData(null);
      }
    } catch (err) {
      console.error("❌ Error fetching saved contact info:", err);
      setSavedContactData(null);
    }
  };

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
    if (callDetails?.number) {
      fetchSavedContactData(callDetails.number);
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

    // Clear persisted form state
    localStorage.removeItem("formState");
    console.log("🧹 Cleared persisted form state");
  };

  // Populate form with call details
  const populateFormData = (callDetails) => {
    const callDateTime = callDetails?.startTime
      ? new Date(callDetails.startTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    // Debug logging to identify the issue
    console.log(
      "📝 PopulateFormData - callDetails.callType:",
      callDetails?.callType
    );
    console.log("📝 PopulateFormData - callDetails.type:", callDetails?.type);
    console.log(
      "📝 PopulateFormData - callDetails.direction:",
      callDetails?.direction
    );
    console.log(
      "📝 PopulateFormData - callDetails.callDirection:",
      callDetails?.callDirection
    );
    console.log("📝 PopulateFormData - Full callDetails:", callDetails);

    // Check multiple possible property names for call type
    const rawCallType =
      callDetails?.callType ||
      callDetails?.callDirection ||
      callDetails?.type ||
      callDetails?.direction;

    let callType = "OutBound"; // Default
    if (
      rawCallType === "incoming" ||
      rawCallType === "inbound" ||
      rawCallType === "InBound"
    ) {
      callType = "InBound";
    } else if (
      rawCallType === "outgoing" ||
      rawCallType === "outbound" ||
      rawCallType === "OutBound"
    ) {
      callType = "OutBound";
    }

    console.log(
      "📝 PopulateFormData - Raw call type:",
      rawCallType,
      "-> Final call type:",
      callType
    );

    const inquiryNumber = orderData?.orderId || customerData?.accountId || "";

    // Extract CallId from multiple possible sources
    const callId = callDetails?.CallId || callDetails?.callId || "";

    console.log("📝 PopulateFormData - CallId being set:", callId);

    console.log("📝 Setting formData with callType:", callType);
    setFormData((prev) => {
      console.log("📝 Previous formData.callType:", prev.callType);
      const newFormData = {
        ...prev,
        CallId: callId,
        EmployeeId: userData?.EmployeeId || callDetails?.EmployeeId || "",
        callDateTime: callDateTime,
        callType: callType,
        inquiryNumber: inquiryNumber,
      };
      console.log("📝 New formData.callType:", newFormData.callType);
      console.log("📝 FIXED: Ensuring callType is properly set to:", callType);
      return newFormData;
    });
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
      if (name === "callType") {
        console.log("📝 updateFormData - callType being changed to:", value);
      }
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
  // const submitForm = async () => {
  //   console.log("📝 Submitting form data");

  //   if (!validateForm()) {
  //     setFormStatus(FORM_STATUS.ERROR);
  //     return Promise.reject(new Error("Form validation failed"));
  //   }

  //   try {
  //     setFormStatus(FORM_STATUS.SUBMITTING);
  //     setSubmissionError(null);

  //     // Prepare form data for submission
  //     const enhancedFormData = {
  //       ...formData,
  //       // Set inquiryNumber to customerPhoneNumber instead of account ID
  //       inquiryNumber: currentCallDetails?.number || formData.inquiryNumber,
  //       // Don't include callDuration and customerPhoneNumber in payload
  //     };

  //     console.log("📝 Enhanced form data:", enhancedFormData);

  //     // Create FormData for multipart submission
  //     const submissionData = new FormData();

  //     // List of fields to exclude from the payload
  //     const excludedFields = [
  //       "callDuration",
  //       "customerPhoneNumber",
  //       "customerData",
  //       "orderData",
  //       "submittedAt",
  //       "attachments", // Handle attachments separately
  //     ];

  //     Object.keys(enhancedFormData).forEach((key) => {
  //       if (key === "attachments") {
  //         if (
  //           enhancedFormData.attachments &&
  //           enhancedFormData.attachments.length > 0
  //         ) {
  //           enhancedFormData.attachments.forEach((file) => {
  //             submissionData.append("attachments", file);
  //           });
  //         }
  //       } else if (excludedFields.includes(key)) {
  //         // Skip these fields - don't include them in the payload
  //         return;
  //       } else if (
  //         enhancedFormData[key] !== "" &&
  //         enhancedFormData[key] !== null &&
  //         enhancedFormData[key] !== undefined
  //       ) {
  //         submissionData.append(key, enhancedFormData[key]);
  //       }
  //     });

  //     const response = await axiosInstance.post(
  //       "/form-details",
  //       submissionData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (!response.data.success) {
  //       throw new Error(response.data.message || "Submission failed");
  //     }

  //     console.log("✅ Form submitted successfully:", response.data);
  //     setFormStatus(FORM_STATUS.SUBMITTED);

  //     // Auto-close form after successful submission (with a small delay for user feedback)
  //     setTimeout(() => {
  //       closeForm();
  //     }, 1500);

  //     return Promise.resolve(response.data);
  //   } catch (error) {
  //     console.error("❌ Error submitting form:", error);
  //     setFormStatus(FORM_STATUS.ERROR);

  //     const errorMessage =
  //       error.response?.data?.message ||
  //       error.message ||
  //       "An error occurred while submitting the form";

  //     setSubmissionError(errorMessage);
  //     setLastError(errorMessage);

  //     return Promise.reject(new Error(errorMessage));
  //   }
  // };
  const submitForm = async (contactData = null) => {
    console.log("📝 Submitting form data");
    console.log("📝 Contact data received:", contactData);

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
        inquiryNumber: currentCallDetails?.number || formData.inquiryNumber,
      };

      // Merge contact data from props or Trader Not Found form state
      const finalTraderData = contactData?.name
        ? {
            Contact_Name: contactData.name,
            Region: contactData.region || "",
            Type: contactData.type || "Trader",
          }
        : {
            Contact_Name: traderNotFoundData.name,
            Region: traderNotFoundData.region || "",
            Type: traderNotFoundData.type || "Trader",
          };

      Object.assign(enhancedFormData, finalTraderData);

      console.log("📝 Enhanced form data:", enhancedFormData);
      console.log("📝 CallId being submitted:", enhancedFormData.CallId);
      console.log("📝 CallType being submitted:", enhancedFormData.callType);
      console.log("📝 Contact data being submitted:", {
        Contact_Name: enhancedFormData.Contact_Name,
        Region: enhancedFormData.Region,
        Type: enhancedFormData.Type,
      });

      if (!enhancedFormData.CallId) {
        console.error("❌ WARNING: CallId is missing from form submission!");
        console.log("📝 Current currentCallDetails:", currentCallDetails);
        console.log("📝 Current formData:", formData);
      }

      // Create FormData for multipart submission
      const submissionData = new FormData();

      const excludedFields = [
        "callDuration",
        "customerPhoneNumber",
        "customerData",
        "orderData",
        "submittedAt",
        "attachments",
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
          return;
        } else if (
          enhancedFormData[key] !== "" &&
          enhancedFormData[key] !== null &&
          enhancedFormData[key] !== undefined
        ) {
          submissionData.append(key, enhancedFormData[key]);
          // Log important fields
          if (key === "callType") {
            console.log(
              "📝 Adding callType to FormData:",
              enhancedFormData[key]
            );
          }
          if (key === "Contact_Name" || key === "Region" || key === "Type") {
            console.log(`📝 Adding ${key} to FormData:`, enhancedFormData[key]);
          }
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

      // Emit event to notify DialerProvider that form was submitted
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("formSubmitted", {
            detail: {
              callId: enhancedFormData.CallId,
              success: true,
            },
          })
        );
      }

      // Auto-close form after successful submission
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
    traderNotFoundData,
    setTraderNotFoundData,

    // UI state
    showCustomerPanel,
    activeTab,

    // User data
    userData,
    savedContactData,

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
