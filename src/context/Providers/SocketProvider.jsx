import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SocketContext from "../SocketContext";

// Connection status constants
export const CONNECTION_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
  RECONNECTING: "reconnecting",
};

const SocketProvider = ({ children }) => {
  // const baseURL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  const baseURL = "https://crm-trader-api.abisexport.com/";

  // Connection state
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.DISCONNECTED
  );
  const [lastError, setLastError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // User data for connection
  const [userData] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem("userData")) || {};
      console.log("🔧 SocketProvider - User data loaded:", data);
      return data;
    } catch {
      console.log(
        "⚠️ SocketProvider - Failed to load user data, using empty object"
      );
      return {};
    }
  });

  // Refs
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const callEventHandlersRef = useRef({});
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Socket configuration
  const socketConfig = {
    transports: ["polling", "websocket"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: reconnectDelay,
    autoConnect: false,
    forceNew: true,
    upgrade: true,
  };

  // Initialize socket connection
  const connectSocket = () => {
    if (socketRef.current?.connected) {
      console.log(
        "🔗 SocketProvider - Already connected, skipping connection attempt"
      );
      return;
    }

    try {
      console.log("🚀 SocketProvider - Initiating socket connection...");
      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      setLastError(null);

      const serverUrl = baseURL || "http://localhost:5000";
      console.log("🌐 SocketProvider - Connecting to server:", serverUrl);
      console.log("⚙️ SocketProvider - Socket config:", socketConfig);

      const newSocket = io(serverUrl, socketConfig);
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ SocketProvider - Successfully connected to server");
        console.log("🆔 SocketProvider - Socket ID:", newSocket.id);
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);

        if (userData.EmployeeId) {
          console.log(
            "📞 SocketProvider - Registering for call events with EmployeeId:",
            userData.EmployeeId
          );
          registerForCallEvents(userData.EmployeeId);
        } else {
          console.log(
            "⚠️ SocketProvider - No EmployeeId found, cannot register for call events"
          );
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ SocketProvider - Connection error:", error);
        console.log("🔍 SocketProvider - Error details:", {
          message: error.message,
          type: error.type,
          description: error.description,
        });
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError(`Connection failed: ${error.message}`);
        handleReconnection();
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔌 SocketProvider - Disconnected, reason:", reason);
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        if (reason === "io server disconnect") {
          console.log(
            "🔄 SocketProvider - Server disconnected, attempting reconnection"
          );
          handleReconnection();
        }
      });

      newSocket.on("reconnect", () => {
        console.log("🔄 SocketProvider - Successfully reconnected");
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log(
          `🔄 SocketProvider - Reconnection attempt ${attemptNumber}/${maxReconnectAttempts}`
        );
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
        setReconnectAttempts(attemptNumber);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("❌ SocketProvider - Reconnection error:", error);
        setLastError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("💀 SocketProvider - All reconnection attempts failed");
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError("Unable to reconnect to server. Please refresh the page.");
      });

      // Call-specific event handlers
      setupCallEventListeners(newSocket);

      console.log("🔗 SocketProvider - Attempting to connect...");
      newSocket.connect();
    } catch (error) {
      console.error(
        "💥 SocketProvider - Failed to initialize connection:",
        error
      );
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError(`Failed to initialize connection: ${error.message}`);
    }
  };

  // Setup call event listeners
  const setupCallEventListeners = (socket) => {
    const callEvents = [
      "call-initiated",
      "call-status-update",
      "call-connected", // Acefone connected event from webhook
      "call-disconnected", // Acefone disconnected event from webhook
      "call-hold-status",
      "call-ended", // Keep for backward compatibility
      "call-failed",
      "call-error",
      "incomingCall",
      "incomingCallStatus",
      "incomingCallCdr",
      "incomingCallEnded",
      "callStatusUpdate", // Keep for backward compatibility
    ];

    console.log(
      "📋 SocketProvider - Setting up call event listeners for events:",
      callEvents
    );

    callEvents.forEach((eventName) => {
      socket.on(eventName, (data) => {
        console.log(`📡 SocketProvider - Received event '${eventName}':`, data);

        const handlers = callEventHandlersRef.current;
        const handlerMap = {
          "call-initiated": "onCallInitiated",
          "call-status-update": "onCallStatusUpdate",
          "call-connected": "onCallConnected", // Maps to your new handler
          "call-disconnected": "onCallDisconnected", // Maps to your new handler
          "call-hold-status": "onCallHoldStatus",
          "call-ended": "onCallEnded", // Legacy
          "call-failed": "onCallFailed",
          "call-error": "onCallError",
          incomingCall: "onIncomingCall",
          incomingCallStatus: "incomingCallStatus",
          incomingCallCdr: "incomingCallCdr",
          incomingCallEnded: "onIncomingCallEnded",
          callStatusUpdate: "onCallStatusUpdate", // Legacy
        };

        const handlerName = handlerMap[eventName];
        if (handlers[handlerName]) {
          console.log(
            `🎯 SocketProvider - Calling handler '${handlerName}' for event '${eventName}'`
          );
          handlers[handlerName](data);
        } else {
          console.warn(
            `⚠️ SocketProvider - No handler found for event '${eventName}' (expected handler: ${handlerName})`
          );
          console.log(
            "🔍 SocketProvider - Available handlers:",
            Object.keys(handlers)
          );
        }
      });
    });

    socket.on("error", (error) => {
      console.error("❌ SocketProvider - Socket error:", error);
      setLastError(`Socket error: ${error.message || error}`);
    });
  };

  // Register client for call events
  const registerForCallEvents = (employeeId) => {
    if (socketRef.current?.connected) {
      const registrationData = {
        employeeId,
        clientType: "web",
        timestamp: new Date().toISOString(),
      };

      console.log(
        "📝 SocketProvider - Registering for call events with data:",
        registrationData
      );
      socketRef.current.emit("registerCall", registrationData);
      console.log("✅ SocketProvider - Call registration event emitted");
    } else {
      console.warn(
        "⚠️ SocketProvider - Cannot register for call events - socket not connected"
      );
    }
  };

  // Handle reconnection logic
  const handleReconnection = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error(
        "💀 SocketProvider - Maximum reconnection attempts reached"
      );
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError("Connection lost. Please refresh the page.");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    console.log(
      `🔄 SocketProvider - Scheduling reconnection in ${reconnectDelay}ms`
    );
    setConnectionStatus(CONNECTION_STATUS.RECONNECTING);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("🔄 SocketProvider - Executing reconnection attempt");
      setReconnectAttempts((prev) => prev + 1);
      if (socketRef.current) {
        socketRef.current.connect();
      }
    }, reconnectDelay);
  };

  // Disconnect socket
  const disconnectSocket = () => {
    console.log("🔌 SocketProvider - Disconnecting socket");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    console.log("✅ SocketProvider - Socket disconnected and cleaned up");
  };

  // Manually force reconnection
  const forceReconnect = () => {
    console.log("🔄 SocketProvider - Force reconnection requested");
    disconnectSocket();
    setReconnectAttempts(0);
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  // Emit call-related events
  const emitCallEvent = (eventName, data) => {
    if (socketRef.current?.connected) {
      console.log(`📤 SocketProvider - Emitting event '${eventName}':`, data);
      socketRef.current.emit(eventName, data);
      console.log("✅ SocketProvider - Event emitted successfully");
    } else {
      console.error(
        "❌ SocketProvider - Cannot emit event - not connected to server"
      );
      console.log("🔍 SocketProvider - Connection status:", connectionStatus);
      setLastError("Not connected to server");
    }
  };

  // Register call event handlers from DialerProvider
  const registerCallEventHandlers = (handlers) => {
    console.log(
      "📋 SocketProvider - Registering call event handlers:",
      Object.keys(handlers)
    );
    callEventHandlersRef.current = handlers;
  };

  // Auto-connect on mount
  useEffect(() => {
    console.log("🚀 SocketProvider - Component mounted, initiating connection");
    connectSocket();

    return () => {
      console.log("🔄 SocketProvider - Component unmounting, cleaning up");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, []);

  // Re-register for events when connection is restored
  useEffect(() => {
    if (
      connectionStatus === CONNECTION_STATUS.CONNECTED &&
      userData.EmployeeId
    ) {
      console.log(
        "🔄 SocketProvider - Connection restored, re-registering for call events"
      );
      registerForCallEvents(userData.EmployeeId);
    }
  }, [connectionStatus, userData.EmployeeId]);

  // Helper functions
  const isConnected = () => {
    const connected = connectionStatus === CONNECTION_STATUS.CONNECTED;
    console.log("❓ SocketProvider - isConnected check:", connected);
    return connected;
  };

  const isConnecting = () =>
    [CONNECTION_STATUS.CONNECTING, CONNECTION_STATUS.RECONNECTING].includes(
      connectionStatus
    );

  const getStatusColor = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return "text-green-500";
      case CONNECTION_STATUS.CONNECTING:
      case CONNECTION_STATUS.RECONNECTING:
        return "text-yellow-500";
      case CONNECTION_STATUS.ERROR:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return "Connected";
      case CONNECTION_STATUS.CONNECTING:
        return "Connecting...";
      case CONNECTION_STATUS.RECONNECTING:
        return `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`;
      case CONNECTION_STATUS.ERROR:
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  // Context value
  const value = {
    // Connection state
    socket,
    connectionStatus,
    lastError,
    reconnectAttempts,

    // Actions
    connectSocket,
    disconnectSocket,
    forceReconnect,
    emitCallEvent,
    registerCallEventHandlers,

    // Helpers
    isConnected,
    isConnecting,
    getStatusColor,
    getStatusText,

    // Constants
    CONNECTION_STATUS,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
