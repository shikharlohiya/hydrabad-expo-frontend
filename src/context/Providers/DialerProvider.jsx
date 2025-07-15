import { useState, useEffect } from "react";
import DialerContext from "../DialerContext";
import axiosInstance from "../../library/axios"; // Add axios import for API calls

// Call status constants
export const CALL_STATUS = {
  IDLE: "idle",
  DIALING: "dialing",
  RINGING: "ringing",
  CONNECTED: "connected",
  ON_HOLD: "on_hold",
  ENDED: "ended",
  FAILED: "failed",
};

const DialerProvider = ({ children }) => {
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [currentNumber, setCurrentNumber] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [activeCallId, setActiveCallId] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [contactAvatar, setContactAvatar] = useState(null);

  // Call remarks form states
  const [isRemarksFormOpen, setIsRemarksFormOpen] = useState(false);
  const [currentCallDetails, setCurrentCallDetails] = useState(null);

  // Timer effect for call duration
  useEffect(() => {
    let interval;
    if (callStatus === CALL_STATUS.CONNECTED && callStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callStartTime]);

  // Initialize call - starts dialing process
  const initiateCall = (number, contactInfo = null) => {
    setCurrentNumber(number);
    setCallStatus(CALL_STATUS.DIALING);
    setContactName(contactInfo?.name || null);
    setContactAvatar(contactInfo?.avatar || null);
    setActiveCallId(Date.now().toString());

    // Simulate dialing process
    setTimeout(() => {
      setCallStatus(CALL_STATUS.RINGING);
    }, 1000);
  };

  // Answer incoming call or connect outgoing call
  const answerCall = () => {
    setCallStatus(CALL_STATUS.CONNECTED);
    setCallStartTime(Date.now());

    // Open remarks form when call connects
    setIsRemarksFormOpen(true);

    // Initialize call details
    setCurrentCallDetails({
      CallId: activeCallId,
      EmployeeId: "", // This should come from user context/auth
      startTime: new Date(),
      number: currentNumber,
      contactName: contactName,
    });
  };

  // End the current call
  const endCall = () => {
    setCallStatus(CALL_STATUS.ENDED);

    // Reset call-related state after a brief delay
    setTimeout(() => {
      setCallStatus(CALL_STATUS.IDLE);
      setCallDuration(0);
      setCallStartTime(null);
      setIsMuted(false);
      setIsOnHold(false);
      setActiveCallId(null);
      setContactName(null);
      setContactAvatar(null);

      // Note: We don't reset currentNumber, isRemarksFormOpen, or currentCallDetails
      // These persist until the form is submitted or cancelled
    }, 1000);
  };

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle hold state
  const toggleHold = () => {
    const newHoldState = !isOnHold;
    setIsOnHold(newHoldState);
    setCallStatus(newHoldState ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
  };

  // Clear the current number from dialer
  const clearCurrentNumber = () => {
    setCurrentNumber("");
  };

  // Complete reset of all dialer state
  const resetDialer = () => {
    setCallStatus(CALL_STATUS.IDLE);
    setCurrentNumber("");
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
    setIsOnHold(false);
    setActiveCallId(null);
    setContactName(null);
    setContactAvatar(null);
    setIsRemarksFormOpen(false);
    setCurrentCallDetails(null);
  };

  // Handle form submission with API call - THIS IS WHERE THE API CALL HAPPENS
  const handleRemarksSubmit = async (formData) => {
    try {
      console.log("Submitting call remarks to API:", formData);

      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "attachments") {
          // Handle file attachments separately - supports multiple files
          if (formData.attachments && formData.attachments.length > 0) {
            formData.attachments.forEach((file) => {
              formDataToSubmit.append("attachments", file);
            });
          }
        } else if (key === "customerData" || key === "submittedAt") {
          // Skip these metadata fields from API submission
          return;
        } else if (
          formData[key] !== "" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      // Submit the form using axiosInstance - THIS IS THE ACTUAL API CALL
      const response = await axiosInstance.post(
        "/form-details",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Submission failed");
      }

      console.log("API submission successful:", response.data);

      // Create call record for local history after successful API call
      const callRecord = {
        id: activeCallId || Date.now(),
        number: currentNumber,
        contactName,
        duration: callDuration,
        timestamp: currentCallDetails?.startTime || new Date(),
        type: "outgoing", // This could be determined by call initiation
        status: "completed",
        remarks: formData,
        apiResponse: response.data,
      };

      // Add to call history
      setCallHistory((prev) => [callRecord, ...prev]);

      // Update current call details with remarks
      setCurrentCallDetails((prev) => ({
        ...prev,
        remarks: formData,
        completedAt: new Date(),
        apiResponse: response.data,
        isSubmitted: true,
      }));

      // Only close form if call has ended
      // If call is still active, keep form open to show success message
      if (callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED) {
        setIsRemarksFormOpen(false);
        setCurrentCallDetails(null);
        setCurrentNumber("");
      }

      return Promise.resolve(response.data);
    } catch (error) {
      console.error("Error submitting call remarks to API:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while submitting the form";
      return Promise.reject(new Error(errorMessage));
    }
  };

  // Handle form cancellation
  const handleRemarksCancel = () => {
    // Close form and reset form-related state
    setIsRemarksFormOpen(false);
    setCurrentCallDetails(null);
    setCurrentNumber("");
  };

  // Helper functions
  const isCallActive = () => {
    return [
      CALL_STATUS.DIALING,
      CALL_STATUS.RINGING,
      CALL_STATUS.CONNECTED,
      CALL_STATUS.ON_HOLD,
    ].includes(callStatus);
  };

  const canInitiateCall = () => {
    return callStatus === CALL_STATUS.IDLE;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case CALL_STATUS.CONNECTED:
        return "text-green-500";
      case CALL_STATUS.DIALING:
      case CALL_STATUS.RINGING:
        return "text-yellow-500";
      case CALL_STATUS.ON_HOLD:
        return "text-orange-500";
      case CALL_STATUS.FAILED:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBgColor = () => {
    switch (callStatus) {
      case CALL_STATUS.CONNECTED:
        return "bg-green-500";
      case CALL_STATUS.DIALING:
      case CALL_STATUS.RINGING:
        return "bg-yellow-500";
      case CALL_STATUS.ON_HOLD:
        return "bg-orange-500";
      case CALL_STATUS.FAILED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const value = {
    // State
    callStatus,
    currentNumber,
    callDuration,
    callStartTime,
    isMuted,
    isOnHold,
    callHistory,
    activeCallId,
    contactName,
    contactAvatar,
    isRemarksFormOpen,
    currentCallDetails,

    // Actions
    initiateCall,
    answerCall,
    endCall,
    toggleMute,
    toggleHold,
    setCurrentNumber,
    clearCurrentNumber,
    resetDialer,
    handleRemarksSubmit,
    handleRemarksCancel,

    // Helpers
    isCallActive,
    canInitiateCall,
    formatDuration,
    getStatusColor,
    getStatusBgColor,
  };

  return (
    <DialerContext.Provider value={value}>{children}</DialerContext.Provider>
  );
};

export default DialerProvider;
