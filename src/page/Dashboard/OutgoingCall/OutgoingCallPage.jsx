import React, { useState, useEffect, useContext } from "react";
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

const OutgoingCallPage = () => {
  const { userData } = useContext(UserContext);

  // ====== ROLE DETECTION ======
  // Determine if the current user is a manager (EmployeeRole = 2) or agent (EmployeeRole = 1)
  const isManager = userData?.EmployeeRole === 2;
  console.log("👤 User role detected:", isManager ? "Manager" : "Agent", "| EmployeeRole:", userData?.EmployeeRole);

  // ====== SHARED STATE (Both Agent & Manager) ======
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // ====== DATE RANGE STATE (Enhanced for Manager) ======
  // Managers get more sophisticated date filtering
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-07");

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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      limit: 50,
      connected: connectedFilter,
      agentId: selectedAgentId
    });

    // Build API parameters based on manager filters
    const params = {
      startDate: startDate,
      endDate: endDate,
      page: currentPage,
      limit: 50, // Fixed limit as per API
    };

    // Add optional filters only if they have values
    if (connectedFilter !== "") {
      params.connected = connectedFilter === "true";
    }
    if (selectedAgentId) {
      params.agentId = selectedAgentId;
    }

    const response = await axiosInstance.get(`/calls/manager-outgoing-call-summary/${managerId}`, {
      params
    });

    console.log("👨‍💼 Manager API response:", response.data);

    if (response.data.success && response.data.data) {
      const { stats, pagination, groupedRecords } = response.data.data;

      // Store grouped records for manager view
      setGroupedRecords(groupedRecords || []);
      
      // Transform grouped calls into flat list for compatibility with existing components
      const flatTransformedCalls = [];
      const agentsList = [];

      groupedRecords?.forEach((agentGroup) => {
        // Add agent to available agents list
        if (agentGroup.agentDetails) {
          agentsList.push({
            id: agentGroup.agentDetails.EmployeeId,
            name: agentGroup.agentDetails.EmployeeName,
            phone: agentGroup.agentDetails.EmployeePhone,
            region: agentGroup.agentDetails.EmployeeRegion
          });
        }

        // Transform each call in the agent's call list
        agentGroup.calls?.forEach((call) => {
          const transformedCall = transformManagerCall(call, agentGroup.agentDetails);
          flatTransformedCalls.push(transformedCall);
        });
      });

      // Update available agents for filter dropdown
      setAvailableAgents(agentsList);

      // Set flat calls for table display
      setOutgoingCalls(flatTransformedCalls);

      // Set manager stats
      setStats({
        total: stats.totalCalls || 0,
        completed: stats.connectedCalls || 0,
        failed: stats.failedCalls || 0,
        totalTalkTime: formatTotalTalkTime(stats.totalTalkTime || 0)
      });

      setPagination(pagination);
    } else {
      console.warn("⚠️ Manager API response structure unexpected:", response.data);
      setGroupedRecords([]);
      setOutgoingCalls([]);
      setStats({ total: 0, completed: 0, failed: 0, totalTalkTime: "0m" });
    }
  };

  // ====== AGENT API FUNCTION (Original Logic) ======
  const fetchAgentOutgoingCalls = async () => {
    const agentNumber = userData?.EmployeePhone;
    if (!agentNumber) {
      throw new Error("Agent phone number not found. Please login again.");
    }

    console.log("👤 Fetching agent outgoing calls for:", agentNumber);
    
    const response = await axiosInstance.get("/calls/outgoing", {
      params: {
        startDate: startDate,
        endDate: endDate,
        agentNumber: agentNumber,
      },
    });

    console.log("👤 Agent API response:", response.data);

    if (response.data.success && response.data.data) {
      const { stats, pagination, records } = response.data.data;
      
      // Transform agent calls using existing logic
      const transformedCalls = records.map((call) => transformAgentCall(call));

      setOutgoingCalls(transformedCalls);
      
      // Calculate agent stats
      const totalCalls = stats.totalCalls || records.length;
      const completedCalls = records.filter(call => 
        call.aDialStatus === "Connected" && call.bDialStatus === "Connected" && call.totalCallDuration > 0
      ).length;
      const failedCalls = totalCalls - completedCalls;
      
      setStats({
        total: totalCalls,
        completed: completedCalls,
        failed: failedCalls,
        totalTalkTime: formatTotalTalkTime(stats.totalTalkTime || 0)
      });
      setPagination(pagination);
    } else {
      console.warn("⚠️ Agent API response structure unexpected:", response.data);
      setOutgoingCalls([]);
      setStats({ total: 0, completed: 0, failed: 0, totalTalkTime: "0m" });
    }
  };

  // ====== CALL TRANSFORMATION FUNCTIONS ======

  // Transform manager call data (from grouped API response)
  const transformManagerCall = (call, agentDetails) => {
    const recipientName = call.BPartyContact?.Contact_Name || "Unknown Caller";
    const recipientNumber = call.bPartyNo;
    const region = call.BPartyContact?.Region || "Unknown";
    const zone = call.BPartyContact?.Zone || "Unknown";
    
    // Determine status from manager API data
    let status = "failed";
    if (call.aDialStatus === "Connected" && call.bDialStatus === "Connected" && call.totalCallDuration > 0) {
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
      // Additional manager context
      isManagerView: true
    };
  };

  // Transform agent call data (original logic)
  const transformAgentCall = (call) => {
    const recipientName = call.BPartyContact?.Contact_Name || "Unknown Caller";
    const recipientNumber = call.bPartyNo;
    const region = call.BPartyContact?.Region || "Unknown";
    const zone = call.BPartyContact?.Zone || "Unknown";
    
    // Determine status based on aDialStatus and bDialStatus
    let status = "failed";
    if (call.aDialStatus === "Connected" && call.bDialStatus === "Connected" && call.totalCallDuration > 0) {
      status = "completed";
    } else if (call.aDialStatus === "Connected" && (call.bDialStatus === "User Not Responding" || call.bDialStatus === "" || call.totalCallDuration === 0)) {
      status = "failed";
    } else if (call.aDialStatus === "Line Drop") {
      status = "failed";
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
      remarks: null, // Will be added when form details are provided
      rawData: call, // Store original data for details modal
      isManagerView: false
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
        connectedFilter: connectedFilter || "All Calls"
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
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
      const response = await axiosInstance.get(`/reports/manager-outgoing-calls/${managerId}/download`, {
        params: exportParams,
        responseType: 'blob', // Important: Handle binary data for file download
        timeout: 120000, // 2 minute timeout for large exports
      });

      console.log("📊 Export API response received");

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setExportProgress(100);

      // Create and trigger file download
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date and filters
      const dateStr = new Date().toISOString().split('T')[0];
      const agentFilter = selectedAgentId ? `_Agent${selectedAgentId}` : '_AllAgents';
      const statusFilter = connectedFilter ? `_${connectedFilter === 'true' ? 'Connected' : 'Failed'}` : '_AllCalls';
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
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Export timeout. The file might be too large. Try filtering data and export again.";
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
    endDate
  ]);

  // ====== FILTERING LOGIC ======
  
  // Enhanced filter function for both agent and manager views
  const filteredCalls = outgoingCalls.filter((call) => {
    // ====== SEARCH FILTER ======
    const matchesSearch = 
      call.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.recipientNumber.includes(searchTerm) ||
      call.callId.toString().includes(searchTerm) ||
      // MANAGER-SPECIFIC: Also search by agent name
      (isManager && call.agentName?.toLowerCase().includes(searchTerm.toLowerCase()));

    // ====== STATUS FILTER ======
    const matchesStatus = statusFilter === "all" || call.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
    setStatusFilter("all");
    setDateFilter("today");
    setSortBy("recent");
  };

  // Clear all agent-specific filters
  const clearAgentFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("today");
    setSortBy("recent");
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
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
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
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
                {isManager ? 'Team Outgoing Calls' : 'Outgoing Calls'}
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
                  ? 'Monitor and analyze outbound calls from all agents under your supervision' 
                  : 'Monitor and analyze all outbound calls to traders'
                }
              </p>
              {/* Manager-specific info */}
              {isManager && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Manager:</span> {userData?.EmployeeName} • 
                  <span className="font-medium"> Region:</span> {userData?.EmployeeRegion} • 
                  <span className="font-medium"> ID:</span> {userData?.EmployeeId}
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
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
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
                    <div className="text-base font-semibold text-blue-900">{stats?.total || 0}</div>
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
                    <div className="text-base font-semibold text-green-900">{stats?.completed || 0}</div>
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
                    <div className="text-base font-semibold text-red-900">{stats?.failed || 0}</div>
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
                    <div className="text-base font-semibold text-purple-900">{stats?.totalTalkTime || "0m"}</div>
                    <div className="text-xs text-purple-600">Total Talk Time</div>
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
                <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
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
                  >
                    <option value="">All Agents ({availableAgents.length})</option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
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
                    Call Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="duration">Duration</option>
                    <option value="name">Recipient Name</option>
                    <option value="agent">Agent Name</option>
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
                        ? 'bg-green-100 text-green-700 border-green-200 cursor-wait'
                        : 'bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500'
                    } ${(isExporting || isLoading) ? 'opacity-75' : ''}`}
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="recent">Most Recent</option>
                <option value="duration">Duration</option>
                <option value="name">Recipient Name</option>
              </select>

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
                  <span>Finalizing export... {Math.round(exportProgress)}%</span>
                ) : (
                  <span className="text-green-600 font-medium">✓ Export completed! Download starting...</span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Date Range: {startDate} to {endDate}
                {selectedAgentId && <div>Agent: {availableAgents.find(a => a.id == selectedAgentId)?.name || selectedAgentId}</div>}
                {connectedFilter && <div>Status: {connectedFilter === 'true' ? 'Connected Only' : 'Failed Only'}</div>}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Calls</h3>
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
                  <div key={i} className="flex items-center p-4 border border-gray-200 rounded-lg">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Outgoing Calls</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
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
                      Status & Outcome
                    </th>
                    {/* Manager gets enhanced actions */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isManager ? 'Actions & Forms' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCalls.map((call) => {
                    const { date, time } = formatDateTime(call.callDateTime);
                    
                    return (
                      <tr key={call.id} className="hover:bg-gray-50">
                        {/* Recipient Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{call.recipientName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {call.recipientNumber}
                              </div>
                              <div className="text-xs text-gray-400">ID: {call.callId}</div>
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
                                  {call.agentName || 'Unknown Agent'}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {call.agentPhone || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Region: {call.agentRegion || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Region Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{call.region}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {call.zone || 'N/A'}
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
                          <div className="mt-1 text-xs text-gray-500">
                            A: {call.aDialStatus} | B: {call.bDialStatus || 'N/A'}
                          </div>
                        </td>

                        {/* Status & Outcome */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <span className={getStatusBadge(call.status)}>
                              {getStatusIcon(call.status)}
                              <span className="ml-1 capitalize">{call.status}</span>
                            </span>
                            {call.callOutcome && (
                              <div className="flex items-center text-xs text-gray-600">
                                {getOutcomeIcon(call.callOutcome)}
                                <span className="ml-1 capitalize">{call.callOutcome.replace('-', ' ')}</span>
                              </div>
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
                            {call.rawData?.recordVoice && call.rawData.recordVoice !== "No Voice" && (
                              <a 
                                href={call.rawData.recordVoice}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-900 flex items-center"
                              >
                                <PlayIcon className="w-4 h-4 mr-1" />
                                Recording
                              </a>
                            )}
                            {/* Manager-specific: Show form details if available */}
                            {isManager && call.formDetails && (
                              <button 
                                onClick={() => handleViewDetails(call)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                Form Details
                              </button>
                            )}
                            {/* Show remarks if available */}
                            {call.remarks && (
                              <div className="text-xs text-gray-600 mt-1 max-w-xs">
                                <span className="font-medium">Remarks:</span> {call.remarks.length > 20 ? `${call.remarks.substring(0, 20)}...` : call.remarks}
                              </div>
                            )}
                            {(call.status === "failed") && (
                              <button className="text-orange-600 hover:text-orange-900 text-xs">
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
          {filteredCalls.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{Math.min(1, filteredCalls.length)}</span> to <span className="font-medium">{filteredCalls.length}</span> of{' '}
                    <span className="font-medium">{stats?.total || filteredCalls.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-600">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      Next
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call ID:</span>
                      <span className="font-medium">{selectedCall.rawData?.CallId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Number:</span>
                      <span className="font-medium">{selectedCall.rawData?.aPartyNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient Number:</span>
                      <span className="font-medium">{selectedCall.rawData?.bPartyNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{new Date(selectedCall.rawData?.callStartTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connected Time:</span>
                      <span className="font-medium">{selectedCall.rawData?.aPartyConnectedTime ? new Date(selectedCall.rawData.aPartyConnectedTime).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{new Date(selectedCall.rawData?.aPartyEndTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedCall.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Call Status Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.rawData?.aDialStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCall.rawData?.aDialStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.rawData?.bDialStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCall.rawData?.bDialStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCall.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Outcome:</span>
                      <span className="font-medium capitalize">{selectedCall.callOutcome?.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                {selectedCall.rawData?.BPartyContact && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact Name:</span>
                        <span className="font-medium">{selectedCall.rawData.BPartyContact.Contact_Name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact Number:</span>
                        <span className="font-medium">{selectedCall.rawData.BPartyContact.Contact_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedCall.rawData.BPartyContact.Type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">{selectedCall.rawData.BPartyContact.Region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium">{selectedCall.rawData.BPartyContact.Zone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCall.rawData.BPartyContact.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedCall.rawData.BPartyContact.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recording Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Recording</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recording Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.rawData?.recordVoice !== 'No Voice' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCall.rawData?.recordVoice !== 'No Voice' ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    {selectedCall.rawData?.recordVoice && selectedCall.rawData.recordVoice !== "No Voice" && (
                      <div>
                        <a 
                          href={selectedCall.rawData.recordVoice}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play Recording
                        </a>
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