import React, { useState, useEffect, useContext, use } from "react";
import { useLocation } from "react-router-dom";
import {
  PhoneIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PhoneArrowUpRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  SignalIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";
import { useCall } from "../../../hooks/useCall";

const OutgoingCallPage = () => {
  const location = useLocation();
  const { userData } = useContext(UserContext);
  const { initiateCall } = useCall();

  // ====== ROLE DETECTION ======
  // Determine if the current user is a manager (EmployeeRole = 2) or agent (EmployeeRole = 1)
  const isManager = userData?.EmployeeRole === 2;
  console.log(
    "👤 User role detected:",
    isManager ? "Manager" : "Agent",
    "| EmployeeRole:",
    userData?.EmployeeRole
  );

  // ====== SHARED STATE (Both Agent & Manager) ======
  const [searchTerm, setSearchTerm] = useState("");
  const [connectedFilterAgent, setConnectedFilterAgent] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [outgoingCalls, setOutgoingCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());

  // ====== MANAGER-SPECIFIC STATE ======
  // These states are only used when user is a manager
  const [selectedAgentId, setSelectedAgentId] = useState(""); // Filter calls by specific agent
  const [connectedFilter, setConnectedFilter] = useState(""); // Filter by connection status (true/false/"")
  const [groupedRecords, setGroupedRecords] = useState([]); // Agent-wise grouped call data
  const [expandedAgents, setExpandedAgents] = useState(new Set()); // Track which agent groups are expanded
  const [availableAgents, setAvailableAgents] = useState([]); // List of agents for dropdown filter
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // ====== ROLE 3 SPECIFIC STATE ======
  const [employees, setEmployees] = useState([]); // Store employee data
  const [selectedEmployeePhone, setSelectedEmployeePhone] = useState(""); // Selected employee's phone
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false); // Loading state for employees

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const agentPhone = params.get("agentPhone");
    if (agentPhone) {
      setSelectedEmployeePhone(agentPhone);
    }
  }, [location.search]);

  // ====== DATE RANGE STATE (Enhanced for Manager) ======
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Helper function to get yesterday's date in YYYY-MM-DD format
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  // Helper function to get date N days ago in YYYY-MM-DD format
  const getDateNDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  // Managers get more sophisticated date filtering
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  // ====== EXCEL EXPORT STATE (Manager Only) ======
  // These states handle the Excel export functionality for managers
  const [isExporting, setIsExporting] = useState(false); // Track export process
  const [exportProgress, setExportProgress] = useState(0); // Progress percentage (0-100)
  const [exportError, setExportError] = useState(null); // Export error message

  // Helper function to format duration from seconds
  const formatDurationFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to format total talk time
  const formatTotalTalkTime = (seconds) => {
    if (!seconds || seconds === 0) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // ====== NEW FUNCTION TO FETCH EMPLOYEES (Add this function) ======
  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      console.log("👥 Fetching employees data for role 3 user");

      const response = await axiosInstance.get("/admin/employees");

      console.log("👥 Employees API response:", response.data);

      if (response.data.success && response.data.data) {
        setEmployees(response.data.data);
        console.log(`👥 Loaded ${response.data.data.length} employees`);
      } else {
        console.warn(
          "⚠️ Employees API response structure unexpected:",
          response.data
        );
        setEmployees([]);
      }
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // ====== FETCH AVAILABLE AGENTS FOR MANAGER DROPDOWN ======
  const fetchAvailableAgents = async () => {
    if (!isManager) return;

    setIsLoadingAgents(true);
    try {
      console.log("👥 Fetching available agents for manager filter");
      const response = await axiosInstance.get(
        `/calls/agents-for-manager/${userData?.EmployeeId}`
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        // Assuming the API returns a list of all employees.
        // We can map them to the format needed for the dropdown.
        const agents = response.data.data.map((emp) => ({
          id: emp.EmployeeId,
          name: emp.EmployeeName,
          phone: emp.EmployeePhone,
        }));
        setAvailableAgents(agents);
        console.log(`👥 Loaded ${agents.length} agents for dropdown.`);
      } else {
        console.warn("⚠️ Could not fetch available agents:", response.data);
        setAvailableAgents([]);
      }
    } catch (error) {
      console.error("❌ Error fetching available agents:", error);
      setAvailableAgents([]);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // ====== MAIN API FUNCTION - Role-Based Data Fetching ======
  const fetchOutgoingCalls = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isManager) {
        // ====== MANAGER API CALL ======
        await fetchManagerOutgoingCalls();
      } else {
        // ====== AGENT API CALL ======
        await fetchAgentOutgoingCalls();
      }
    } catch (error) {
      console.error("❌ Error in fetchOutgoingCalls:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== MANAGER API FUNCTION ======
  const fetchManagerOutgoingCalls = async () => {
    const managerId = userData?.EmployeeId;
    if (!managerId) {
      throw new Error("Manager ID not found. Please login again.");
    }

    console.log("👨‍💼 Fetching manager outgoing calls for ID:", managerId);
    console.log("📊 Manager filters:", {
      startDate,
      endDate,
      page: currentPage,
      limit: 10,
      connected: connectedFilter,
      agentId: selectedAgentId,
    });

    // Build API parameters based on manager filters
    const params = {
      startDate: startDate,
      endDate: endDate,
      page: currentPage,
      limit: 10, // Fixed limit for pagination
    };

    // Add optional filters only if they have values
    if (connectedFilter !== "") {
      params.connected = connectedFilter === "true";
    }
    if (selectedAgentId) {
      params.agentId = selectedAgentId;
    }

    const response = await axiosInstance.get(
      `/calls/manager-outgoing-call-summary/${managerId}`,
      {
        params,
      }
    );

    console.log("👨‍💼 Manager API response:", response.data);

    if (response.data.success && response.data.data) {
      const {
        stats = {},
        pagination = {},
        groupedRecords = [],
      } = response.data.data;

      // Store grouped records for manager view
      setGroupedRecords(groupedRecords || []);

      // Transform grouped calls into flat list for compatibility with existing components
      const flatTransformedCalls = [];

      (groupedRecords || []).forEach((agentGroup) => {
        // Transform each call in the agent's call list
        (agentGroup?.calls || []).forEach((call) => {
          const transformedCall = transformManagerCall(
            call,
            agentGroup.agentDetails
          );
          flatTransformedCalls.push(transformedCall);
        });
      });

      // Set flat calls for table display
      setOutgoingCalls(flatTransformedCalls);

      // Set manager stats with safe fallbacks
      setStats({
        total: (stats && stats.totalCalls) || 0,
        completed: (stats && stats.connectedCalls) || 0,
        failed: (stats && stats.failedCalls) || 0,
        totalTalkTime: formatTotalTalkTime((stats && stats.totalTalkTime) || 0),
      });

      setPagination(pagination || {});
    } else {
      console.warn(
        "⚠️ Manager API response structure unexpected:",
        response.data
      );
      setGroupedRecords([]);
      setOutgoingCalls([]);
      setStats({ total: 0, completed: 0, failed: 0, totalTalkTime: "0m" });
      setPagination({});
    }
  };

  // ====== AGENT API FUNCTION (Updated for new API structure) ======
  // ====== AGENT API FUNCTION (Updated for new API structure) ======
  const fetchAgentOutgoingCalls = async () => {
    const userRole = userData?.EmployeeRole;
    let agentNumber = userData?.EmployeePhone;

    // For role 3, use selected employee phone if available
    if (userRole === 3 && selectedEmployeePhone) {
      agentNumber = selectedEmployeePhone;
    }

    // For userRole !== 3, require agentNumber
    if (userRole !== 3 && !agentNumber) {
      throw new Error("Agent phone number not found. Please login again.");
    }

    console.log("👤 Fetching agent outgoing calls for:", agentNumber);
    console.log("👤 User role:", userRole);
    console.log("👤 Selected employee phone:", selectedEmployeePhone);

    // Calculate date range based on dateFilter
    let apiStartDate, apiEndDate;
    switch (dateFilter) {
      case "today":
        apiStartDate = getTodayDate();
        apiEndDate = getTodayDate();
        break;
      case "yesterday":
        apiStartDate = getYesterdayDate();
        apiEndDate = getYesterdayDate();
        break;
      case "week":
        apiStartDate = getDateNDaysAgo(7);
        apiEndDate = getTodayDate();
        break;
      case "custom":
        apiStartDate = startDate;
        apiEndDate = endDate;
        break;
      default:
        apiStartDate = getTodayDate();
        apiEndDate = getTodayDate();
    }

    // Build params object
    const params = {
      startDate: apiStartDate,
      endDate: apiEndDate,
      page: currentPage,
      limit: 10,
    };

    // FIXED: Only add agentNumber to params if userRole is NOT 3 AND agentNumber exists
    // OR if userRole IS 3 AND selectedEmployeePhone exists
    if (
      (userRole !== 3 && agentNumber) ||
      (userRole === 3 && selectedEmployeePhone)
    ) {
      params.agentNumber = agentNumber;
    }

    // Add optional filters
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (connectedFilterAgent && connectedFilterAgent !== "") {
      params.connected = connectedFilterAgent === "true";
    }

    console.log("👤 Final API params:", params);

    const response = await axiosInstance.get("/calls/outgoing", {
      params: params,
    });

    console.log("👤 Agent API response:", response.data);

    if (response.data.success && response.data.data) {
      const { stats = {}, pagination = {}, records = [] } = response.data.data;

      // Transform agent calls using updated logic for new API structure
      const transformedCalls = (records || []).map((call) =>
        transformAgentCall(call)
      );

      setOutgoingCalls(transformedCalls);

      // Use stats from API response directly with safe fallbacks
      setStats({
        total: (stats && stats.totalCalls) || 0,
        completed: (stats && stats.connected) || 0,
        failed: (stats && stats.missed) || 0,
        totalTalkTime: formatTotalTalkTime((stats && stats.totalTalkTime) || 0),
      });
      setPagination(pagination || {});
    } else {
      console.warn(
        "⚠️ Agent API response structure unexpected:",
        response.data
      );
      setOutgoingCalls([]);
      setStats({ total: 0, completed: 0, failed: 0, totalTalkTime: "0m" });
      setPagination({});
    }
  };

  // ====== CALL TRANSFORMATION FUNCTIONS ======

  // Transform manager call data (from grouped API response)
  const transformManagerCall = (call, agentDetails) => {
    const recipientName =
      call.trader_master?.Trader_Name ||
      call.trader_master?.Trader_business_Name ||
      call.BPartyContact?.Contact_Name || // Keep fallback
      "Unknown Caller";
    const recipientNumber = call.customerNumber || call.bPartyNo;
    const region =
      call.trader_master?.Region || call.BPartyContact?.Region || "Unknown";
    const zone =
      call.trader_master?.Zone || call.BPartyContact?.Zone || "Unknown";

    // Determine status from manager API data
    let status = "failed";
    if (
      call.aDialStatus === "Connected" &&
      call.bDialStatus === "Connected" &&
      call.totalCallDuration > 0
    ) {
      status = "completed";
    }

    // Determine call outcome
    let callOutcome = "no-answer";
    if (call.aDialStatus === "Connected" && call.bDialStatus === "Connected") {
      callOutcome = "successful";
    } else if (call.bDialStatus === "User Not Responding") {
      callOutcome = "no-answer";
    } else if (call.aDialStatus === "Line Drop") {
      callOutcome = "line-drop";
    }

    return {
      id: call.CallId,
      callId: call.CallId,
      recipientName: recipientName,
      recipientNumber: recipientNumber,
      region: region,
      zone: zone,
      callDateTime: call.callStartTime,
      duration: formatDurationFromSeconds(call.totalCallDuration),
      status: status,
      callOutcome: callOutcome,
      aDialStatus: call.aDialStatus,
      bDialStatus: call.bDialStatus,
      // MANAGER-SPECIFIC: Add agent information
      agentName: agentDetails?.EmployeeName || "Unknown Agent",
      agentPhone: agentDetails?.EmployeePhone || "N/A",
      agentId: agentDetails?.EmployeeId || null,
      agentRegion: agentDetails?.EmployeeRegion || "Unknown",
      // Form details if available
      formDetails: call.formDetails || null,
      remarks: call.formDetails?.remarks || null,
      rawData: call, // Store original data for details modal
      recordVoice: call.recordVoice,
      // Additional manager context
      isManagerView: true,
    };
  };

  // Transform agent call data (updated for new API structure)
  const transformAgentCall = (call) => {
    // Get trader name from trader_master (updated based on your new API response)
    const recipientName =
      call.trader_master?.Trader_Name ||
      call.trader_master?.Trader_business_Name ||
      "Unknown Caller";

    const recipientNumber = call.customerNumber;

    // Get region from trader_master (updated based on your new API response)
    const region = call.trader_master?.Region || "Unknown";
    const zone = call.trader_master?.Zone || "Unknown";

    // Use status directly from API response
    const status = call.status === "Connected" ? "completed" : "failed";

    // Get remarks from formDetails
    const remarks = call.formDetails?.remarks || null;

    return {
      id: call.CallId,
      callId: call.CallId,
      recipientName: recipientName,
      recipientNumber: recipientNumber,
      region: region,
      zone: zone,
      callDateTime: call.callStartTime,
      duration: formatDurationFromSeconds(call.totalCallDuration),
      status: status,
      callStatus: call.status, // Store original status for retry logic
      remarks: remarks,
      rawData: call, // Store original data for details modal
      isManagerView: false,
      // Additional data from new API
      agent: call.agent,
      trader_master: call.trader_master,
      formDetails: call.formDetails,
      recordVoice: call.recordVoice,
    };
  };

  // ====== EXCEL EXPORT FUNCTIONALITY (Manager Only) ======

  const handleExcelExport = async () => {
    // Only allow export for managers
    if (!isManager) {
      console.warn("🚫 Excel export is only available for managers");
      return;
    }

    const managerId = userData?.EmployeeId;
    if (!managerId) {
      setExportError("Manager ID not found. Please login again.");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportError(null);

      console.log("📊 Starting Excel export for manager:", managerId);
      console.log("📊 Export parameters:", {
        managerId,
        startDate,
        endDate,
        selectedAgentId: selectedAgentId || "All Agents",
        connectedFilter: connectedFilter || "All Calls",
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90%, complete when API finishes
          return prev + Math.random() * 15; // Random increment
        });
      }, 200);

      // Build API parameters using existing filter states
      const exportParams = {
        startDate: startDate,
        endDate: endDate,
      };

      // Add optional filters if they exist (same as data fetching logic)
      if (selectedAgentId) {
        exportParams.agentId = selectedAgentId;
      }
      if (connectedFilter !== "") {
        exportParams.connected = connectedFilter === "true";
      }

      console.log("📊 Final export parameters:", exportParams);

      // Make API call to download Excel file
      const response = await axiosInstance.get(
        `/reports/manager-outgoing-calls/${managerId}/download`,
        {
          params: exportParams,
          responseType: "blob", // Important: Handle binary data for file download
          timeout: 120000, // 2 minute timeout for large exports
        }
      );

      console.log("📊 Export API response received");

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setExportProgress(100);

      // Create and trigger file download
      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with current date and filters
      const dateStr = new Date().toISOString().split("T")[0];
      const agentFilter = selectedAgentId
        ? `_Agent${selectedAgentId}`
        : "_AllAgents";
      const statusFilter = connectedFilter
        ? `_${connectedFilter === "true" ? "Connected" : "Failed"}`
        : "_AllCalls";
      link.download = `Manager_Outgoing_Calls_${dateStr}_${startDate}_to_${endDate}${agentFilter}${statusFilter}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Excel export completed successfully");

      // Show success state briefly then reset
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1500);
    } catch (error) {
      console.error("❌ Excel export error:", error);

      // Clear progress interval
      const progressInterval = setInterval(() => {}, 200);
      clearInterval(progressInterval);

      // Set error state
      let errorMessage = "Failed to export Excel file. Please try again.";
      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Export timeout. The file might be too large. Try filtering data and export again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Export service not found. Please contact support.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to export this data.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setExportError(errorMessage);
      setIsExporting(false);
      setExportProgress(0);

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setExportError(null);
      }, 5000);
    }
  };

  // ====== EFFECT HOOKS ======

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    // Load employees if user is role 3
    if (userData?.EmployeeRole === 3) {
      fetchEmployees();
    }
    // Fetch agents for manager's filter dropdown
    if (isManager) {
      fetchAvailableAgents();
    }
  }, [userData?.EmployeeRole, isManager]);

  // Load data when component mounts or filters change
  useEffect(() => {
    if (userData?.EmployeeId || userData?.EmployeePhone) {
      fetchOutgoingCalls();
    }
  }, [
    dateFilter,
    currentPage,
    userData,
    // Manager-specific dependencies
    selectedAgentId,
    connectedFilter,
    startDate,
    endDate,
    // Agent-specific dependencies
    debouncedSearchTerm,
    connectedFilterAgent,
    // Role 3 specific dependency
    selectedEmployeePhone,
  ]);

  // ====== FILTERING LOGIC ======

  // For agent view, use server-side pagination so no client-side filtering
  // For manager view, keep client-side filtering since it handles multiple agents
  const filteredCalls = isManager
    ? outgoingCalls.filter((call) => {
        // ====== SEARCH FILTER ======
        const matchesSearch =
          call.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.recipientNumber.includes(searchTerm) ||
          call.callId.toString().includes(searchTerm) ||
          call.agentName?.toLowerCase().includes(searchTerm.toLowerCase());

        // ====== CONNECTED FILTER ======
        const matchesConnected =
          connectedFilter === "" ||
          (connectedFilter === "true" && call.status === "completed") ||
          (connectedFilter === "false" && call.status !== "completed");

        return matchesSearch && matchesConnected;
      })
    : outgoingCalls; // Agent view: no client-side filtering, data comes paginated from server

  // ====== HELPER FUNCTIONS FOR MANAGER FEATURES ======

  // Toggle agent group expansion in manager view
  const toggleAgentExpansion = (agentId) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  // Clear all manager-specific filters
  const clearManagerFilters = () => {
    setSelectedAgentId("");
    setConnectedFilter("");
    setSearchTerm("");
    setDateFilter("today");
    setSortBy("recent");
    setCurrentPage(1);
  };

  // Clear all agent-specific filters
  const clearAgentFilters = () => {
    setSearchTerm("");
    setConnectedFilterAgent("");
    setDateFilter("today");
    setSortBy("recent");
    setCurrentPage(1);
    // Clear selected employee for role 3 users
    if (userData?.EmployeeRole === 3) {
      setSelectedEmployeePhone("");
    }
  };

  // Handle view details
  const handleViewDetails = (call) => {
    setSelectedCall(call);
    setShowDetailsModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOutgoingCalls();
  };

  // Handle retry call
  const handleRetryCall = (phoneNumber, traderName) => {
    console.log("🔍 handleRetryCall called with:", { phoneNumber, traderName });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(
        `📞 Initiating retry call to ${phoneNumber} for ${traderName}`
      );

      // Set the current number first, then initiate call
      initiateCall(phoneNumber);

      console.log("✅ Retry call initiated");
    } else {
      console.error("❌ No phone number provided for retry");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case "busy":
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <SignalIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "busy":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case "successful":
        return <CheckCircleIcon className="w-3 h-3 text-green-600" />;
      case "no-answer":
        return <XCircleIcon className="w-3 h-3 text-red-600" />;
      case "line-drop":
        return <ExclamationTriangleIcon className="w-3 h-3 text-yellow-600" />;
      default:
        return <SignalIcon className="w-3 h-3 text-gray-600" />;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="space-y-6">
      {/* ====== ROLE-SPECIFIC HEADER SECTION ====== */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Dynamic title based on user role */}
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <PhoneArrowUpRightIcon className="w-5 h-5 text-blue-600 mr-2" />
                {isManager ? "Team Outgoing Calls" : "Outgoing Calls"}
                {/* Manager badge */}
                {isManager && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <UserGroupIcon className="w-3 h-3 mr-1" />
                    Manager View
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isManager
                  ? "Monitor and analyze outbound calls from all agents under your supervision"
                  : "Monitor and analyze all outbound calls to traders"}
              </p>
              {/* Manager-specific info */}
              {isManager && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Manager:</span>{" "}
                  {userData?.EmployeeName} •
                  <span className="font-medium"> Region:</span>{" "}
                  {userData?.EmployeeRegion} •
                  <span className="font-medium"> ID:</span>{" "}
                  {userData?.EmployeeId}
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowPathIcon className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`stats-loading-${i}`}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-12 mb-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-blue-900">
                      {stats?.total || 0}
                    </div>
                    <div className="text-xs text-blue-600">Total Calls</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-green-900">
                      {stats?.completed || 0}
                    </div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-red-900">
                      {stats?.failed || 0}
                    </div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-purple-900">
                      {stats?.totalTalkTime || "0m"}
                    </div>
                    <div className="text-xs text-purple-600">
                      Total Talk Time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shimmer Animation CSS */}
          <style jsx>{`
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }

            .animate-shimmer {
              animation: shimmer 1.5s infinite;
            }
          `}</style>
        </div>
      </div>

      {/* ====== ROLE-SPECIFIC FILTERS SECTION ====== */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          {isManager ? (
            // ====== MANAGER FILTERS ======
            <div className="space-y-4">
              {/* Manager Filter Header */}
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  Advanced Filters
                </h3>
                <span className="text-xs text-gray-500">
                  {filteredCalls.length} of {outgoingCalls.length} calls
                </span>
              </div>

              {/* Row 1: Search and Agent Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Enhanced Search for Manager */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search Calls
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, number, call ID, or agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Agent Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Filter by Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoadingAgents}
                  >
                    <option value="">
                      {isLoadingAgents
                        ? "Loading agents..."
                        : `All Agents (${availableAgents.length})`}
                    </option>
                    {availableAgents.map((agent) => (
                      <option key={`agent-${agent.id}`} value={agent.id}>
                        {agent.name} ({agent.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Connection Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Connection Status
                  </label>
                  <select
                    value={connectedFilter}
                    onChange={(e) => setConnectedFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">All Calls</option>
                    <option value="true">Connected Only</option>
                    <option value="false">Failed Only</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date Range, Advanced Filters, and Export */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Connection Status
                  </label>
                  <select
                    value={connectedFilter}
                    onChange={(e) => setConnectedFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">All Calls</option>
                    <option value="true">Connected</option>
                    <option value="false">Not Connected</option>
                  </select>
                </div>

                {/* Export to Excel */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Export Data
                  </label>
                  <button
                    onClick={handleExcelExport}
                    disabled={isExporting || isLoading}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                      isExporting
                        ? "bg-green-100 text-green-700 border-green-200 cursor-wait"
                        : "bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500"
                    } ${isExporting || isLoading ? "opacity-75" : ""}`}
                  >
                    {isExporting ? (
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-xs">
                          Exporting... {Math.round(exportProgress)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                        Excel Export
                      </div>
                    )}
                  </button>
                </div>

                {/* Clear Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reset Filters
                  </label>
                  <button
                    onClick={clearManagerFilters}
                    disabled={isExporting}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ====== AGENT FILTERS (Original) ======
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Connected Filter */}
              <select
                value={connectedFilterAgent}
                onChange={(e) => setConnectedFilterAgent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Calls</option>
                <option value="true">Connected</option>
                <option value="false">Not Connected</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="custom">Custom</option>
              </select>

              {/* Custom Date Range for Agent */}
              {dateFilter === "custom" && (
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              {userData?.EmployeeRole === 3 && (
                // Employee Selection Dropdown for Role 3
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmployeePhone}
                    onChange={(e) => {
                      setSelectedEmployeePhone(e.target.value);
                      setCurrentPage(1); // Reset to page 1 when employee changes
                    }}
                    disabled={isLoadingEmployees}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingEmployees
                        ? "Loading employees..."
                        : "All Employees"}
                    </option>
                    {employees.map((employee) => (
                      <option
                        key={`employee-${employee.EmployeeId}`}
                        value={employee.EmployeePhone}
                      >
                        {employee.EmployeeName} (
                        {employee.role?.RoleName || "Unknown Role"})
                      </option>
                    ))}
                  </select>
                  {isLoadingEmployees && (
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                      <ArrowPathIcon className="w-3 h-3 animate-spin mr-1" />
                      Loading employees...
                    </div>
                  )}
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearAgentFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ====== EXCEL EXPORT PROGRESS MODAL (Manager Only) ====== */}
      {isManager && isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentArrowDownIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Exporting Excel File
              </h3>
              <p className="text-gray-600 mb-4">
                Please wait while we prepare your outgoing calls data...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {exportProgress < 90 ? (
                  <span>Processing data... {Math.round(exportProgress)}%</span>
                ) : exportProgress < 100 ? (
                  <span>
                    Finalizing export... {Math.round(exportProgress)}%
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    ✓ Export completed! Download starting...
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Date Range: {startDate} to {endDate}
                {selectedAgentId && (
                  <div>
                    Agent:{" "}
                    {availableAgents.find((a) => a.id == selectedAgentId)
                      ?.name || selectedAgentId}
                  </div>
                )}
                {connectedFilter && (
                  <div>
                    Status:{" "}
                    {connectedFilter === "true"
                      ? "Connected Only"
                      : "Failed Only"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== EXCEL EXPORT ERROR NOTIFICATION ====== */}
      {isManager && exportError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-start">
              <XCircleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Export Failed</div>
                <div className="text-sm mt-1">{exportError}</div>
              </div>
              <button
                onClick={() => setExportError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Calls
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Calls List */}
      {!error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`loading-skeleton-${i}`}
                    className="flex items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <PhoneArrowUpRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Outgoing Calls
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                connectedFilterAgent !== "" ||
                (isManager && connectedFilter !== "")
                  ? "No calls match your search criteria"
                  : "No outgoing calls found for the selected period"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient Details
                    </th>
                    {/* Manager-specific agent column */}
                    {isManager && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent Info
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    {/* Manager gets enhanced actions */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isManager ? "Actions & Forms" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCalls.map((call, index) => {
                    const { date, time } = formatDateTime(call.callDateTime);
                    return (
                      <tr
                        key={`${call.id}-${call.callId}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        {/* Recipient Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {call.recipientName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {call.recipientNumber}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {call.callId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Manager-specific Agent Info */}
                        {isManager && (
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-purple-600" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {call.agentName || "Unknown Agent"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {call.agentPhone || "N/A"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Region: {call.agentRegion || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Region Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {call.region}
                          </div>
                        </td>

                        {/* Call Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {date}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {time} • {call.duration}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                            >
                              {call.status === "completed"
                                ? "Connected"
                                : "Not Connected"}
                            </span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {call.remarks ? (
                              <div className="max-w-xs">
                                {call.remarks.length > 50 ? (
                                  <div>
                                    {expandedRemarks.has(call.id) ? (
                                      <div>
                                        <div className="whitespace-pre-wrap break-words mb-1">
                                          {call.remarks}
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(
                                              expandedRemarks
                                            );
                                            newExpanded.delete(call.id);
                                            setExpandedRemarks(newExpanded);
                                          }}
                                          className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : (
                                      <div>
                                        <span>
                                          {call.remarks.substring(0, 50)}...
                                        </span>
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(
                                              expandedRemarks
                                            );
                                            newExpanded.add(call.id);
                                            setExpandedRemarks(newExpanded);
                                          }}
                                          className="ml-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                        >
                                          read more
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span>{call.remarks}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                No remarks
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Enhanced Actions Column */}
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleViewDetails(call)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                            {call.recordVoice &&
                              call.recordVoice !== "No Voice" && (
                                <a
                                  href={call.recordVoice}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-900 flex items-center"
                                >
                                  <PlayIcon className="w-4 h-4 mr-1" />
                                  Recording
                                </a>
                              )}
                            {/* Show retry call button for non-connected calls */}
                            {call.callStatus !== "Connected" &&
                              call.status !== "completed" && (
                                <button
                                  onClick={() =>
                                    handleRetryCall(
                                      call.recipientNumber,
                                      call.recipientName
                                    )
                                  }
                                  className="text-orange-600 hover:text-orange-900 flex items-center"
                                  disabled={!call.recipientNumber}
                                >
                                  <PhoneIcon className="w-4 h-4 mr-1" />
                                  Retry Call
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages)
                    )
                  }
                  disabled={currentPage >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, pagination.totalRecords)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalRecords}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ArrowDownIcon
                        className="h-5 w-5 rotate-90"
                        aria-hidden="true"
                      />
                    </button>

                    {/* Page Numbers */}
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, index) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }

                        return (
                          <button
                            key={`page-${pageNum}-${index}`}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? "z-10 bg-green-50 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, pagination.totalPages)
                        )
                      }
                      disabled={currentPage >= pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ArrowDownIcon
                        className="h-5 w-5 -rotate-90"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-green-600" />
                  Call Details - {selectedCall.callId}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Call Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Call Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Call Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call ID:</span>
                      <span className="font-medium">
                        {selectedCall.rawData?.CallId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Number:</span>
                      <span className="font-medium">
                        {selectedCall.rawData?.agentNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Number:</span>
                      <span className="font-medium">
                        {selectedCall.rawData?.customerNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedCall.rawData?.callStartTime
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connected Time:</span>
                      <span className="font-medium">
                        {selectedCall.rawData?.aPartyConnectedTime
                          ? new Date(
                              selectedCall.rawData.aPartyConnectedTime
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">
                        {selectedCall.rawData?.aPartyEndTime
                          ? new Date(
                              selectedCall.rawData.aPartyEndTime
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {selectedCall.totalCallDuration ||
                          selectedCall.duration}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                      >
                        {selectedCall.rawData?.status ||
                          (selectedCall.rawData?.bDialStatus === ""
                            ? "No Status"
                            : selectedCall.rawData?.bDialStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Status Details */}
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Call Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCall.rawData?.aDialStatus === "Connected"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedCall.rawData?.aDialStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCall.rawData?.bDialStatus === "Connected"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedCall.rawData?.bDialStatus || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCall.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedCall.status}
                      </span>
                    </div>
                    {selectedCall.callOutcome && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call Outcome:</span>
                        <span className="font-medium capitalize">
                          {selectedCall.callOutcome?.replace("-", " ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Trader Master Details */}
                {selectedCall.rawData?.trader_master && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Trader Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trader Name:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master.Trader_Name ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Business Name:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master
                            .Trader_business_Name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact Number:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master.Contact_no}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master.Code}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master.Region}
                        </span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.trader_master.Zone || "N/A"}
                        </span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                        >
                          {selectedCall.rawData.trader_master.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Details */}
                {selectedCall.rawData?.agent && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Agent Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent Name:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.agent.EmployeeName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.agent.EmployeeId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.agent.EmployeePhone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.agent.EmployeeRegion}
                        </span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">Role ID:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.agent.EmployeeRoleID}
                        </span>
                      </div> */}
                    </div>
                  </div>
                )}

                {/* Form Details */}
                {selectedCall.rawData?.formDetails && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Form Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call Type:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.callType || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inquiry Number:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.inquiryNumber ||
                            "N/A"}
                        </span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">Support Type:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.SupportType
                            ?.supportName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Process Type:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.ProcessType
                            ?.processName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Query Type:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.QueryType
                            ?.queryName || "N/A"}
                        </span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inquiry Type:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.ProblemCategory
                            ?.problemName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inquiry Details:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.ProblemSubCategory
                            ?.subProblemName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Follow-up Date:</span>
                        <span className="font-medium">
                          {selectedCall.rawData.formDetails.followUpDate
                            ? new Date(
                                selectedCall.rawData.formDetails.followUpDate
                              ).toLocaleDateString()
                            : "No follow-up scheduled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Form Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCall.rawData.formDetails.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {selectedCall.rawData.formDetails.status
                            ?.charAt(0)
                            .toUpperCase() +
                            selectedCall.rawData.formDetails.status?.slice(1) ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 text-sm">Remarks:</span>
                        <div className="mt-1 p-3 bg-white border rounded-lg">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedCall.rawData.formDetails.remarks ||
                              "No remarks provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recording Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Call Recording
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recording Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (selectedCall.rawData?.recordVoice &&
                            selectedCall.rawData.recordVoice !== "No Voice") ||
                          (selectedCall.rawData?.voiceRecording &&
                            selectedCall.rawData.voiceRecording !== "No Voice")
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {(selectedCall.rawData?.recordVoice &&
                          selectedCall.rawData.recordVoice !== "No Voice") ||
                        (selectedCall.rawData?.voiceRecording &&
                          selectedCall.rawData.voiceRecording !== "No Voice")
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </div>
                    {(selectedCall.rawData?.recordVoice &&
                      selectedCall.rawData.recordVoice !== "No Voice") ||
                    (selectedCall.rawData?.voiceRecording &&
                      selectedCall.rawData.voiceRecording !== "No Voice") ? (
                      <div>
                        <a
                          href={
                            selectedCall.rawData.recordVoice ||
                            selectedCall.rawData.voiceRecording
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play Recording
                        </a>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        No Recording Available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutgoingCallPage;
