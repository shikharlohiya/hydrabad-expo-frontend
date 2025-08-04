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
  INCOMING_CALL: "incoming_call", // Added specific status for incoming calls
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

  // Incoming call state
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallTimer, setIncomingCallTimer] = useState(0);

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

  const cliNumber = "9522011188";

  // Hooks
  const {
    registerCallEventHandlers,
    emitCallEvent,
    isConnected,
    connectionStatus,
  } = useSocket();
  const { openForm, submitForm: submitCallForm, closeForm } = useForm();

  // Refs
  const timerIntervalRef = useRef(null);
  const incomingCallTimerRef = useRef(null);

  // Register socket event handlers on mount
  useEffect(() => {
    registerCallEventHandlers({
      onCallInitiated: (data) => {
        if (data.callId) {
          setActiveCallId(data.callId);
          setCallStatus(CALL_STATUS.RINGING);
          setCallDirection("outgoing");
        }
      },

      onCallStatusUpdate: (data) => {
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
        if (data.callId === activeCallId) {
          setCallStatus(CALL_STATUS.CONNECTED);
          setCallStartTime(Date.now());
          // Open form when call connects (both incoming and outgoing)
          openCallRemarksForm();
        }
      },

      onCallHoldStatus: (data) => {
        if (data.callId === activeCallId) {
          const isHeld = data.action === "hold" || data.isHeld;
          setIsOnHold(isHeld);
          setCallStatus(isHeld ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
        }
      },

      onCallEnded: (data) => {
        if (data.callId === activeCallId) {
          handleCallEnd();
        }
      },

      onCallFailed: (data) => {
        if (data.callId === activeCallId) {
          setCallStatus(CALL_STATUS.FAILED);
          setLastError(data.error || "Call failed");
          setTimeout(resetCallState, 3000);
        }
      },

      onCallError: (data) => {
        setLastError(data.error || "Call error occurred");
      },

      onIncomingCall: (data) => {
        handleIncomingCall(data);
      },

      incomingCallStatus: (data) => {
        handleIncomingCallStatus(data);
      },

      incomingCallCdr: (data) => {
        // Handle post-call data if needed
      },
    });
  }, [activeCallId, callStartTime]);

  // Get authentication token
  const getAuthToken = async () => {
    try {
      setIsLoading(true);
      setLastError(null);

      const response = await axiosInstance.post("/get-auth-token");

      // Extract token from various possible response structures
      let token =
        response.data?.token?.idToken ||
        response.data?.token ||
        response.data?.data?.token ||
        response.data?.access_token ||
        response.data?.jwt ||
        response.data?.authToken;

      if (!token || typeof token !== "string" || token.trim().length === 0) {
        throw new Error("No valid token received from server");
      }

      setBearerToken(token);
      localStorage.setItem("clickToCallToken", token);
      return token;
    } catch (error) {
      setLastError("Failed to authenticate. Please try again.");
      setBearerToken(null);
      localStorage.removeItem("clickToCallToken");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle incoming call
  const handleIncomingCall = (data) => {
    const callerNumber = data.caller_no || data.callerNumber;
    const agentNumber = data.agent_number || data.agentNumber;
    const callId = data.callid || data.call_id || data.callId;

    // Check if this call is for the current user
    if (
      agentNumber !== userData.EmployeePhone &&
      agentNumber !== userData.phone &&
      agentNumber !== userData.Phone
    ) {
      return;
    }

    setIncomingCallData(data);
    setIsIncomingCall(true);
    setActiveCallId(callId);
    setCurrentNumber(callerNumber);
    setContactName(`Caller ${callerNumber}`);
    // Set specific incoming call status
    setCallStatus(CALL_STATUS.INCOMING_CALL);
    setCallDirection("incoming");
    startIncomingCallTimer();
  };

  // Handle incoming call status updates
  const handleIncomingCallStatus = (data) => {
    const callId = data.callid || data.call_id || data.callId;
    const eventType = data.event || data.eventType;

    if (callId !== activeCallId) return;

    if (eventType === "oncallconnect") {
      setCallStatus(CALL_STATUS.CONNECTED);
      setCallStartTime(Date.now());
      setIsIncomingCall(false);
      stopIncomingCallTimer();
      // Open form when incoming call connects
      openCallRemarksForm();
    } else if (eventType === "call_ended") {
      handleCallEnd();
    }
  };

  // Timer functions
  const startIncomingCallTimer = () => {
    setIncomingCallTimer(0);
    incomingCallTimerRef.current = setInterval(() => {
      setIncomingCallTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopIncomingCallTimer = () => {
    if (incomingCallTimerRef.current) {
      clearInterval(incomingCallTimerRef.current);
      incomingCallTimerRef.current = null;
    }
    setIncomingCallTimer(0);
  };

  // Accept incoming call
  const acceptIncomingCall = () => {
    if (!isIncomingCall || !activeCallId) return;

    setCallStatus(CALL_STATUS.CONNECTED);
    setCallStartTime(Date.now());
    setIsIncomingCall(false);
    stopIncomingCallTimer();

    if (isConnected()) {
      emitCallEvent("call-accepted", {
        callId: activeCallId,
        agentNumber: userData.EmployeePhone,
        timestamp: new Date().toISOString(),
      });
    }

    // Open form when call is accepted
    openCallRemarksForm();
  };

  // Reject incoming call
  const rejectIncomingCall = () => {
    if (!isIncomingCall || !activeCallId) return;

    if (isConnected()) {
      emitCallEvent("call-rejected", {
        callId: activeCallId,
        agentNumber: userData.EmployeePhone,
        timestamp: new Date().toISOString(),
      });
    }

    resetIncomingCallState();
  };

  // Reset incoming call state
  const resetIncomingCallState = () => {
    setIncomingCallData(null);
    setIsIncomingCall(false);
    stopIncomingCallTimer();
    resetCallState();
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
      if (incomingCallTimerRef.current) {
        clearInterval(incomingCallTimerRef.current);
      }
    };
  }, []);

  // Initiate call
  const initiateCall = async (number, contactInfo = null) => {
    // Validation
    if (!number || number.trim() === "") {
      setLastError("Please enter a valid phone number");
      return;
    }

    if (!userData.EmployeePhone) {
      setLastError("User data not found. Please login again.");
      return;
    }

    // Get auth token if needed
    let currentToken = bearerToken;
    if (!currentToken || currentToken.trim() === "") {
      try {
        currentToken = await getAuthToken();
      } catch (error) {
        return;
      }
    }

    const callData = {
      cli: cliNumber,
      apartyno: userData.EmployeePhone,
      bpartyno: number,
      reference_id: `123`,
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
        "X-Requested-With": "XMLHttpRequest",
      };

      const response = await axiosInstance.post("/initiate-call", callData, {
        headers,
      });
      const { status, message } = response.data;

      if (status === 1 && message?.Response === "success" && message?.callid) {
        setActiveCallId(message.callid);
        setCallStatus(CALL_STATUS.RINGING);

        if (isConnected()) {
          emitCallEvent("call-initiated", {
            callId: message.callid,
            agentNumber: userData.EmployeePhone,
            customerNumber: number,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        const errorMsg =
          message?.Response ===
          "Unable to initiate call now. maximum channel limit reached"
            ? "Maximum channel limit reached. Please try again later."
            : message?.Response === "Agent not available"
            ? "Agent not available. Please try again."
            : message?.Response || "Call initiation failed";

        throw new Error(errorMsg);
      }
    } catch (error) {
      // Handle 403 errors with token refresh
      if (error.response?.status === 403) {
        try {
          setBearerToken(null);
          localStorage.removeItem("clickToCallToken");
          const newToken = await getAuthToken();

          if (newToken) {
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

            const { status: retryStatus, message: retryMessage } =
              retryResponse.data;

            if (
              retryStatus === 1 &&
              retryMessage?.Response === "success" &&
              retryMessage?.callid
            ) {
              setActiveCallId(retryMessage.callid);
              setCallStatus(CALL_STATUS.RINGING);

              if (isConnected()) {
                emitCallEvent("call-initiated", {
                  callId: retryMessage.callid,
                  agentNumber: userData.EmployeePhone,
                  customerNumber: number,
                  timestamp: new Date().toISOString(),
                });
              }
              return;
            }
          }
        } catch (retryError) {
          // Retry failed
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
      setTimeout(resetCallState, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (
      !activeCallId ||
      callStatus !== CALL_STATUS.INCOMING_CALL ||
      callDirection !== "incoming"
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);

      setCallStatus(CALL_STATUS.CONNECTED);
      setCallStartTime(Date.now());
      setIsIncomingCall(false);
      stopIncomingCallTimer();

      if (isConnected()) {
        emitCallEvent("call-answered", {
          callId: activeCallId,
          timestamp: new Date().toISOString(),
        });
      }

      // Open form when call is answered
      openCallRemarksForm();
    } catch (error) {
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

      if (response.data?.status === 1) {
        if (isConnected()) {
          emitCallEvent("call-disconnected", {
            callId: activeCallId,
            timestamp: new Date().toISOString(),
          });
        }
      }

      handleCallEnd();
    } catch (error) {
      setLastError("Unable to end call properly");
      handleCallEnd(); // Still end locally
    } finally {
      setIsLoading(false);
    }
  };

  // Handle call end
  const handleCallEnd = () => {
    setCallStatus(CALL_STATUS.ENDED);
    setIsIncomingCall(false);
    stopIncomingCallTimer();

    // Only open form if call was connected (don't open for rejected/missed calls)
    if (callStartTime) {
      openCallRemarksForm();
    }

    setTimeout(resetCallState, 1000);
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

    openForm(callDetails);
  };

  // Handle form submission - this should be called when form is successfully submitted
  const handleRemarksSubmit = async (formData) => {
    try {
      return await submitCallForm(formData);
    } catch (error) {
      throw error;
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

      if (isConnected()) {
        emitCallEvent("call-mute-changed", {
          callId: activeCallId,
          isMuted: newMuteState,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
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

      if (
        response.data?.status === "1" &&
        response.data?.message === "Success"
      ) {
        setIsOnHold(newHoldState);
        setCallStatus(
          newHoldState ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED
        );

        if (isConnected()) {
          emitCallEvent("call-hold-changed", {
            callId: activeCallId,
            isHeld: newHoldState,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        throw new Error("Failed to change hold status");
      }
    } catch (error) {
      setLastError(`Unable to ${isOnHold ? "resume" : "hold"} call`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset call state
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
    setIncomingCallData(null);
    setIsIncomingCall(false);
    stopIncomingCallTimer();
  };

  // Helper functions
  const clearCurrentNumber = () => setCurrentNumber("");
  const resetDialer = () => {
    resetCallState();
    setCurrentNumber("");
  };

  const isCallActive = () => {
    return (
      [
        CALL_STATUS.DIALING,
        CALL_STATUS.RINGING,
        CALL_STATUS.CONNECTED,
        CALL_STATUS.ON_HOLD,
        CALL_STATUS.INCOMING_CALL, // Include incoming call status
      ].includes(callStatus) || isIncomingCall
    );
  };

  const canInitiateCall = () => {
    return (
      callStatus === CALL_STATUS.IDLE &&
      !isLoading &&
      currentNumber.trim() !== "" &&
      !isIncomingCall
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
      case CALL_STATUS.INCOMING_CALL:
        return "text-blue-500"; // Different color for incoming calls
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
      case CALL_STATUS.INCOMING_CALL:
        return "bg-blue-500"; // Different background for incoming calls
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
      case CALL_STATUS.INCOMING_CALL:
        return "Incoming Call"; // Clear text for incoming calls
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

    // Incoming call state
    incomingCallData,
    isIncomingCall,
    incomingCallTimer,

    // User data
    userData,
    empRole,
    cliNumber,
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

    // Incoming call actions
    acceptIncomingCall,
    rejectIncomingCall,
    resetIncomingCallState,

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
