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

// Helper function to get persisted dialer state
const getPersistedDialerState = () => {
  try {
    const persistedState = localStorage.getItem("dialerState");
    return persistedState ? JSON.parse(persistedState) : null;
  } catch (error) {
    console.error("Error loading persisted dialer state:", error);
    return null;
  }
};

const DialerProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_API_URL || "";
  // const baseURL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

  // Load persisted state on mount
  const persistedState = getPersistedDialerState();

  // Core call state - initialize with persisted values if available
  const [callStatus, setCallStatus] = useState(
    persistedState?.callStatus || CALL_STATUS.IDLE
  );
  const [currentNumber, setCurrentNumber] = useState(
    persistedState?.currentNumber || ""
  );
  const [callDuration, setCallDuration] = useState(
    persistedState?.callDuration || 0
  );
  const [callStartTime, setCallStartTime] = useState(
    persistedState?.callStartTime || null
  );
  const [isOnHold, setIsOnHold] = useState(persistedState?.isOnHold || false);
  const [isMuted, setIsMuted] = useState(persistedState?.isMuted || false);
  const [activeCallId, setActiveCallId] = useState(
    persistedState?.activeCallId || null
  );
  const [contactName, setContactName] = useState(
    persistedState?.contactName || null
  );
  const [callDirection, setCallDirection] = useState(
    persistedState?.callDirection || "outgoing"
  );

  // Incoming call state
  const [incomingCallData, setIncomingCallData] = useState(
    persistedState?.incomingCallData || null
  );
  const [isIncomingCall, setIsIncomingCall] = useState(
    persistedState?.isIncomingCall || false
  );
  const [incomingCallTimer, setIncomingCallTimer] = useState(
    persistedState?.incomingCallTimer || 0
  );

  // API state
  const [bearerToken, setBearerToken] = useState(
    localStorage.getItem("clickToCallToken")
  );

  // Track if current user initiated the call to prevent duplicate socket processing
  const [userInitiatedCall, setUserInitiatedCall] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // getAuthToken will fetch, save to state, and save to localStorage
        await getAuthToken();
        console.log("✅ Fetched and stored bearer token on mount");
      } catch (err) {
        console.error("❌ Failed to fetch token on mount:", err);
      }
    };

    // Only fetch if token doesn't exist
    if (!bearerToken) {
      fetchToken();
    }
  }, []);

  const [lastError, setLastError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [hasFormBeenSubmitted, setHasFormBeenSubmitted] = useState(
    persistedState?.hasFormBeenSubmitted || false
  );
  const [callDetailsForForm, setCallDetailsForForm] = useState(
    persistedState?.callDetailsForForm || null
  );

  const callEndProcessedRef = useRef(false);

  // Function to persist dialer state to localStorage
  const persistDialerState = () => {
    try {
      const stateToSave = {
        callStatus,
        currentNumber,
        callDuration,
        callStartTime,
        isOnHold,
        isMuted,
        activeCallId,
        contactName,
        callDirection,
        incomingCallData,
        isIncomingCall,
        incomingCallTimer,
        hasFormBeenSubmitted,
        callDetailsForForm,
        timestamp: Date.now(), // Add timestamp for expiry check
      };

      localStorage.setItem("dialerState", JSON.stringify(stateToSave));
      console.log("💾 Dialer state persisted:", stateToSave);
    } catch (error) {
      console.error("❌ Error persisting dialer state:", error);
    }
  };

  // Auto-persist state whenever it changes
  useEffect(() => {
    // Only persist if there's meaningful state to save
    if (
      activeCallId ||
      callStatus !== CALL_STATUS.IDLE ||
      currentNumber ||
      isIncomingCall
    ) {
      persistDialerState();
    }
  }, [
    callStatus,
    currentNumber,
    callDuration,
    callStartTime,
    isOnHold,
    isMuted,
    activeCallId,
    contactName,
    callDirection,
    incomingCallData,
    isIncomingCall,
    incomingCallTimer,
    hasFormBeenSubmitted,
    callDetailsForForm,
  ]);

  // Clear expired persisted state on mount and handle recovery
  useEffect(() => {
    if (persistedState?.timestamp) {
      const now = Date.now();
      const stateAge = now - persistedState.timestamp;
      const maxAge = 30 * 60 * 1000; // 30 minutes

      if (stateAge > maxAge) {
        console.log("🧹 Clearing expired dialer state");
        localStorage.removeItem("dialerState");
      } else {
        console.log(
          "🔄 Restored dialer state from localStorage:",
          persistedState
        );

        // If there was an active call before refresh, log for debugging
        if (
          persistedState.activeCallId &&
          persistedState.callStatus !== CALL_STATUS.IDLE
        ) {
          console.log("🔄 Active call state recovered:", {
            callId: persistedState.activeCallId,
            status: persistedState.callStatus,
            number: persistedState.currentNumber,
            duration: persistedState.callDuration,
          });

          // If call was connected, restart the timer
          if (
            persistedState.callStatus === CALL_STATUS.CONNECTED &&
            persistedState.callStartTime
          ) {
            console.log("🔄 Restarting call timer after refresh");
          }
        }
      }
    }
  }, []);

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
  // Forms Context
  const { openForm, submitForm: submitCallForm, closeForm } = useForm();

  // Refs
  const timerIntervalRef = useRef(null);
  const incomingCallTimerRef = useRef(null);

  useEffect(() => {
    const handleFormSubmitted = (event) => {
      const { callId } = event.detail;
      console.log(`✅ Form submission confirmed for call ${callId}`);

      // Check if it matches current active call or preserved call details
      const currentCallId = activeCallId || callDetailsForForm?.CallId;
      if (String(callId) === String(currentCallId)) {
        console.log(
          "✅ Form submitted successfully - call continues until manual disconnect"
        );
        setHasFormBeenSubmitted(true);
        
        // Note: Call remains active until user manually ends it or websocket receives call end
        // Form will auto-close via FormProvider setTimeout, no need to end call here
      }
    };

    window.addEventListener("formSubmitted", handleFormSubmitted);

    return () => {
      window.removeEventListener("formSubmitted", handleFormSubmitted);
    };
  }, [activeCallId, callDetailsForForm]);

  // Register socket event handlers on mount
  // Updated DialerProvider.jsx - Replace your event handlers with these:

  // Helper function to determine if a call event should be processed by current user
  const shouldProcessCallEvent = (data, eventType) => {
    // Normalize phone numbers for comparison (remove spaces, handle different formats)
    const normalizePhone = (phone) => {
      if (!phone) return "";
      return String(phone)
        .replace(/[\s\-\+]/g, "")
        .trim();
    };

    const userPhone = normalizePhone(userData.EmployeePhone);
    const userId = userData.EmployeeId;

    // For call-initiated events, check if apartyno matches current user
    if (eventType === "call-initiated") {
      const eventPhone = normalizePhone(
        data.apartyno || data.agentNumber || data.fromNumber
      );
      const isForCurrentUser = eventPhone === userPhone;

      console.log("🔍 Call-initiated filter check:", {
        eventApartyno: data.apartyno,
        eventAgentNumber: data.agentNumber,
        eventFromNumber: data.fromNumber,
        normalizedEventPhone: eventPhone,
        userPhone: userData.EmployeePhone,
        normalizedUserPhone: userPhone,
        isForCurrentUser: isForCurrentUser,
        fullEventData: data,
      });

      // If still no match, be extra conservative and reject
      if (!isForCurrentUser) {
        console.log(
          "🛑 BLOCKING call-initiated event - phone number doesn't match current user"
        );
        return false;
      }

      return isForCurrentUser;
    }

    // For other call events, only process if it's our active call or no filtering info available
    const eventCallId = String(data.callId || data.CALL_ID || "");
    const currentCallId = String(activeCallId || "");

    // If we have an active call, only process events for that call
    if (currentCallId && eventCallId) {
      const isOurCall = eventCallId === currentCallId;
      console.log(`🔍 ${eventType} filter check:`, {
        eventCallId,
        currentCallId,
        isOurCall,
      });
      return isOurCall;
    }

    // If no active call but event has user identification, check if it's for us
    if (data.agentId || data.employeeId || data.agentNumber) {
      const eventUserId = data.agentId || data.employeeId;
      const eventUserPhone = normalizePhone(data.agentNumber);

      const isForCurrentUser =
        (eventUserId && eventUserId.toString() === userId?.toString()) ||
        (eventUserPhone && eventUserPhone === userPhone);

      console.log(`🔍 ${eventType} user filter check:`, {
        eventUserId,
        eventUserPhone,
        userId,
        userPhone,
        isForCurrentUser,
      });

      return isForCurrentUser;
    }

    // For events without clear user identification, be conservative and ignore
    console.log(
      `⚠️ ${eventType} - No clear user identification, ignoring to prevent cross-user issues`
    );
    console.log(
      `🛑 BLOCKING ${eventType} event - insufficient user identification:`,
      {
        hasCallId: !!eventCallId,
        hasCurrentCallId: !!currentCallId,
        hasAgentId: !!(data.agentId || data.employeeId),
        hasAgentNumber: !!data.agentNumber,
        eventData: data,
      }
    );
    return false;
  };

  useEffect(() => {
    registerCallEventHandlers({
      onCallInitiated: (data) => {
        console.log("📞 Call initiated event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-initiated")) {
          console.log(
            "❌ Ignoring call-initiated event - not for current user"
          );
          return;
        }

        // Additional check: Don't process if we already have an active call
        if (activeCallId && activeCallId !== data.callId) {
          console.log(
            "⚠️ Ignoring call-initiated - already have active call:",
            activeCallId
          );
          return;
        }

        // Don't process socket event if user initiated the call themselves
        if (userInitiatedCall) {
          console.log(
            "⚠️ Ignoring call-initiated socket event - user initiated this call"
          );
          return;
        }

        console.log("✅ Processing call-initiated event for current user");
        setActiveCallId(data.callId);
        setCallStatus(CALL_STATUS.RINGING);
        setCallDirection("outgoing");
        setHasFormBeenSubmitted(false);
        setCallDetailsForForm(null);
      },

      onCallConnected: (data) => {
        console.log("🔗 Call connected event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-connected")) {
          console.log(
            "❌ Ignoring call-connected event - not for current user"
          );
          return;
        }

        const callId = String(data.callId || data.CALL_ID);
        const currentCallId = String(activeCallId);

        console.log(
          `🔍 Comparing callIds: webhook="${callId}" vs active="${currentCallId}"`
        );

        if (callId === currentCallId) {
          // **NEW: Check if this is a stale event (call already ended)**
          if (callStatus === CALL_STATUS.ENDED || hasFormBeenSubmitted) {
            console.log(
              "🔍 Ignoring stale call-connected event - call already ended or form submitted"
            );
            return;
          }

          console.log(
            `✅ Call IDs match! Outgoing call ${callId} is connected`
          );
          setCallStatus(CALL_STATUS.CONNECTED);

          // Set call start time from webhook data or current time
          const startTime = data.callStartTime || data.CALL_START_TIME;
          if (startTime && !callStartTime) {
            const parsedTime = parseWebhookTime(startTime);
            setCallStartTime(parsedTime ? parsedTime.getTime() : Date.now());
          } else if (!callStartTime) {
            setCallStartTime(Date.now());
          }

          // Open form when call connects
          console.log("📋 Opening form for connected call");
          openCallRemarksForm();
        } else {
          console.log(
            `❌ Call ID mismatch: webhook="${callId}" vs active="${currentCallId}"`
          );
        }
      },

      onCallDisconnected: (data) => {
        console.log("📱 Call disconnected event received:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-disconnected")) {
          console.log(
            "❌ Ignoring call-disconnected event - not for current user"
          );
          return;
        }

        const callId = String(data.callId || data.CALL_ID);
        const currentCallId = String(activeCallId);

        console.log(
          `🔍 Disconnect event - Comparing callIds: webhook="${callId}" vs active="${currentCallId}"`
        );

        if (callId === currentCallId) {
          console.log(
            `✅ Call IDs match! Processing disconnect for call ${callId}`
          );

          // Extract duration if available from webhook
          if (data.callDuration) {
            console.log(
              `⏱️ Setting call duration from webhook: ${data.callDuration} seconds`
            );
            setCallDuration(data.callDuration);
          }

          console.log(`📱 About to call handleCallEnd() for call ${callId}`);
          handleCallEnd();
        }
      },

      onCallStatusUpdate: (data) => {
        console.log("📱 Call status update event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-status-update")) {
          console.log(
            "❌ Ignoring call-status-update event - not for current user"
          );
          return;
        }

        const callId = String(data.callId || data.CALL_ID);
        const currentCallId = String(activeCallId);

        if (callId === currentCallId) {
          const status = data.status;
          console.log(
            `📊 Processing status update for call ${callId}: ${status}`
          );

          if (status === "ringing") {
            // Additional check: Don't set ringing if user initiated the call
            // (they already got ringing status from initiateCall function)
            if (userInitiatedCall) {
              console.log(
                "⚠️ Ignoring ringing status - user initiated this call"
              );
              return;
            }
            setCallStatus(CALL_STATUS.RINGING);
          } else if (status === "connected") {
            // **NEW: Check if this is a stale event**
            if (callStatus === CALL_STATUS.ENDED || hasFormBeenSubmitted) {
              console.log(
                "🔍 Ignoring stale connected status - call already ended or form submitted"
              );
              return;
            }

            setCallStatus(CALL_STATUS.CONNECTED);
            if (!callStartTime) {
              setCallStartTime(Date.now());
            }
          } else if (status === "ended") {
            console.log(
              "📊 Status ended - but handleCallEnd will be called by disconnect event"
            );
            // Don't call handleCallEnd here since onCallDisconnected already handles it
          }
        }
      },

      // Keep other handlers unchanged...
      onCallHoldStatus: (data) => {
        console.log("⏸️ Call hold status event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-hold-status")) {
          console.log(
            "❌ Ignoring call-hold-status event - not for current user"
          );
          return;
        }

        const callId = String(data.callId);
        const currentCallId = String(activeCallId);

        if (callId === currentCallId) {
          const isHeld = data.action === "hold" || data.isHeld;
          setIsOnHold(isHeld);
          setCallStatus(isHeld ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
        }
      },

      onCallEnded: (data) => {
        console.log("📱 Call ended event (legacy):", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-ended")) {
          console.log("❌ Ignoring call-ended event - not for current user");
          return;
        }

        const callId = String(data.callId || data.CALL_ID);
        const currentCallId = String(activeCallId);

        if (callId === currentCallId) {
          handleCallEnd();
        }
      },

      onCallFailed: (data) => {
        console.log("❌ Call failed event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-failed")) {
          console.log("❌ Ignoring call-failed event - not for current user");
          return;
        }

        const callId = String(data.callId);
        const currentCallId = String(activeCallId);

        if (callId === currentCallId) {
          setCallStatus(CALL_STATUS.FAILED);
          setLastError(data.error || "Call failed");
          setTimeout(resetCallState, 3000);
        }
      },

      onCallError: (data) => {
        console.log("⚠️ Call error event:", data);

        // Use centralized filtering logic
        if (!shouldProcessCallEvent(data, "call-error")) {
          console.log("❌ Ignoring call-error event - not for current user");
          return;
        }

        setLastError(data.error || "Call error occurred");
      },

      onIncomingCall: (data) => {
        handleIncomingCall(data);
      },

      incomingCallStatus: (data) => {
        handleIncomingCallStatus(data);
      },

      incomingCallCdr: (data) => {
        console.log("📄 Incoming call CDR:", data);
      },

      onIncomingCallEnded: (data) => {
        handleIncomingCallEnded(data);
      },
    });
  }, [
    activeCallId,
    callStartTime,
    hasFormBeenSubmitted,
    callDetailsForForm,
    callStatus,
    userInitiatedCall,
  ]);

  // Helper function to parse webhook time format
  const parseWebhookTime = (timeStr) => {
    if (!timeStr || timeStr.length !== 14) return null;

    try {
      // Format: DDMMYYYYHHMMSS
      const day = timeStr.substring(0, 2);
      const month = timeStr.substring(2, 4);
      const year = timeStr.substring(4, 8);
      const hour = timeStr.substring(8, 10);
      const minute = timeStr.substring(10, 12);
      const second = timeStr.substring(12, 14);

      // Create date object (month is 0-indexed in JavaScript)
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    } catch (error) {
      console.error("❌ Error parsing webhook time:", timeStr, error);
      return null;
    }
  };

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
    const ivrNumber = data.ivr_number || data.ivrNumber;

    console.log("📞 Incoming call data:", {
      callerNumber,
      agentNumber,
      callId,
      ivrNumber,
      userPhone: userData.EmployeePhone,
      eventType: data.eventType || data.event,
    });

    // If agent_number is provided and not empty, check if it matches current user
    if (agentNumber && agentNumber.trim() !== "") {
      const userPhone =
        userData.EmployeePhone || userData.phone || userData.Phone;

      if (agentNumber !== userPhone) {
        console.log("❌ Incoming call not for this agent:", {
          agentNumber,
          userPhone,
          matches: agentNumber === userPhone,
        });
        return;
      }
    } else {
      // If agent_number is empty, this might be a general incoming call
      // For now, we'll skip showing it to avoid showing to all agents
      // You might want to implement different logic here based on your business rules
      console.log(
        "⚠️ Incoming call has no specific agent - skipping to avoid showing to all agents"
      );
      return;
    }

    console.log("✅ Showing incoming call to agent:", userData.EmployeePhone);

    setIncomingCallData(data);
    setIsIncomingCall(true);
    setActiveCallId(callId);
    setCurrentNumber(callerNumber);
    setContactName(`Caller ${callerNumber}`);
    setCallStatus(CALL_STATUS.INCOMING_CALL);
    setCallDirection("incoming");
    setHasFormBeenSubmitted(false); // Reset form submission flag for new call
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

  // Timer effect for call duration - with recovery for page refresh
  useEffect(() => {
    if (callStatus === CALL_STATUS.CONNECTED && callStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);

      // Initial calculation for restored state (after page refresh)
      if (callDuration === 0) {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(elapsed);
        console.log("🔄 Recovered call duration after refresh:", elapsed);
      }
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
  // const initiateCall = async (number, contactInfo = null) => {
  //   // Validation
  //   if (!number || number.trim() === "") {
  //     setLastError("Please enter a valid phone number");
  //     return;
  //   }

  //   if (!userData.EmployeePhone) {
  //     setLastError("User data not found. Please login again.");
  //     return;
  //   }

  //   // Get auth token if needed
  //   let currentToken = bearerToken;
  //   if (!currentToken || currentToken.trim() === "") {
  //     try {
  //       currentToken = await getAuthToken();
  //     } catch (error) {
  //       return;
  //     }
  //   }

  //   const callData = {
  //     cli: cliNumber,
  //     apartyno: userData.EmployeePhone,
  //     bpartyno: number,
  //     reference_id: `123`,
  //     dtmfflag: 0,
  //     recordingflag: 0,
  //   };

  //   try {
  //     setIsLoading(true);
  //     setLastError(null);
  //     setCurrentNumber(number);
  //     setCallStatus(CALL_STATUS.DIALING);
  //     setCallDirection("outgoing");
  //     setContactName(contactInfo?.name || null);
  //     setHasFormBeenSubmitted(false);

  //     const headers = {
  //       Authorization: `Bearer ${currentToken}`,
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       "X-Requested-With": "XMLHttpRequest",
  //     };

  //     const response = await axiosInstance.post("/initiate-call", callData, {
  //       headers,
  //     });
  //     const { status, message } = response.data;

  //     if (status === 1 && message?.Response === "success" && message?.callid) {
  //       setActiveCallId(message.callid);
  //       setCallStatus(CALL_STATUS.RINGING);

  //       if (isConnected()) {
  //         emitCallEvent("call-initiated", {
  //           callId: message.callid,
  //           agentNumber: userData.EmployeePhone,
  //           customerNumber: number,
  //           timestamp: new Date().toISOString(),
  //         });
  //       }
  //     } else {
  //       const errorMsg =
  //         message?.Response ===
  //         "Unable to initiate call now. maximum channel limit reached"
  //           ? "Maximum channel limit reached. Please try again later."
  //           : message?.Response === "Agent not available"
  //           ? "Agent not available. Please try again."
  //           : message?.Response || "Call initiation failed";

  //       throw new Error(errorMsg);
  //     }
  //   } catch (error) {
  //     // Handle 403 errors with token refresh
  //     if (error.response?.status === 403) {
  //       try {
  //         setBearerToken(null);
  //         localStorage.removeItem("clickToCallToken");
  //         const newToken = await getAuthToken();

  //         if (newToken) {
  //           const retryHeaders = {
  //             Authorization: `Bearer ${newToken}`,
  //             "Content-Type": "application/json",
  //             Accept: "application/json",
  //             "X-Requested-With": "XMLHttpRequest",
  //           };

  //           const retryResponse = await axiosInstance.post(
  //             "/initiate-call",
  //             callData,
  //             {
  //               headers: retryHeaders,
  //             }
  //           );

  //           const { status: retryStatus, message: retryMessage } =
  //             retryResponse.data;

  //           if (
  //             retryStatus === 1 &&
  //             retryMessage?.Response === "success" &&
  //             retryMessage?.callid
  //           ) {
  //             setActiveCallId(retryMessage.callid);
  //             setCallStatus(CALL_STATUS.RINGING);

  //             if (isConnected()) {
  //               emitCallEvent("call-initiated", {
  //                 callId: retryMessage.callid,
  //                 agentNumber: userData.EmployeePhone,
  //                 customerNumber: number,
  //                 timestamp: new Date().toISOString(),
  //               });
  //             }
  //             return;
  //           }
  //         }
  //       } catch (retryError) {
  //         // Retry failed
  //       }

  //       setLastError("Authentication failed. Please login again.");
  //     } else if (error.response?.status === 401) {
  //       setLastError("Unauthorized. Please login again.");
  //       setBearerToken(null);
  //       localStorage.removeItem("clickToCallToken");
  //     } else {
  //       setLastError(
  //         error.message || "Unable to place call. Please try again."
  //       );
  //     }

  //     setCallStatus(CALL_STATUS.FAILED);
  //     setTimeout(resetCallState, 3000);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
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

    // Reset flags for new call
    callEndProcessedRef.current = false;
    setHasFormBeenSubmitted(false);
    setCallDetailsForForm(null);

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
      employeeId: userData.EmployeeId, // Add employeeId to identify the specific user
    };

    console.log("📞 Initiating call with employeeId:", userData.EmployeeId);

    try {
      setIsLoading(true);
      setLastError(null);
      setCurrentNumber(number);
      setCallStatus(CALL_STATUS.DIALING);
      setCallDirection("outgoing");
      setContactName(contactInfo?.name || null);
      setHasFormBeenSubmitted(false);

      const requestHeaders = new Headers();
      requestHeaders.append("Authorization", `Bearer ${currentToken.trim()}`);
      requestHeaders.append("Content-Type", "application/json");
      requestHeaders.append("Accept", "application/json");
      requestHeaders.append("X-Requested-With", "XMLHttpRequest");

      const response = await fetch(`${baseURL}/initiate-call`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(callData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        const error = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const responseData = await response.json();
      const { status, message } = responseData;

      if (status === 1 && message?.Response === "success" && message?.callid) {
        setActiveCallId(message.callid);
        setCallStatus(CALL_STATUS.RINGING);
        setUserInitiatedCall(true); // Mark that current user initiated this call

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
            const retryHeaders = new Headers();
            retryHeaders.append("Authorization", `Bearer ${newToken.trim()}`);
            retryHeaders.append("Content-Type", "application/json");
            retryHeaders.append("Accept", "application/json");
            retryHeaders.append("X-Requested-With", "XMLHttpRequest");

            const retryResponse = await fetch(`${baseURL}/initiate-call`, {
              method: "POST",
              headers: retryHeaders,
              body: JSON.stringify(callData),
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse
                .json()
                .catch(() => ({
                  message: `HTTP error! status: ${retryResponse.status}`,
                }));
              const retryError = new Error(
                errorData.message ||
                  `HTTP error! status: ${retryResponse.status}`
              );
              retryError.response = {
                status: retryResponse.status,
                data: errorData,
              };
              throw retryError;
            }

            const retryResponseData = await retryResponse.json();
            const { status: retryStatus, message: retryMessage } =
              retryResponseData;

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
            } else {
              // if retry is not successful, throw an error to be caught by outer catch
              throw new Error(
                retryMessage?.Response || "Call initiation retry failed"
              );
            }
          }
        } catch (retryError) {
          // Retry failed
          setLastError(
            "Authentication failed after retry. Please login again."
          );
        }
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
    console.log("🔚 endCall() called manually by user");
    console.log("🔚 Current activeCallId:", activeCallId);
    console.log("🔚 Current callStatus:", callStatus);
    
    if (!activeCallId) {
      console.log("🔚 No activeCallId - calling resetCallState()");
      resetCallState();
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);

      // Get clickToCallToken from localStorage (same as initiateCall)
      let currentToken = localStorage.getItem("clickToCallToken");
      const authToken = localStorage.getItem("authToken"); // Also get authToken for comparison
      
      console.log("🔚 TOKEN DEBUGGING:");
      console.log("🔚 clickToCallToken:", currentToken ? currentToken.substring(0, 20) + "..." : "NULL");
      console.log("🔚 authToken:", authToken ? authToken.substring(0, 20) + "..." : "NULL");
      console.log("🔚 bearerToken state:", bearerToken ? bearerToken.substring(0, 20) + "..." : "NULL");
      
      if (!currentToken || currentToken.trim() === "") {
        console.log("🔚 clickToCallToken missing, fetching new token...");
        try {
          currentToken = await getAuthToken();
          console.log("🔚 Got new token from getAuthToken:", currentToken ? currentToken.substring(0, 20) + "..." : "No token");
        } catch (error) {
          console.error("🔚 Failed to get auth token:", error);
          return;
        }
      }

      console.log("🔚 Final token being used:", currentToken ? currentToken.substring(0, 20) + "..." : "NULL");
      console.log("🔚 Making fetch API call to /call-disconnection for callId:", activeCallId);

      const requestHeaders = new Headers();
      requestHeaders.append("Authorization", `Bearer ${currentToken.trim()}`);
      requestHeaders.append("Content-Type", "application/json");
      requestHeaders.append("Accept", "application/json");
      requestHeaders.append("X-Requested-With", "XMLHttpRequest");

      const response = await fetch(`${baseURL}/call-disconnection`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          cli: cliNumber,
          call_id: String(activeCallId),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        const error = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const responseData = await response.json();
      console.log("🔚 Call disconnection API response:", responseData);

      if (responseData?.status === 1) {
        console.log("🔚 API disconnect successful - emitting socket event");
        if (isConnected()) {
          emitCallEvent("call-disconnected", {
            callId: activeCallId,
            timestamp: new Date().toISOString(),
          });
          console.log("🔚 Socket event 'call-disconnected' emitted");
        } else {
          console.log("🔚 Socket not connected - cannot emit event");
        }
      } else {
        console.log("🔚 API disconnect failed - status:", responseData?.status);
      }

      console.log("🔚 Calling handleCallEnd() to cleanup local state");
      handleCallEnd();
    } catch (error) {
      console.error("🔚 Error in endCall():", error);
      
      // Handle 403 errors with token refresh (same pattern as initiateCall)
      if (error.response?.status === 403) {
        try {
          console.log("🔚 Got 403 error, clearing clickToCallToken and retrying...");
          localStorage.removeItem("clickToCallToken");
          setBearerToken(null);
          const newToken = await getAuthToken();

          if (newToken) {
            console.log("🔚 Retrying call-disconnection with new token:", newToken.substring(0, 20) + "...");
            
            const retryHeaders = new Headers();
            retryHeaders.append("Authorization", `Bearer ${newToken.trim()}`);
            retryHeaders.append("Content-Type", "application/json");
            retryHeaders.append("Accept", "application/json");
            retryHeaders.append("X-Requested-With", "XMLHttpRequest");

            const retryResponse = await fetch(`${baseURL}/call-disconnection`, {
              method: "POST",
              headers: retryHeaders,
              body: JSON.stringify({
                cli: cliNumber,
                call_id: String(activeCallId),
              }),
            });

            const retryResponseData = await retryResponse.json();
            console.log("🔚 Retry call disconnection API response:", retryResponseData);

            if (retryResponseData?.status === 1) {
              console.log("🔚 Retry API disconnect successful - emitting socket event");
              if (isConnected()) {
                emitCallEvent("call-disconnected", {
                  callId: activeCallId,
                  timestamp: new Date().toISOString(),
                });
                console.log("🔚 Socket event 'call-disconnected' emitted after retry");
              }
            }
          }
        } catch (retryError) {
          console.error("🔚 Token refresh and retry failed:", retryError);
          setLastError("Unable to end call properly after token refresh");
        }
      } else {
        setLastError("Unable to end call properly");
      }
      
      handleCallEnd(); // Still end locally regardless of API success/failure
    } finally {
      setIsLoading(false);
    }
  };

  // Handle call end
  const handleCallEnd = () => {
    console.log("🔚 handleCallEnd() called");

    // **NEW: Prevent multiple executions for the same call**
    if (callEndProcessedRef.current) {
      console.log(
        "🔚 handleCallEnd() already processed for this call, skipping"
      );
      return;
    }

    callEndProcessedRef.current = true;

    console.log(
      "🔍 Current state - callStartTime:",
      callStartTime,
      "activeCallId:",
      activeCallId
    );
    console.log(
      "🔍 Form submission state - hasFormBeenSubmitted:",
      hasFormBeenSubmitted
    );

    // Preserve call details for form submission BEFORE resetting state
    if (callStartTime || activeCallId) {
      const callDetails = {
        CallId: activeCallId, // Use CallId (capital C) to match form expectations
        callId: activeCallId, // Keep both for compatibility
        EmployeeId: userData.EmployeeId,
        number: currentNumber,
        contactName: contactName,
        callDirection: callDirection,
        callType: callDirection,
        callDuration: callDuration,
        startTime: callStartTime ? new Date(callStartTime) : new Date(),
      };

      console.log("💾 Preserving call details with CallId:", callDetails);
      setCallDetailsForForm(callDetails);
    }

    console.log("📊 Setting call status to ENDED");
    setCallStatus(CALL_STATUS.ENDED);
    setIsIncomingCall(false);
    stopIncomingCallTimer();

    // Only open form if call was connected AND form hasn't been submitted yet
    if (callStartTime && !hasFormBeenSubmitted) {
      console.log(
        "📋 Opening form because call was connected and form not submitted"
      );
      openCallRemarksForm();
    } else {
      console.log(
        "📋 NOT opening form - callStartTime:",
        !!callStartTime,
        "hasFormBeenSubmitted:",
        hasFormBeenSubmitted
      );
    }

    // Only reset the processed flag after a delay, but don't reset call state yet
    // Let the form submission or form close trigger the reset instead
    setTimeout(() => {
      callEndProcessedRef.current = false;
    }, 1000);

    // Set a longer timeout as a fallback to prevent hanging state
    setTimeout(() => {
      if (!hasFormBeenSubmitted) {
        console.log("⏰ Fallback timeout reached, resetting call state");
        resetCallState();
      }
    }, 3000); // 30 second fallback timeout
  };

  const handleIncomingCallEnded = (data) => {
    const callId = data.callId;
    const callerNumber = data.callerNumber;
    const agentNumber = data.agentNumber;

    console.log(
      `📱 Incoming call ${callId} ended - Caller: ${callerNumber}, Agent: ${agentNumber}`
    );

    // Check if this is the current active call
    if (callId === activeCallId || callerNumber === currentNumber) {
      // Preserve call details for form submission BEFORE resetting state
      if (callStartTime || activeCallId) {
        setCallDetailsForForm({
          CallId: activeCallId || callId, // Use CallId (capital C) to match form expectations
          callId: activeCallId || callId, // Keep both for compatibility
          number: currentNumber || callerNumber,
          contactName: contactName,
          callDirection: callDirection,
          callType: callDirection, // Add callType property
          callDuration: callDuration,
          startTime: callStartTime ? new Date(callStartTime) : new Date(),
        });
      }

      // Set call status to ended
      setCallStatus(CALL_STATUS.ENDED);
      setIsIncomingCall(false);
      stopIncomingCallTimer();

      // Only open form if call was connected AND form hasn't been submitted yet
      if (
        callStartTime &&
        callStatus === CALL_STATUS.CONNECTED &&
        !hasFormBeenSubmitted
      ) {
        openCallRemarksForm();
      }

      // Don't reset immediately - wait for form submission or timeout
      setTimeout(() => {
        if (!hasFormBeenSubmitted) {
          resetCallState();
        }
      }, 2000); // 30 second timeout for form submission
    }
  };

  // Open call remarks form
  const openCallRemarksForm = () => {
    // Use preserved call details if available, otherwise use current state
    const callDetails = callDetailsForForm || {
      CallId: activeCallId,
      EmployeeId: userData.EmployeeId,
      startTime: callStartTime ? new Date(callStartTime) : new Date(),
      number: currentNumber,
      contactName: contactName,
      callType: callDirection, // This will be 'incoming' or 'outgoing'
      callDirection: callDirection, // Add explicit callDirection property
      callDuration: callDuration,
    };

    // Ensure we have the necessary data
    const formData = {
      CallId: callDetails.callId || callDetails.CallId || activeCallId,
      EmployeeId: userData.EmployeeId,
      startTime:
        callDetails.startTime ||
        (callStartTime ? new Date(callStartTime) : new Date()),
      number: callDetails.number || currentNumber,
      contactName: callDetails.contactName || contactName,
      callType:
        callDetails.callDirection || callDetails.callType || callDirection,
      callDirection: callDetails.callDirection || callDirection, // Ensure callDirection is always passed
      callDuration: callDetails.callDuration || callDuration,
    };

    console.log("📋 Opening form with call details:", formData);
    console.log("📋 Call direction being passed:", formData.callDirection);
    console.log("📋 Call type being passed:", formData.callType);
    openForm(formData);
  };

  // Handle form submission - this should be called when form is successfully submitted
  const handleRemarksSubmit = async (formData) => {
    try {
      console.log("📤 Submitting form with data:", formData);

      const submissionData = {
        ...formData,
        CallId: formData.CallId || callDetailsForForm?.callId || activeCallId,
      };

      const result = await submitCallForm(submissionData);

      setHasFormBeenSubmitted(true);
      console.log("✅ Form marked as submitted");
      setCallDetailsForForm(null);
      callEndProcessedRef.current = false;
      setTimeout(resetCallState, 1000);

      return result;
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      // Optionally notify user:
      // toast.error("Something went wrong. Please try again.");
      throw error; // optionally re-throw
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

  const mergeCall = async (cpartyNumber) => {
    // if (!activeCallId || !bearerToken) {
    //   setLastError("Cannot merge call - missing call ID or token");
    //   return;
    // }

    try {
      setIsLoading(true);
      setLastError(null);

      const response = await axiosInstance.post(
        "/merge-call",
        {
          cli: cliNumber,
          call_id: String(activeCallId),
          cparty_number: cpartyNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // if (status === 1) {
      //   console.log("✅ Merge call successful:", message);
      //   // Optionally update UI state if needed (e.g., mark as merged)
      // } else {
      //   setLastError(message || "Merge failed");
      // }
      console.log("📞 Merge call response:", response.data);
    } catch (error) {
      console.error("❌ Error merging call:", error);
      setLastError("Unable to merge call");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset call state
  const resetCallState = () => {
    console.log(
      "🔄 resetCallState() called - clearing activeCallId:",
      activeCallId
    );
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
    setHasFormBeenSubmitted(false);
    setCallDetailsForForm(null);
    setUserInitiatedCall(false); // Reset user initiated call flag
    callEndProcessedRef.current = false;
    stopIncomingCallTimer();

    // Clear persisted dialer state
    localStorage.removeItem("dialerState");
    console.log("🧹 Cleared persisted dialer state");
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
    mergeCall,
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
