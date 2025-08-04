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
  const baseURL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

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
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
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
    if (socketRef.current?.connected) return;

    try {
      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      setLastError(null);

      const serverUrl = baseURL || "http://localhost:5000";
      const newSocket = io(serverUrl, socketConfig);

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on("connect", () => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);

        if (userData.EmployeeId) {
          registerForCallEvents(userData.EmployeeId);
        }
      });

      newSocket.on("connect_error", (error) => {
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError(`Connection failed: ${error.message}`);
        handleReconnection();
      });

      newSocket.on("disconnect", (reason) => {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        if (reason === "io server disconnect") {
          handleReconnection();
        }
      });

      newSocket.on("reconnect", () => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
        setReconnectAttempts(attemptNumber);
      });

      newSocket.on("reconnect_error", (error) => {
        setLastError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on("reconnect_failed", () => {
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError("Unable to reconnect to server. Please refresh the page.");
      });

      // Call-specific event handlers
      setupCallEventListeners(newSocket);
      newSocket.connect();
    } catch (error) {
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError(`Failed to initialize connection: ${error.message}`);
    }
  };

  // Setup call event listeners
  const setupCallEventListeners = (socket) => {
    const callEvents = [
      "call-initiated",
      "call-status-update",
      "call-connected",
      "call-hold-status",
      "call-ended",
      "call-failed",
      "call-error",
      "incomingCall",
      "incomingCallStatus",
      "incomingCallCdr",
    ];

    callEvents.forEach((eventName) => {
      socket.on(eventName, (data) => {
        const handlers = callEventHandlersRef.current;
        const handlerMap = {
          "call-initiated": "onCallInitiated",
          "call-status-update": "onCallStatusUpdate",
          "call-connected": "onCallConnected",
          "call-hold-status": "onCallHoldStatus",
          "call-ended": "onCallEnded",
          "call-failed": "onCallFailed",
          "call-error": "onCallError",
          incomingCall: "onIncomingCall",
          incomingCallStatus: "incomingCallStatus",
          incomingCallCdr: "incomingCallCdr",
        };

        const handlerName = handlerMap[eventName];
        if (handlers[handlerName]) {
          handlers[handlerName](data);
        }
      });
    });

    socket.on("error", (error) => {
      setLastError(`Socket error: ${error.message || error}`);
    });
  };

  // Register client for call events
  const registerForCallEvents = (employeeId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("registerCall", {
        employeeId,
        clientType: "web",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Handle reconnection logic
  const handleReconnection = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError("Connection lost. Please refresh the page.");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionStatus(CONNECTION_STATUS.RECONNECTING);

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts((prev) => prev + 1);
      if (socketRef.current) {
        socketRef.current.connect();
      }
    }, reconnectDelay);
  };

  // Disconnect socket
  const disconnectSocket = () => {
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
  };

  // Manually force reconnection
  const forceReconnect = () => {
    disconnectSocket();
    setReconnectAttempts(0);
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  // Emit call-related events
  const emitCallEvent = (eventName, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    } else {
      setLastError("Not connected to server");
    }
  };

  // Register call event handlers from DialerProvider
  const registerCallEventHandlers = (handlers) => {
    callEventHandlersRef.current = handlers;
  };

  // Auto-connect on mount
  useEffect(() => {
    connectSocket();

    return () => {
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
      registerForCallEvents(userData.EmployeeId);
    }
  }, [connectionStatus, userData.EmployeeId]);

  // Helper functions
  const isConnected = () => connectionStatus === CONNECTION_STATUS.CONNECTED;

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
