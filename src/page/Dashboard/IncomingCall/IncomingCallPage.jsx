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
  PhoneArrowDownLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";

const IncomingCallPage = () => {
  const { userData } = useContext(UserContext);
  
  // Role-based management: Check if user is manager (EmployeeRole = 2)
  const isManager = userData?.EmployeeRole === 2;
  const managerId = userData?.EmployeeId;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());

  // Manager-specific state
  const [selectedAgent, setSelectedAgent] = useState("");
  const [connectedFilter, setConnectedFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableAgents, setAvailableAgents] = useState([]);
  
  // Manager Excel Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);

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

  // Fetch incoming calls from API (Agent or Manager based)
  const fetchIncomingCalls = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      
      if (isManager) {
        // Manager API: /api/calls/employees-under-manager/{managerId}
        console.log("📞 Fetching incoming calls for manager:", managerId);
        
        const params = {
          page: currentPage,
          limit: 50,
        };
        
        // Add date filters if set
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedAgent) params.agentId = selectedAgent;
        if (connectedFilter) params.connected = connectedFilter === 'true';
        
        response = await axiosInstance.get(`/calls/employees-under-manager/${managerId}`, {
          params
        });
        
        console.log("📞 Manager incoming calls API response:", response.data);
        
        if (response.data.success && response.data.data) {
          const { stats, pagination, groupedRecords } = response.data.data;
          
          // Extract all agents for the dropdown
          const agents = groupedRecords.map(group => ({
            id: group.agentDetails.EmployeeId,
            name: group.agentDetails.EmployeeName,
            phone: group.agentDetails.EmployeePhone
          }));
          setAvailableAgents(agents);
          
          // Flatten calls from all agents
          const transformedCalls = [];
          groupedRecords.forEach((group) => {
            group.calls.forEach((call) => {
              const callerName = call.contactDetails?.Contact_Name || "Unknown Caller";
              const region = call.contactDetails?.Region || "Unknown";
              const zone = call.contactDetails?.Zone || "Unknown";
              const agentName = group.agentDetails?.EmployeeName || "Unknown Agent";
              
              // Determine status based on ogCallStatus and duration
              let status = "missed";
              if (call.ogCallStatus === "Connected" && call.totalCallDuration > 0) {
                status = "answered";
              }
              
              transformedCalls.push({
                id: call.CallId,
                callId: call.CallId,
                callerName: callerName,
                callerNumber: call.callerNumber,
                region: region,
                zone: zone,
                callDateTime: call.callStartTime,
                duration: formatDurationFromSeconds(call.totalCallDuration),
                status: status,
                agentName: agentName,
                agentPhone: group.agentDetails?.EmployeePhone,
                agentId: group.agentDetails?.EmployeeId,
                remarks: call.formDetails?.remarks || null,
                rawData: call, // Store original data for details modal
                agentDetails: group.agentDetails, // Store agent details
              });
            });
          });

          setIncomingCalls(transformedCalls);
          setStats({
            total: stats.totalCalls || 0,
            missed: stats.missedCalls || 0,
            answered: stats.connectedCalls || 0,
            totalTalkTime: formatTotalTalkTime(stats.totalTalkTime || 0)
          });
          setPagination(pagination);
        }
      } else {
        // Agent API: /calls/incoming
        const agentNumber = userData?.EmployeePhone;
        if (!agentNumber) {
          throw new Error("Agent phone number not found. Please login again.");
        }

        // Static date range - as requested
        const staticStartDate = "2025-08-06";
        const staticEndDate = "2025-08-07";

        console.log("📞 Fetching incoming calls for agent:", agentNumber);
        
        response = await axiosInstance.get("/calls/incoming", {
          params: {
            page: currentPage,
            limit: 10,
            startDate: staticStartDate,
            endDate: staticEndDate,
            agentNumber: agentNumber,
          },
        });

        console.log("📞 Agent incoming calls API response:", response.data);

        if (response.data.success && response.data.data) {
          const { stats, pagination, records } = response.data.data;
          
          // Transform the data to match component structure
          const transformedCalls = records.map((call) => {
            const callerName = call.contactDetails?.Contact_Name || "Unknown Caller";
            const region = call.contactDetails?.Region || "Unknown";
            const zone = call.contactDetails?.Zone || "Unknown";
            const agentName = call.agentDetails?.EmployeeName || "Unknown Agent";
            
            // Determine status based on ogCallStatus and duration
            let status = "missed";
            if (call.ogCallStatus === "Connected" && call.totalCallDuration > 0) {
              status = "answered";
            }
            
            return {
              id: call.CallId,
              callId: call.CallId,
              callerName: callerName,
              callerNumber: call.callerNumber,
              region: region,
              zone: zone,
              callDateTime: call.callStartTime,
              duration: formatDurationFromSeconds(call.totalCallDuration),
              status: status,
              agentName: agentName,
              remarks: call.formDetails?.remarks || null,
              rawData: call, // Store original data for details modal
            };
          });

          setIncomingCalls(transformedCalls);
          setStats({
            total: stats.totalCalls || 0,
            missed: stats.missedCalls || 0,
            answered: (stats.totalCalls || 0) - (stats.missedCalls || 0),
            totalTalkTime: formatTotalTalkTime(stats.totalTalkTime || 0)
          });
          setPagination(pagination);
        }
      }
      
      if (!response.data.success || !response.data.data) {
        console.warn("⚠️ API response structure unexpected:", response.data);
        setIncomingCalls([]);
        setStats({ total: 0, missed: 0, answered: 0, totalTalkTime: "0m" });
      }
    } catch (error) {
      console.error("❌ Error fetching incoming calls:", error);
      setError(error.message);
      setIncomingCalls([]);
      setStats({ total: 0, missed: 0, answered: 0, totalTalkTime: "0m" });
    } finally {
      setIsLoading(false);
    }
  };

  // Manager Excel Export function
  const handleExcelExport = async () => {
    if (!isManager) {
      console.error("❌ Excel export is only available for managers");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportError(null);

      console.log("📊 Starting Excel export for manager:", managerId);

      // Prepare export parameters
      const exportParams = {};
      if (startDate) exportParams.startDate = startDate;
      if (endDate) exportParams.endDate = endDate;
      if (selectedAgent) exportParams.agentId = selectedAgent;
      if (connectedFilter) exportParams.connected = connectedFilter === 'true';

      console.log("📊 Export parameters:", exportParams);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Make API call for Excel export
      const response = await axiosInstance.get(
        `/reports/manager-incoming-calls/${managerId}/download`,
        {
          params: exportParams,
          responseType: 'blob',
          timeout: 120000, // 2 minutes timeout
        }
      );

      // Clear progress interval and complete
      clearInterval(progressInterval);
      setExportProgress(100);

      // Create blob and download file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      link.download = `incoming-calls-report-${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Excel export completed successfully");
      
      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error("❌ Excel export failed:", error);
      
      let errorMessage = "Export failed. Please try again.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Export timed out. Please try with a smaller date range.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to export data.";
      } else if (error.response?.status === 404) {
        errorMessage = "Export service not available. Please contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setExportError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setExportError(null);
        setIsExporting(false);
        setExportProgress(0);
      }, 5000);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    if (isManager || userData?.EmployeePhone) {
      fetchIncomingCalls();
    }
  }, [dateFilter, currentPage, userData, selectedAgent, connectedFilter, startDate, endDate]);

  // Filter calls based on search and status
  const filteredCalls = incomingCalls.filter((call) => {
    const matchesSearch = 
      call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.callerNumber.includes(searchTerm) ||
      call.callId.toString().includes(searchTerm) ||
      (isManager && call.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (isManager && call.agentPhone?.includes(searchTerm));

    const matchesStatus = statusFilter === "all" || call.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle view details
  const handleViewDetails = (call) => {
    setSelectedCall(call);
    setShowDetailsModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchIncomingCalls();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "answered":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case "missed":
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "answered":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "missed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
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
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <PhoneArrowDownLeftIcon className="w-5 h-5 text-green-600 mr-2" />
                {isManager ? 'Incoming Calls - Manager View' : 'Incoming Calls'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isManager 
                  ? 'Monitor and analyze incoming calls across your team' 
                  : 'Track and manage all incoming calls from traders'
                }
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                    <div className="text-base font-semibold text-green-900">{stats?.answered || 0}</div>
                    <div className="text-xs text-green-600">Answered</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-red-900">{stats?.missed || 0}</div>
                    <div className="text-xs text-red-600">Missed</div>
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

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          {isManager ? (
            /* Manager Filters */
            <div className="space-y-4">
              {/* Manager Filter Row 1: Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Agent</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">All Agents</option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Connection Status</label>
                  <select
                    value={connectedFilter}
                    onChange={(e) => setConnectedFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">All Calls</option>
                    <option value="true">Connected Only</option>
                    <option value="false">Missed Only</option>
                  </select>
                </div>
              </div>
              
              {/* Manager Filter Row 2: Search and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search calls, agents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="answered">Answered</option>
                  <option value="missed">Missed</option>
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSelectedAgent("");
                    setConnectedFilter("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
                
                {/* Excel Export Button for Manager */}
                <button
                  onClick={handleExcelExport}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                      Exporting... {exportProgress}%
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Export Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Agent Filters */
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="answered">Answered</option>
                <option value="missed">Missed</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="duration">Duration</option>
                <option value="name">Caller Name</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("today");
                  setSortBy("recent");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Calls</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
              <PhoneArrowDownLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Incoming Calls</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "No calls match your search criteria" 
                  : "No incoming calls found for the selected period"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caller Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region Info
                    </th>
                    {isManager && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent Info
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCalls.map((call) => {
                    const { date, time } = formatDateTime(call.callDateTime);
                    
                    return (
                      <tr key={call.id} className="hover:bg-gray-50">
                        {/* Caller Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{call.callerName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {call.callerNumber}
                              </div>
                              <div className="text-xs text-gray-400">ID: {call.callId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Region Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{call.region}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {call.zone || 'N/A'}
                          </div>
                        </td>

                        {/* Agent Info (Manager Only) */}
                        {isManager && (
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{call.agentName}</div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {call.agentPhone}
                                </div>
                                <div className="text-xs text-gray-400">ID: {call.agentId}</div>
                              </div>
                            </div>
                          </td>
                        )}

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
                          {call.remarks && (
                            <div className="mt-1 text-xs text-gray-500 max-w-xs">
                              {call.remarks.length > 15 ? (
                                <div>
                                  {expandedRemarks.has(call.id) ? (
                                    <div>
                                      <div className="whitespace-pre-wrap break-words mb-1">
                                        {call.remarks}
                                      </div>
                                      <button
                                        onClick={() => {
                                          const newExpanded = new Set(expandedRemarks);
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
                                      <span>{call.remarks.substring(0, 15)}...</span>
                                      <button
                                        onClick={() => {
                                          const newExpanded = new Set(expandedRemarks);
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
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <span className={getStatusBadge(call.status)}>
                              {getStatusIcon(call.status)}
                              <span className="ml-1 capitalize">{call.status}</span>
                            </span>
                            {call.agentName && (
                              <div className="text-xs text-gray-500">
                                by {call.agentName}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button 
                              onClick={() => handleViewDetails(call)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                            {call.rawData?.voiceRecording && (
                              <a 
                                href={call.rawData.voiceRecording}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-900 flex items-center"
                              >
                                <PlayIcon className="w-4 h-4 mr-1" />
                                Recording
                              </a>
                            )}
                            {call.status === "missed" && (
                              <button className="text-green-600 hover:text-green-900">
                                Call Back
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
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
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
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
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
                      <span className="text-gray-600">Caller Number:</span>
                      <span className="font-medium">{selectedCall.rawData?.callerNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Number:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{new Date(selectedCall.rawData?.callStartTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{new Date(selectedCall.rawData?.callEndTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedCall.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCall.rawData?.ogCallStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Name:</span>
                      <span className="font-medium">{selectedCall.rawData?.contactDetails?.Contact_Name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Number:</span>
                      <span className="font-medium">{selectedCall.rawData?.contactDetails?.Contact_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedCall.rawData?.contactDetails?.Type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{selectedCall.rawData?.contactDetails?.Region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{selectedCall.rawData?.contactDetails?.Zone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCall.rawData?.contactDetails?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCall.rawData?.contactDetails?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentDetails?.EmployeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentDetails?.EmployeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentDetails?.EmployeePhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentDetails?.EmployeeMailId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{selectedCall.rawData?.agentDetails?.EmployeeRegion}</span>
                    </div>
                  </div>
                </div>

                {/* Form Details */}
                {selectedCall.rawData?.formDetails && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Form ID:</span>
                        <span className="font-medium text-xs">{selectedCall.rawData.formDetails.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call Type:</span>
                        <span className="font-medium">{selectedCall.rawData.formDetails.callType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Support Type ID:</span>
                        <span className="font-medium">{selectedCall.rawData.formDetails.supportTypeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Process Type ID:</span>
                        <span className="font-medium">{selectedCall.rawData.formDetails.processTypeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Query Type ID:</span>
                        <span className="font-medium">{selectedCall.rawData.formDetails.queryTypeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCall.rawData.formDetails.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedCall.rawData.formDetails.status}
                        </span>
                      </div>
                      {selectedCall.rawData.formDetails.remarks && (
                        <div>
                          <span className="text-gray-600 block mb-1">Remarks:</span>
                          <div className="bg-white p-3 rounded border text-sm">
                            {selectedCall.rawData.formDetails.remarks}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-xs">{new Date(selectedCall.rawData.formDetails.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Recording */}
              {selectedCall.rawData?.voiceRecording && (
                <div className="mt-6 bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Recording</h3>
                  <a 
                    href={selectedCall.rawData.voiceRecording}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Play Recording
                  </a>
                </div>
              )}

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
      
      {/* Export Progress Modal (Manager Only) */}
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center">
                <ArrowDownTrayIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Exporting Incoming Calls Report
                </h3>
                <p className="text-gray-600 mb-4">
                  Please wait while we generate your Excel report...
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{exportProgress}% Complete</p>
                
                {exportProgress === 100 && (
                  <div className="mt-4 flex items-center justify-center text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Download started!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Error Notification */}
      {exportError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start">
              <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Export Failed</h4>
                <p className="text-sm text-red-600 mt-1">{exportError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingCallPage;