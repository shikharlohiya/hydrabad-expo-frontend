import { useState, useEffect, useRef } from "react";
import DialerContext from "../DialerContext";
import useSocket from "../../hooks/useSocket";
import useForm from "../../hooks/useForm";
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
  const baseURL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

  // Core call state
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [currentNumber, setCurrentNumber] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [callDirection, setCallDirection] = useState("outgoing");

  // API state
  const [bearerToken, setBearerToken] = useState(
    localStorage.getItem("clickToCallToken")
  );
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

  // Hooks for Socket and Form providers
  const {
    registerCallEventHandlers,
    emitCallEvent,
    isConnected,
    connectionStatus,
  } = useSocket();

  const { openForm, submitForm: submitCallForm } = useForm();

  // Refs for cleanup
  const timerIntervalRef = useRef(null);

  // Debug function for request analysis
  const debugRequest = (endpoint, data, headers) => {
    console.group("🔍 REQUEST DEBUG");
    console.log("Endpoint:", endpoint);
    console.log("Base URL:", baseURL);
    console.log("Full URL:", axiosInstance.defaults.baseURL + endpoint);
    console.log("Data:", JSON.stringify(data, null, 2));
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Bearer Token Present:", !!bearerToken);
    console.log("Bearer Token Length:", bearerToken?.length || 0);
    console.log(
      "Bearer Token Sample:",
      bearerToken ? bearerToken.substring(0, 30) + "..." : "NO TOKEN"
    );
    console.log("User Data:", userData);
    console.groupEnd();
  };

  // Register socket event handlers on mount
  useEffect(() => {
    registerCallEventHandlers({
      onCallInitiated: (data) => {
        console.log("📞 Socket: Call initiated", data);
        if (data.callId) {
          setActiveCallId(data.callId);
          setCallStatus(CALL_STATUS.RINGING);
          setCallDirection("outgoing");
        }
      },

      onCallStatusUpdate: (data) => {
        console.log("📱 Socket: Call status update", data);
        if (data.callId === activeCallId) {
          if (data.status === "ringing") {
            setCallStatus(CALL_STATUS.RINGING);
          } else if (data.status === "connected") {
            setCallStatus(CALL_STATUS.CONNECTED);
            if (!callStartTime) {
              setCallStartTime(Date.now());
            }
          }
        }
      },

      onCallConnected: (data) => {
        console.log("✅ Socket: Call connected", data);
        if (data.callId === activeCallId) {
          setCallStatus(CALL_STATUS.CONNECTED);
          setCallStartTime(Date.now());
          openCallRemarksForm();
        }
      },

      onCallHoldStatus: (data) => {
        console.log("⏸️ Socket: Hold status", data);
        if (data.callId === activeCallId) {
          const isHeld = data.action === "hold" || data.isHeld;
          setIsOnHold(isHeld);
          setCallStatus(isHeld ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
        }
      },

      onCallEnded: (data) => {
        console.log("📱 Socket: Call ended", data);
        if (data.callId === activeCallId) {
          handleCallEnd();
        }
      },

      onCallFailed: (data) => {
        console.log("❌ Socket: Call failed", data);
        if (data.callId === activeCallId) {
          setCallStatus(CALL_STATUS.FAILED);
          setLastError(data.error || "Call failed");
          setTimeout(() => {
            resetCallState();
          }, 3000);
        }
      },

      onCallError: (data) => {
        console.log("⚠️ Socket: Call error", data);
        setLastError(data.error || "Call error occurred");
      },

      onIncomingCall: (data) => {
        console.log("📞 Socket: Incoming call", data);
        setActiveCallId(data.callId);
        setCurrentNumber(data.fromNumber);
        setContactName(data.contactName || null);
        setCallStatus(CALL_STATUS.RINGING);
        setCallDirection("incoming");
      },
    });
  }, [activeCallId, callStartTime]);

  // Enhanced authentication function with better debugging
  const getAuthToken = async () => {
    try {
      setIsLoading(true);
      setLastError(null);

      console.log("🔐 Requesting auth token...");

      // Use axiosInstance instead of axios
      const response = await axiosInstance.post("/get-auth-token");
      console.log("🔐 Auth token response:", response.data);

      // Extract token from various possible response structures
      let token;
      if (response.data?.token?.idToken) {
        token = response.data.token.idToken;
      } else if (response.data?.token) {
        token = response.data.token;
      } else if (response.data?.data?.token) {
        token = response.data.data.token;
      } else if (response.data?.access_token) {
        token = response.data.access_token;
      } else if (response.data?.jwt) {
        token = response.data.jwt;
      } else if (response.data?.authToken) {
        token = response.data.authToken;
      } else {
        console.error("❌ Token not found in response:", response.data);
        throw new Error("No valid token received from server");
      }

      if (token && typeof token === "string" && token.trim().length > 0) {
        setBearerToken(token);
        localStorage.setItem("clickToCallToken", token);
        console.log("✅ Auth token obtained successfully");
        console.log("🔐 Token length:", token.length);
        console.log("🔐 Token preview:", token.substring(0, 50) + "...");
        return token;
      } else {
        throw new Error("Invalid token format received");
      }
    } catch (error) {
      console.error("❌ Error getting auth token:", error);
      console.error("❌ Error response:", error.response?.data);
      setLastError("Failed to authenticate. Please try again.");

      // Clear invalid token
      setBearerToken(null);
      localStorage.removeItem("clickToCallToken");

      throw error;
    } finally {
      setIsLoading(false);
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Enhanced initiate call with proper error handling and debugging
  const initiateCall = async (number, contactInfo = null) => {
    console.log("📞 Starting call initiation process...");

    // Validate inputs
    if (!number || number.trim() === "") {
      setLastError("Please enter a valid phone number");
      return;
    }

    if (!userData.EmployeePhone) {
      console.error("❌ Missing user data:", userData);
      setLastError("User data not found. Please login again.");
      return;
    }

    // Check and get auth token if needed
    let currentToken = bearerToken;
    if (!currentToken || currentToken.trim() === "") {
      console.log("🔐 No bearer token found, requesting new token...");
      try {
        currentToken = await getAuthToken();
      } catch (error) {
        console.error("❌ Failed to get auth token:", error);
        return;
      }
    } else {
      console.log("🔐 Using existing bearer token");
    }

    // Prepare call data (moved outside try block for retry access)
    const callData = {
      cli: cliNumber,
      apartyno: userData.EmployeePhone,
      bpartyno: number,
      reference_id: `${Date.now()}`,
      dtmfflag: 0,
      recordingflag: 0,
    };

    try {
      setIsLoading(true);
      setLastError(null);
      setCurrentNumber(number);
      setCallStatus(CALL_STATUS.DIALING);
      setCallDirection("outgoing");
      setContactName(contactInfo?.name || null);

      const headers = {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        // Add additional headers that might be required
        "X-Requested-With": "XMLHttpRequest",
      };

      // Debug the request before sending
      debugRequest("/initiate-call", callData, headers);

      console.log("📞 Initiating call with data:", callData);

      const response = await axiosInstance.post("/initiate-call", callData, {
        headers: headers,
      });

      console.log("📞 Call response:", response.data);

      // Handle API response based on your actual response structure
      const { status, message } = response.data;

      if (status === 1 && message?.Response === "success" && message?.callid) {
        setActiveCallId(message.callid);
        setCallStatus(CALL_STATUS.RINGING);
        console.log("✅ Call initiated successfully:", message.callid);

        // Emit socket event for call initiation
        if (isConnected()) {
          emitCallEvent("call-initiated", {
            callId: message.callid,
            agentNumber: userData.EmployeePhone,
            customerNumber: number,
            timestamp: new Date().toISOString(),
          });
        }
      } else if (
        message?.Response ===
        "Unable to initiate call now. maximum channel limit reached"
      ) {
        throw new Error(
          "Maximum channel limit reached. Please try again later."
        );
      } else if (message?.Response === "Agent not available") {
        throw new Error("Agent not available. Please try again.");
      } else {
        throw new Error(message?.Response || "Call initiation failed");
      }
    } catch (error) {
      console.error("❌ Error initiating call:", error);

      // Enhanced 403 error handling
      if (error.response?.status === 403) {
        console.group("❌ 403 FORBIDDEN ERROR ANALYSIS");
        console.error("Status:", error.response.status);
        console.error("Status Text:", error.response.statusText);
        console.error("Response Data:", error.response.data);
        console.error("Request Headers:", error.config?.headers);
        console.error("Request URL:", error.config?.url);
        console.error(
          "Current Token:",
          currentToken ? currentToken.substring(0, 30) + "..." : "NO TOKEN"
        );
        console.groupEnd();

        // Try to refresh token and retry once
        console.log("🔄 Attempting to refresh token due to 403 error...");
        try {
          setBearerToken(null);
          localStorage.removeItem("clickToCallToken");
          const newToken = await getAuthToken();

          if (newToken) {
            console.log("🔄 Retrying call with new token...");
            // Retry the call with new token (callData is now accessible)
            const retryHeaders = {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            };

            const retryResponse = await axiosInstance.post(
              "/initiate-call",
              callData,
              {
                headers: retryHeaders,
              }
            );

            console.log("📞 Retry call response:", retryResponse.data);

            const { status: retryStatus, message: retryMessage } =
              retryResponse.data;

            if (
              retryStatus === 1 &&
              retryMessage?.Response === "success" &&
              retryMessage?.callid
            ) {
              setActiveCallId(retryMessage.callid);
              setCallStatus(CALL_STATUS.RINGING);
              console.log(
                "✅ Call initiated successfully on retry:",
                retryMessage.callid
              );

              if (isConnected()) {
                emitCallEvent("call-initiated", {
                  callId: retryMessage.callid,
                  agentNumber: userData.EmployeePhone,
                  customerNumber: number,
                  timestamp: new Date().toISOString(),
                });
              }
              return; // Success on retry
            }
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
        }

        setLastError("Authentication failed. Please login again.");
      } else if (error.response?.status === 401) {
        setLastError("Unauthorized. Please login again.");
        setBearerToken(null);
        localStorage.removeItem("clickToCallToken");
      } else {
        setLastError(
          error.message || "Unable to place call. Please try again."
        );
      }

      setCallStatus(CALL_STATUS.FAILED);

      // Auto-reset after showing error
      setTimeout(() => {
        resetCallState();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (
      !activeCallId ||
      callStatus !== CALL_STATUS.RINGING ||
      callDirection !== "incoming"
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);

      console.log("📞 Answering call:", activeCallId);

      setCallStatus(CALL_STATUS.CONNECTED);
      setCallStartTime(Date.now());

      // Emit socket event for call answer
      if (isConnected()) {
        emitCallEvent("call-answered", {
          callId: activeCallId,
          timestamp: new Date().toISOString(),
        });
      }

      // Open form when call connects
      openCallRemarksForm();
    } catch (error) {
      console.error("❌ Error answering call:", error);
      setLastError("Unable to answer call");
    } finally {
      setIsLoading(false);
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
      setLastError(null);

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

      console.log("✅ Call disconnection response:", response.data);

      if (response.data?.status === 1) {
        console.log("✅ Call ended successfully");

        // Emit socket event for call end
        if (isConnected()) {
          emitCallEvent("call-disconnected", {
            callId: activeCallId,
            timestamp: new Date().toISOString(),
          });
        }

        handleCallEnd();
      } else {
        throw new Error("Failed to disconnect call");
      }
    } catch (error) {
      console.error("❌ Error ending call:", error);
      setLastError("Unable to end call properly");
      // Still end the call locally even if API fails
      handleCallEnd();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle call end (from API or socket)
  const handleCallEnd = () => {
    setCallStatus(CALL_STATUS.ENDED);
    openCallRemarksForm();
    setTimeout(() => {
      resetCallState();
    }, 1000);
  };

  // Open call remarks form
  const openCallRemarksForm = () => {
    const callDetails = {
      CallId: activeCallId,
      EmployeeId: userData.EmployeeId,
      startTime: callStartTime ? new Date(callStartTime) : new Date(),
      number: currentNumber,
      contactName: contactName,
      callType: callDirection,
      callDuration: callDuration,
    };

    console.log("📝 Opening call remarks form:", callDetails);
    openForm(callDetails);
  };

  // Handle form submission (called by form)
  const handleRemarksSubmit = async (formData) => {
    try {
      console.log("📝 Submitting call remarks:", formData);
      const result = await submitCallForm();
      console.log("✅ Form submitted successfully:", result);
      return Promise.resolve(result);
    } catch (error) {
      console.error("❌ Error submitting remarks:", error);
      return Promise.reject(error);
    }
  };

  // Toggle mute state
  const toggleMute = async () => {
    if (!activeCallId || !bearerToken || callStatus !== CALL_STATUS.CONNECTED) {
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      const newMuteState = !isMuted;

      setIsMuted(newMuteState);

      // Emit socket event for mute status
      if (isConnected()) {
        emitCallEvent("call-mute-changed", {
          callId: activeCallId,
          isMuted: newMuteState,
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`✅ Call ${newMuteState ? "muted" : "unmuted"} successfully`);
    } catch (error) {
      console.error("❌ Error toggling mute:", error);
      setLastError(`Unable to ${isMuted ? "unmute" : "mute"} call`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle hold state
  const toggleHold = async () => {
    if (!activeCallId || !bearerToken || callStatus !== CALL_STATUS.CONNECTED) {
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      const newHoldState = !isOnHold;

      const response = await axiosInstance.post(
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

      console.log("✅ Hold/Resume response:", response.data);

      if (
        response.data?.status === "1" &&
        response.data?.message === "Success"
      ) {
        setIsOnHold(newHoldState);
        setCallStatus(
          newHoldState ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED
        );

        // Emit socket event for hold status
        if (isConnected()) {
          emitCallEvent("call-hold-changed", {
            callId: activeCallId,
            isHeld: newHoldState,
            timestamp: new Date().toISOString(),
          });
        }

        console.log(
          `✅ Call ${newHoldState ? "held" : "resumed"} successfully`
        );
      } else {
        throw new Error("Failed to change hold status");
      }
    } catch (error) {
      console.error("❌ Error toggling hold:", error);
      setLastError(`Unable to ${isOnHold ? "resume" : "hold"} call`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset call state to idle
  const resetCallState = () => {
    setCallStatus(CALL_STATUS.IDLE);
    setCallDuration(0);
    setCallStartTime(null);
    setIsOnHold(false);
    setIsMuted(false);
    setActiveCallId(null);
    setContactName(null);
    setCallDirection("outgoing");
    setLastError(null);
    setCurrentNumber("");
  };

  // Clear the current number from dialer
  const clearCurrentNumber = () => {
    setCurrentNumber("");
  };

  // Complete reset of all dialer state
  const resetDialer = () => {
    resetCallState();
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
    return (
      callStatus === CALL_STATUS.IDLE &&
      !isLoading &&
      currentNumber.trim() !== ""
    );
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
      case CALL_STATUS.ENDED:
        return "text-gray-500";
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
      case CALL_STATUS.ENDED:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CALL_STATUS.IDLE:
        return "Ready";
      case CALL_STATUS.DIALING:
        return "Dialing...";
      case CALL_STATUS.RINGING:
        return "Ringing...";
      case CALL_STATUS.CONNECTED:
        return "Connected";
      case CALL_STATUS.ON_HOLD:
        return "On Hold";
      case CALL_STATUS.ENDED:
        return "Call Ended";
      case CALL_STATUS.FAILED:
        return "Call Failed";
      default:
        return "Unknown";
    }
  };

  // Context value
  const value = {
    // Core state
    callStatus,
    currentNumber,
    callDuration,
    callStartTime,
    isOnHold,
    isMuted,
    activeCallId,
    contactName,
    callDirection,
    lastError,
    isLoading,
    bearerToken,

    // User data
    userData,
    empRole,
    cliNumber,

    // Connection status from socket
    connectionStatus,

    // Actions
    initiateCall,
    answerCall,
    endCall,
    toggleMute,
    toggleHold,
    setCurrentNumber,
    clearCurrentNumber,
    resetDialer,
    getAuthToken,
    handleRemarksSubmit,
    openCallRemarksForm,

    // Helpers
    isCallActive,
    canInitiateCall,
    formatDuration,
    getStatusColor,
    getStatusBgColor,
    getStatusText,

    // Constants
    CALL_STATUS,
  };

  return (
    <DialerContext.Provider value={value}>{children}</DialerContext.Provider>
  );
};

export default DialerProvider;
