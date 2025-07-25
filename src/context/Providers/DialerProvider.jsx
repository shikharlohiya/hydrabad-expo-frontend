import { useState, useEffect, useRef } from "react";
import DialerContext from "../DialerContext";
import axiosInstance from "../../library/axios";

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
  // Call state
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
  const [callDirection, setCallDirection] = useState(null); // "incoming" | "outgoing"

  // API and connection state
  const [bearerToken, setBearerToken] = useState(
    localStorage.getItem("clickToCallToken")
  );
  const [sseConnection, setSseConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // connected, connecting, disconnected, error
  const [lastError, setLastError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // User data from localStorage
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  const [empRole] = useState(
    localStorage.getItem("empRole") || userData.EmployeeRole || "1"
  );

  // CLI number based on role
  const cliNumber =
    empRole == 1
      ? "7610255555"
      : empRole === "300"
      ? "9522205500"
      : "7610233333";

  // Call remarks form states
  const [isRemarksFormOpen, setIsRemarksFormOpen] = useState(false);
  const [currentCallDetails, setCurrentCallDetails] = useState(null);

  // Refs for cleanup
  const sseConnectionRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Get authentication token
  const getAuthToken = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/get-auth-token");
      console.log(response);
      console.log("🔐 Raw token response:", response.data);

      // Handle different response formats
      let token;
      if (response.data?.token) {
        // If token is nested in response.data.token
        token = response.data.token;
      } else if (response.data?.idToken) {
        // If token is in idToken field (as shown in logs)
        token = response.data.idToken;
      } else if (typeof response.data === "string") {
        // If token is directly the response data
        token = response.data;
      } else {
        // If response.data is the token object itself
        token = response.data?.idToken || response.data?.token || response.data;
      }

      // Ensure token is a string
      if (typeof token === "object") {
        console.error("❌ Token is still an object:", token);
        throw new Error("Invalid token format received from server");
      }

      if (token && typeof token === "string") {
        setBearerToken(token);
        localStorage.setItem("clickToCallToken", token);
        console.log(
          "✅ Auth token obtained successfully:",
          token.substring(0, 20) + "..."
        );
        return token;
      } else {
        throw new Error("No valid token received from server");
      }
    } catch (error) {
      console.error("❌ Error getting auth token:", error);
      setLastError("Failed to authenticate. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize SSE connection
  const initializeSSE = async () => {
    if (!userData.EmployeePhone) {
      console.error("❌ No agent number found in userData");
      setLastError("User data not found. Please login again.");
      return;
    }

    try {
      setConnectionStatus("connecting");

      // Close existing connection
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
      }

      const clientId = `client_${userData.EmployeeId}_${Date.now()}`;
      const sseUrl = `${
        import.meta.env.VITE_API_URL
      }/events/call-status?agentNumber=${
        userData.EmployeePhone
      }&clientId=${clientId}`;

      console.log("🔌 Connecting to SSE:", sseUrl);

      const eventSource = new EventSource(sseUrl);
      sseConnectionRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE Connection opened");
        setConnectionStatus("connected");
        setLastError(null);
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE Connection error:", error);
        setConnectionStatus("error");
        setLastError("Connection lost. Attempting to reconnect...");

        // Auto-reconnect after 3 seconds
        connectionTimeoutRef.current = setTimeout(() => {
          if (connectionStatus !== "connected") {
            initializeSSE();
          }
        }, 3000);
      };

      // Handle different event types
      eventSource.addEventListener("connection", (event) => {
        const data = JSON.parse(event.data);
        console.log("🔗 SSE Connection established:", data);
      });

      eventSource.addEventListener("auth-status", (event) => {
        const data = JSON.parse(event.data);
        console.log("🔐 Auth status update:", data);
        if (!data.success) {
          setLastError("Authentication failed. Please try again.");
        }
      });

      eventSource.addEventListener("call-initiated", (event) => {
        const data = JSON.parse(event.data);
        console.log("📞 Call initiated:", data);

        if (data.callId) {
          setActiveCallId(data.callId);
          setCallStatus(CALL_STATUS.RINGING);

          // Start checking for connection status
          checkCallConnection(data.callId);
        }
      });

      eventSource.addEventListener("call-failed", (event) => {
        const data = JSON.parse(event.data);
        console.log("❌ Call failed:", data);
        setCallStatus(CALL_STATUS.FAILED);
        setLastError(data.error || "Call failed");

        setTimeout(() => {
          resetCallState();
        }, 3000);
      });

      eventSource.addEventListener("call-hold-status", (event) => {
        const data = JSON.parse(event.data);
        console.log("⏸️ Hold status update:", data);

        if (data.callId === activeCallId) {
          const isHold = data.action === "hold";
          setIsOnHold(isHold);
          setCallStatus(isHold ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
        }
      });

      eventSource.addEventListener("call-ended", (event) => {
        const data = JSON.parse(event.data);
        console.log("📱 Call ended:", data);

        if (data.callId === activeCallId) {
          endCall();
        }
      });

      eventSource.addEventListener("incoming-call", (event) => {
        const data = JSON.parse(event.data);
        console.log("📞 Incoming call:", data);

        // Set incoming call state
        setActiveCallId(data.callId);
        setCurrentNumber(data.callerNumber);
        setContactName(data.callerNumber); // Could be enhanced with contact lookup
        setCallStatus(CALL_STATUS.RINGING);
        setCallDirection("incoming");

        // Store incoming call data
        localStorage.setItem(
          "incomingCallData",
          JSON.stringify({
            callId: data.callId,
            callerNumber: data.callerNumber,
            agentNumber: data.agentNumber,
            timestamp: data.timestamp,
          })
        );
        localStorage.setItem("isIncoming", "true");
      });

      eventSource.addEventListener("incoming-call-connected", (event) => {
        const data = JSON.parse(event.data);
        console.log("✅ Incoming call connected:", data);

        if (data.callId === activeCallId) {
          setCallStatus(CALL_STATUS.CONNECTED);
          setCallStartTime(Date.now());

          // Open remarks form
          setIsRemarksFormOpen(true);
          setCurrentCallDetails({
            CallId: activeCallId,
            EmployeeId: userData.EmployeeId,
            startTime: new Date(),
            number: currentNumber,
            contactName: contactName,
            callType: "incoming",
          });
        }
      });

      eventSource.addEventListener("call-error", (event) => {
        const data = JSON.parse(event.data);
        console.log("❌ Call error:", data);
        setLastError(data.error || "Call error occurred");
      });

      eventSource.addEventListener("ping", (event) => {
        // Keep-alive ping, no action needed
        console.log("💓 SSE Ping received");
      });

      setSseConnection(eventSource);
    } catch (error) {
      console.error("❌ Failed to initialize SSE:", error);
      setConnectionStatus("error");
      setLastError("Failed to connect to call service");
    }
  };

  // Check call connection status (for outgoing calls)
  const checkCallConnection = async (callId) => {
    const checkInterval = setInterval(async () => {
      try {
        // This would be your B_PARTY_CONNECTION endpoint
        // For now, simulate connection after 3-5 seconds
        if (callStatus === CALL_STATUS.RINGING) {
          // Simulate random connection time
          const shouldConnect = Math.random() > 0.3; // 70% success rate

          if (shouldConnect) {
            clearInterval(checkInterval);
            setCallStatus(CALL_STATUS.CONNECTED);
            setCallStartTime(Date.now());

            // Open remarks form for outgoing calls
            setIsRemarksFormOpen(true);
            setCurrentCallDetails({
              CallId: activeCallId,
              EmployeeId: userData.EmployeeId,
              startTime: new Date(),
              number: currentNumber,
              contactName: contactName,
              callType: "outgoing",
            });
          }
        }
      } catch (error) {
        console.error("Error checking call connection:", error);
      }
    }, 2000);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (callStatus === CALL_STATUS.RINGING) {
        setCallStatus(CALL_STATUS.FAILED);
        setLastError("Call connection timeout");
        setTimeout(resetCallState, 3000);
      }
    }, 30000);
  };

  // Timer effect for call duration
  useEffect(() => {
    if (callStatus === CALL_STATUS.CONNECTED && callStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [callStatus, callStartTime]);

  // Initialize connection on mount
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Get auth token if not available
        if (!bearerToken) {
          await getAuthToken();
        }

        // Initialize SSE connection
        await initializeSSE();
      } catch (error) {
        console.error("Failed to initialize connection:", error);
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Initialize call - starts dialing process
  const initiateCall = async (number, contactInfo = null) => {
    if (!bearerToken) {
      setLastError("Not authenticated. Getting token...");
      try {
        await getAuthToken();
      } catch (error) {
        console.log("error fetching auth token- ", error);
        return;
      }
    }

    if (!userData.EmployeePhone) {
      setLastError("User data not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      setCurrentNumber(number);
      setCallStatus(CALL_STATUS.DIALING);
      setContactName(contactInfo?.name || null);
      setContactAvatar(contactInfo?.avatar || null);
      setCallDirection("outgoing");

      const callData = {
        cli: cliNumber,
        apartyno: userData.EmployeePhone,
        bpartyno: number,
        reference_id: "123",
        dtmfflag: 0,
        recordingflag: 0,
      };

      console.log("📞 Initiating call:", callData);

      const response = await axiosInstance.post("/initiate-call", callData, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      });

      const message = response.data?.message;

      if (
        message?.Response ===
          "Unable to initiate call now. maximum channel limit reached" ||
        message?.Response === "Agent not available"
      ) {
        throw new Error(message.Response);
      }

      if (message?.callid) {
        setActiveCallId(message.callid);
        console.log("✅ Call initiated successfully:", message.callid);
        // Status will be updated via SSE
      } else {
        throw new Error("Invalid response from call service");
      }
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      setCallStatus(CALL_STATUS.FAILED);
      setLastError(error.message || "Unable to place call. Please try again.");

      setTimeout(() => {
        resetCallState();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Answer incoming call
  const answerCall = () => {
    if (callStatus === CALL_STATUS.RINGING) {
      setCallStatus(CALL_STATUS.CONNECTED);
      setCallStartTime(Date.now());

      // Remove incoming call flags
      localStorage.removeItem("incomingCallData");
      localStorage.removeItem("isIncoming");

      // Open remarks form
      setIsRemarksFormOpen(true);
      setCurrentCallDetails({
        CallId: activeCallId,
        EmployeeId: userData.EmployeeId,
        startTime: new Date(),
        number: currentNumber,
        contactName: contactName,
        callType: "incoming",
      });
    }
  };

  // End the current call
  const endCall = async () => {
    if (!activeCallId) {
      resetCallState();
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post(
        "/call-disconnection",
        {
          cli: cliNumber,
          call_id: String(activeCallId),
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Call ended successfully");
    } catch (error) {
      console.error("❌ Error ending call:", error);
      setLastError("Unable to end call properly");
    } finally {
      setIsLoading(false);
      setCallStatus(CALL_STATUS.ENDED);

      // Reset after brief delay
      setTimeout(() => {
        resetCallState();
      }, 1000);
    }
  };

  // Toggle hold state
  const toggleHold = async () => {
    if (!activeCallId || !bearerToken) return;

    try {
      const newHoldState = !isOnHold;

      await axiosInstance.post(
        "/hold-or-resume",
        {
          cli: cliNumber,
          call_id: String(activeCallId),
          HoldorResume: newHoldState ? "1" : "0",
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Status will be updated via SSE
      console.log(`✅ Call ${newHoldState ? "held" : "resumed"} successfully`);
    } catch (error) {
      console.error("❌ Error toggling hold:", error);
      setLastError("Unable to change hold status");
    }
  };

  // Toggle mute state (local only - no API call needed)
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Reset call state
  const resetCallState = () => {
    setCallStatus(CALL_STATUS.IDLE);
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
    setIsOnHold(false);
    setActiveCallId(null);
    setContactName(null);
    setContactAvatar(null);
    setLastError(null);
    setCallDirection(null);

    // Clear localStorage
    localStorage.removeItem("incomingCallData");
    localStorage.removeItem("isIncoming");
    localStorage.removeItem("incomingCallConnected");
    localStorage.removeItem("isConnected");
    localStorage.removeItem("callId");
    localStorage.removeItem("B_DIAL_STATUS");
    localStorage.removeItem("callStartTime");
    localStorage.removeItem("usethisOne");
  };

  // Clear the current number from dialer
  const clearCurrentNumber = () => {
    setCurrentNumber("");
  };

  // Complete reset of all dialer state
  const resetDialer = () => {
    resetCallState();
    setCurrentNumber("");
    setIsRemarksFormOpen(false);
    setCurrentCallDetails(null);
  };

  // Handle form submission with API call
  const handleRemarksSubmit = async (formData) => {
    try {
      console.log("Submitting call remarks to API:", formData);

      const formDataToSubmit = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "attachments") {
          if (formData.attachments && formData.attachments.length > 0) {
            formData.attachments.forEach((file) => {
              formDataToSubmit.append("attachments", file);
            });
          }
        } else if (key === "customerData" || key === "submittedAt") {
          return;
        } else if (
          formData[key] !== "" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          formDataToSubmit.append(key, formData[key]);
        }
      });

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

      console.log("✅ API submission successful:", response.data);

      const callRecord = {
        id: activeCallId || Date.now(),
        number: currentNumber,
        contactName,
        duration: callDuration,
        timestamp: currentCallDetails?.startTime || new Date(),
        type: currentCallDetails?.callType || "outgoing",
        status: "completed",
        remarks: formData,
        apiResponse: response.data,
      };

      setCallHistory((prev) => [callRecord, ...prev]);

      setCurrentCallDetails((prev) => ({
        ...prev,
        remarks: formData,
        completedAt: new Date(),
        apiResponse: response.data,
        isSubmitted: true,
      }));

      if (callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED) {
        setIsRemarksFormOpen(false);
        setCurrentCallDetails(null);
        setCurrentNumber("");
      }

      return Promise.resolve(response.data);
    } catch (error) {
      console.error("❌ Error submitting call remarks to API:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while submitting the form";
      return Promise.reject(new Error(errorMessage));
    }
  };

  // Handle form cancellation
  const handleRemarksCancel = () => {
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
    return callStatus === CALL_STATUS.IDLE && !isLoading;
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
    callDirection,

    // Connection state
    connectionStatus,
    lastError,
    isLoading,
    bearerToken,

    // User data
    userData,
    empRole,
    cliNumber,

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
    getAuthToken,

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
