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

  // Call event handlers - these will be set by DialerProvider
  const [callEventHandlers, setCallEventHandlers] = useState({});

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
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  // Socket configuration
  const socketConfig = {
    transports: ["polling", "websocket"], // Try polling first, then websocket
    timeout: 20000, // Increase timeout
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: reconnectDelay,
    autoConnect: false, // We'll connect manually
    forceNew: true, // Force new connection
    upgrade: true, // Allow transport upgrades
  };

  // Initialize socket connection
  const connectSocket = () => {
    if (socketRef.current?.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    try {
      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      setLastError(null);

      const serverUrl = baseURL || "http://localhost:5000";
      console.log("🔌 Connecting to socket server:", serverUrl);

      const newSocket = io(serverUrl, socketConfig);
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);

        // Register this client for call events if user data is available
        if (userData.EmployeeId) {
          registerForCallEvents(userData.EmployeeId);
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError(`Connection failed: ${error.message}`);

        // Handle reconnection
        handleReconnection();
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);

        if (reason === "io server disconnect") {
          // Server initiated disconnect, try to reconnect
          handleReconnection();
        }
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Reconnection attempt:", attemptNumber);
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
        setReconnectAttempts(attemptNumber);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection failed:", error);
        setLastError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("❌ All reconnection attempts failed");
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setLastError("Unable to reconnect to server. Please refresh the page.");
      });

      // Call-specific event handlers
      setupCallEventListeners(newSocket);

      // Manually connect
      newSocket.connect();
    } catch (error) {
      console.error("❌ Error initializing socket:", error);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError(`Failed to initialize connection: ${error.message}`);
    }
  };

  // Setup call event listeners
  const setupCallEventListeners = (socket) => {
    // Call initiated successfully
    socket.on("call-initiated", (data) => {
      console.log("📞 Call initiated event:", data);
      if (callEventHandlers.onCallInitiated) {
        callEventHandlers.onCallInitiated(data);
      }
    });

    // Call status updates (ringing, connected, etc.)
    socket.on("call-status-update", (data) => {
      console.log("📱 Call status update:", data);
      if (callEventHandlers.onCallStatusUpdate) {
        callEventHandlers.onCallStatusUpdate(data);
      }
    });

    // Call connected (both parties answered)
    socket.on("call-connected", (data) => {
      console.log("✅ Call connected event:", data);
      if (callEventHandlers.onCallConnected) {
        callEventHandlers.onCallConnected(data);
      }
    });

    // Call hold status changed
    socket.on("call-hold-status", (data) => {
      console.log("⏸️ Call hold status:", data);
      if (callEventHandlers.onCallHoldStatus) {
        callEventHandlers.onCallHoldStatus(data);
      }
    });

    // Call ended
    socket.on("call-ended", (data) => {
      console.log("📱 Call ended event:", data);
      if (callEventHandlers.onCallEnded) {
        callEventHandlers.onCallEnded(data);
      }
    });

    // Call failed
    socket.on("call-failed", (data) => {
      console.log("❌ Call failed event:", data);
      if (callEventHandlers.onCallFailed) {
        callEventHandlers.onCallFailed(data);
      }
    });

    // General call error
    socket.on("call-error", (data) => {
      console.log("⚠️ Call error event:", data);
      if (callEventHandlers.onCallError) {
        callEventHandlers.onCallError(data);
      }
    });

    // Incoming call (for future use)
    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call event:", data);
      if (callEventHandlers.onIncomingCall) {
        callEventHandlers.onIncomingCall(data);
      }
    });

    // Generic error handler
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setLastError(`Socket error: ${error.message || error}`);
    });
  };

  // Register client for call events
  const registerForCallEvents = (employeeId) => {
    if (socketRef.current?.connected) {
      console.log("📝 Registering for call events:", employeeId);
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
      console.log("❌ Max reconnection attempts reached");
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      setLastError("Connection lost. Please refresh the page.");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionStatus(CONNECTION_STATUS.RECONNECTING);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(
        `🔄 Attempting reconnection (${
          reconnectAttempts + 1
        }/${maxReconnectAttempts})`
      );
      setReconnectAttempts((prev) => prev + 1);

      if (socketRef.current) {
        socketRef.current.connect();
      }
    }, reconnectDelay);
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting socket");
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
    console.log("🔄 Forcing reconnection");
    disconnectSocket();
    setReconnectAttempts(0);
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  // Emit call-related events
  const emitCallEvent = (eventName, data) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Emitting ${eventName}:`, data);
      socketRef.current.emit(eventName, data);
    } else {
      console.warn("⚠️ Cannot emit event - socket not connected");
      setLastError("Not connected to server");
    }
  };

  // Register call event handlers from DialerProvider
  const registerCallEventHandlers = (handlers) => {
    console.log("📝 Registering call event handlers");
    setCallEventHandlers(handlers);
  };

  // Auto-connect on mount
  useEffect(() => {
    connectSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, []);

  // Re-register for events when user data changes or connection is restored
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
