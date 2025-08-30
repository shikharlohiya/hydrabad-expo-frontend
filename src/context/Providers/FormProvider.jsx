import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../library/axios";
import useSocket from "../../hooks/useSocket";
import FormContext from "../FormContext";

// Form status constants
export const FORM_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUBMITTING: "submitting",
  SUBMITTED: "submitted",
  ERROR: "error",
};

const getLocalDateTimeString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // ================================================================================
  // CALL STATE MANAGEMENT (New)
  // ================================================================================
  const [activeCallState, setActiveCallState] = useState(
    persistedFormState?.activeCallState || {
      callId: null,
      customerNumber: null,
      agentNumber: null,
      callDirection: null,
      startTime: null,
      endTime: null,
      isActive: false,
      recordingUrl: null,
      duration: null,
      hangupCause: null,
    }
  );

  // ================================================================================
  // FORM STATE MANAGEMENT (Existing)
  // ================================================================================
  const [isFormOpen, setIsFormOpen] = useState(
    persistedFormState?.isFormOpen || false
  );
  const [formStatus, setFormStatus] = useState(
    persistedFormState?.formStatus || FORM_STATUS.IDLE
  );
  const [currentCallDetails, setCurrentCallDetails] = useState(
    persistedFormState?.currentCallDetails || null
  );

  const [savedContactData, setSavedContactData] = useState(
    persistedFormState?.savedContactData || null
  );

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
      problemId: "",
      subProblemId: "",
      remarks: "",
      attachments: [],
      status: "closed",
      followUpDate: "",
    }
  );

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

  const [traderNotFoundData, setTraderNotFoundData] = useState(
    persistedFormState?.traderNotFoundData || {
      name: "",
      region: "",
      type: "Trader",
    }
  );

  const [orderData, setOrderData] = useState(
    persistedFormState?.orderData || null
  );

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

  // Socket integration
  const { registerCallEventHandlers, isConnected } = useSocket();

  // ================================================================================
  // SOCKET EVENT HANDLERS (New)
  // ================================================================================
  useEffect(() => {
    registerCallEventHandlers({
      // Outgoing call connected
      onCallConnected: (data) => {
        console.log("FormProvider - Outgoing call connected:", data);

        // Filter calls for current user
        if (!isCallForCurrentUser(data)) {
          // console.log("FormProvider - Call not for current user, ignoring");
          return;
        }

        // If form is open, reset it for the new call
        if (isFormOpen) {
          console.log(
            "FormProvider - Form is already open, resetting for new call."
          );
          resetFormData();
          setTraderNotFoundData({
            name: "",
            region: "",
            type: "Trader",
          });
          setSavedContactData(null);
        }

        // Update call state
        setActiveCallState({
          callId: data.callId,
          customerNumber: data.customerNumber,
          agentNumber: data.agentNumber,
          callDirection: "outgoing",
          startTime: new Date(data.startTime || Date.now()),
          isActive: true,
          endTime: null,
          recordingUrl: null,
          duration: null,
          hangupCause: null,
        });

        // Auto-open form
        const callDetails = {
          CallId: data.callId,
          number: data.customerNumber,
          callDirection: "outgoing",
          startTime: new Date(data.startTime || Date.now()),
          EmployeeId: userData.EmployeeId,
        };

        console.log(
          "FormProvider - Opening form for outgoing call:",
          callDetails
        );
        openForm(callDetails);
      },

      // Incoming call connected
      onIncomingCallConnected: (data) => {
        console.log("FormProvider - Incoming call connected:", data);

        // Filter calls for current user
        if (!isCallForCurrentUser(data)) {
          // console.log("FormProvider - Call not for current user, ignoring");
          return;
        }

        // If form is open, reset it for the new call
        if (isFormOpen) {
          console.log(
            "FormProvider - Form is already open, resetting for new call."
          );
          resetFormData();
          setTraderNotFoundData({
            name: "",
            region: "",
            type: "Trader",
          });
          setSavedContactData(null);
        }

        // Update call state
        setActiveCallState({
          callId: data.callId,
          customerNumber: data.callerNumber,
          agentNumber: data.agentNumber,
          callDirection: "incoming",
          startTime: new Date(data.startTime || Date.now()),
          isActive: true,
          endTime: null,
          recordingUrl: null,
          duration: null,
          hangupCause: null,
        });

        // Auto-open form
        const callDetails = {
          CallId: data.callId,
          number: data.callerNumber,
          callDirection: "incoming",
          startTime: new Date(data.startTime || Date.now()),
          EmployeeId: userData.EmployeeId,
        };

        console.log(
          "FormProvider - Opening form for incoming call:",
          callDetails
        );
        openForm(callDetails);
      },

      // Call disconnected
      onCallDisconnected: (data) => {
        console.log("FormProvider - Call disconnected:", data);

        // Check if it's for current active call
        if (data.callId !== activeCallState.callId) {
          // console.log(
          //   "FormProvider - Disconnect not for current call, ignoring"
          // );
          return;
        }

        // Update call state
        setActiveCallState((prev) => ({
          ...prev,
          isActive: false,
          endTime: new Date(data.endTime || Date.now()),
          recordingUrl: data.recordingUrl,
          duration: data.duration,
          hangupCause: data.hangupCause,
        }));

        // console.log(
        //   "FormProvider - Call ended, form remains open for completion"
        // );
        // Note: We don't close the form here - let user complete it
      },

      // Legacy handlers (keep for backward compatibility)
      onIncomingCallStatus: (data) => {
        console.log("FormProvider - Legacy incoming call status:", data);

        // Handle legacy incoming call format
        const eventType = data.event || data.eventType;
        if (eventType === "oncallconnect" || eventType === "incoming_call") {
          const legacyData = {
            callId: data.callid || data.call_id || data.callId || data.uuid,
            callerNumber: data.caller_display_number || data.caller_id_number,
            agentNumber: data.agent_display_number || data.answer_agent_number,
            callDirection: "incoming",
            startTime: data.timestamp || Date.now(),
            callStatus: data.call_status || "answered",
          };

          // Reuse the new handler
          this.onIncomingCallConnected(legacyData);
        }
      },
    });
  }, [activeCallState.callId, userData.EmployeeId]);

  // Helper function to check if call is for current user
  const isCallForCurrentUser = (data) => {
    if (!userData.EmployeePhone) return false;

    const normalizePhone = (phone) => {
      if (!phone) return "";
      return String(phone)
        .replace(/[\s\-\+]/g, "")
        .replace(/^91/, "");
    };

    const userPhone = normalizePhone(userData.EmployeePhone);
    const eventPhone = normalizePhone(data.agentNumber || data.agent_number);

    const isMatch = userPhone === eventPhone;
    console.log(
      `FormProvider - User filter check: ${userPhone} === ${eventPhone} = ${isMatch}`
    );

    return isMatch;
  };

  // ================================================================================
  // FORM STATE PERSISTENCE (Updated to include call state)
  // ================================================================================
  const persistFormState = () => {
    try {
      const stateToSave = {
        isFormOpen,
        formStatus,
        currentCallDetails,
        activeCallState, // New: include call state
        formData: {
          ...formData,
          attachments: [], // Don't persist file objects
        },
        traderNotFoundData,
        savedContactData,
        orderData,
        timestamp: Date.now(),
      };

      localStorage.setItem("formState", JSON.stringify(stateToSave));
      console.log("FormProvider - State persisted with call data");
    } catch (error) {
      console.error("FormProvider - Error persisting state:", error);
    }
  };

  // Auto-persist form state whenever it changes
  useEffect(() => {
    if (
      isFormOpen ||
      formData.CallId ||
      formData.remarks ||
      activeCallState.isActive
    ) {
      persistFormState();
    }
  }, [
    isFormOpen,
    formStatus,
    currentCallDetails,
    activeCallState, // New dependency
    formData,
    orderData,
  ]);

  // Clear expired persisted form state on mount
  useEffect(() => {
    if (persistedFormState?.timestamp) {
      const now = Date.now();
      const stateAge = now - persistedFormState.timestamp;
      const maxAge = 30 * 60 * 1000; // 30 minutes

      if (stateAge > maxAge) {
        console.log("FormProvider - Clearing expired form state");
        localStorage.removeItem("formState");
      } else {
        console.log("FormProvider - Restored form state from localStorage");

        // If form was open with active call, keep it open
        if (
          persistedFormState.isFormOpen &&
          persistedFormState.activeCallState?.callId
        ) {
          console.log("FormProvider - Restored active call form after refresh");
        }
      }
    }
  }, []);

  // ================================================================================
  // FORM MANAGEMENT FUNCTIONS (Existing, slightly updated)
  // ================================================================================
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
      console.error("FormProvider - Error fetching saved contact info:", err);
      setSavedContactData(null);
    }
  };

  // Open form with call details (Updated)
  const openForm = (callDetails) => {
    console.log("FormProvider - Opening form with call details:", callDetails);

    setCurrentCallDetails(callDetails);
    setIsFormOpen(true);
    setFormStatus(FORM_STATUS.IDLE);
    setErrors({});
    setSubmissionError(null);

    // Auto-populate form data
    populateFormData(callDetails);

    // Fetch saved contact data if phone number is available
    if (callDetails?.number) {
      fetchSavedContactData(callDetails.number);
    }

    console.log("FormProvider - Form opened successfully");
  };

  // Close form and reset state
  const closeForm = () => {
    console.log("FormProvider - Closing form");

    setIsFormOpen(false);
    setFormStatus(FORM_STATUS.IDLE);
    setCurrentCallDetails(null);

    // Reset call state only if call is not active
    if (!activeCallState.isActive) {
      setActiveCallState({
        callId: null,
        customerNumber: null,
        agentNumber: null,
        callDirection: null,
        startTime: null,
        endTime: null,
        isActive: false,
        recordingUrl: null,
        duration: null,
        hangupCause: null,
      });
    }

    resetFormData();
    setErrors({});
    setSubmissionError(null);
    setLastError(null);

    // Clear persisted form state
    localStorage.removeItem("formState");
    console.log("FormProvider - Cleared persisted form state");
  };

  // Populate form with call details (Updated to use activeCallState)
  const populateFormData = (callDetails) => {
    // Use activeCallState if available, otherwise use passed callDetails
    const sourceData = activeCallState.callId
      ? {
          ...callDetails,
          CallId: activeCallState.callId,
          number: activeCallState.customerNumber,
          callDirection: activeCallState.callDirection,
          startTime: activeCallState.startTime,
        }
      : callDetails;

    const callDateTime = sourceData?.startTime
      ? getLocalDateTimeString(new Date(sourceData.startTime))
      : getLocalDateTimeString(new Date());

    console.log(
      "FormProvider - Populating form with call details:",
      sourceData
    );

    // Determine call type
    const rawCallType = sourceData?.callDirection || sourceData?.callType;
    let callType = "OutBound"; // Default

    if (rawCallType === "incoming" || rawCallType === "inbound") {
      callType = "InBound";
    } else if (rawCallType === "outgoing" || rawCallType === "outbound") {
      callType = "OutBound";
    }

    const inquiryNumber = orderData?.orderId || "";
    const callId = sourceData?.CallId || sourceData?.callId || "";

    console.log(
      "FormProvider - Setting callType:",
      callType,
      "callId:",
      callId
    );

    setFormData((prev) => ({
      ...prev,
      CallId: callId,
      EmployeeId: userData?.EmployeeId || sourceData?.EmployeeId || "",
      callDateTime: callDateTime,
      callType: callType,
      inquiryNumber: inquiryNumber,
    }));
  };

  // Reset form data
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
      problemId: "",
      subProblemId: "",
      remarks: "",
      attachments: [],
      status: "closed",
      followUpDate: "",
    });
  };

  // Handle form input changes
  const updateFormData = useCallback(
    (name, value) => {
      if (name === "callType") {
        console.log("FormProvider - callType being changed to:", value);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "problemId") {
        setFormData((prev) => ({ ...prev, subProblemId: "" }));
      }

      if (name === "status" && value === "closed") {
        setFormData((prev) => ({
          ...prev,
          followUpDate: "",
        }));
      }

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

    if (traderNotFoundData.type !== "Non-Trader") {
      if (!formData.problemId) {
        newErrors.problemId = "Problem Type is required";
      }

      if (formData.problemId != 6 && !formData.subProblemId) {
        newErrors.subProblemId = "Related Issue is required";
      }

      if (formData.status === "open" && !formData.followUpDate) {
        newErrors.followUpDate = "Follow-up date is required for open tickets";
      }
    }

    if (!formData.remarks.trim()) {
      newErrors.remarks = "Remarks are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add initiate call function
  const initiateCall = async (phoneNumber) => {
    if (!phoneNumber || !userData.EmployeePhone) {
      throw new Error("Phone number and agent number are required");
    }

    try {
      const response = await axiosInstance.post("/initiate-call", {
        destination_number: phoneNumber,
        agent_number: userData.EmployeePhone,
      });

      console.log("Call initiated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Call initiation failed:", error);
      throw error;
    }
  };

  // Submit form data (Updated to include call state data and fix contact data duplication)
  const submitForm = async (contactData = null) => {
    console.log("FormProvider - Submitting form data");

    if (!validateForm()) {
      setFormStatus(FORM_STATUS.ERROR);
      return Promise.reject(new Error("Form validation failed"));
    }

    try {
      setFormStatus(FORM_STATUS.SUBMITTING);
      setSubmissionError(null);

      // Include call state data in form submission
      const enhancedFormData = {
        ...formData,
        inquiryNumber:
          activeCallState.customerNumber ||
          currentCallDetails?.number ||
          formData.inquiryNumber,
        // Add call metadata
        callDuration: activeCallState.duration,
        recordingUrl: activeCallState.recordingUrl,
        hangupCause: activeCallState.hangupCause,
        callEndTime: activeCallState.endTime,
      };

      // Add contact data in backend format only - fix duplication issue
      if (contactData?.name || traderNotFoundData.name.trim()) {
        const sourceData = contactData?.name ? contactData : traderNotFoundData;

        enhancedFormData.Contact_Name = sourceData.name;
        enhancedFormData.Region = sourceData.region || "";
        enhancedFormData.Type = sourceData.type || "Trader";
      }

      // Explicitly remove any frontend format fields to prevent duplication
      delete enhancedFormData.name;
      delete enhancedFormData.region;
      delete enhancedFormData.type;

      console.log("FormProvider - Enhanced form data:", enhancedFormData);

      const submissionData = new FormData();
      const excludedFields = [
        "callDuration",
        "customerPhoneNumber",
        "customerData",
        "orderData",
        "submittedAt",
        "attachments",
        "recordingUrl", // Don't send in main payload
        "hangupCause",
        "callEndTime",
        // Add these to excluded fields list for extra safety
        "name",
        "region",
        "type",
      ];

      Object.keys(enhancedFormData).forEach((key) => {
        if (key === "attachments") {
          if (enhancedFormData.attachments?.length > 0) {
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

      console.log("FormProvider - Form submitted successfully:", response.data);
      setFormStatus(FORM_STATUS.SUBMITTED);

      // Emit event for any listeners
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
      console.error("FormProvider - Error submitting form:", error);
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

  // Context value (Updated to remove customer search data)
  const value = {
    // Call state (New)
    activeCallState,

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

    // Form data only
    orderData,
    traderNotFoundData,
    setTraderNotFoundData,

    // User data
    userData,
    savedContactData,

    // Actions
    openForm,
    closeForm,
    updateFormData,
    updateFormFiles,
    submitForm,
    initiateCall,

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
