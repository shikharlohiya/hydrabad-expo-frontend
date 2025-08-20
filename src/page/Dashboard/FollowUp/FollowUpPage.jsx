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
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";
import useDialer from "../../../hooks/useDialer";

const FollowUpPage = () => {
  const { userData } = useContext(UserContext);
  const {
    initiateCall,
    canInitiateCall,
    isCallActive,
    callStatus,
    setCurrentNumber,
  } = useDialer();

  // Role-based management: Check if user is manager (EmployeeRole = 2)
  const isManager = userData?.EmployeeRole === 2;
  const employeeId = userData?.EmployeePhone || userData?.EmployeeId;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [followUps, setFollowUps] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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

  // Fetch follow-ups from API
  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userRole = userData?.EmployeeRole;
      const managerId = userData?.EmployeeId;
      const agentNumber = userData?.EmployeePhone;

      console.log(`📋 Fetching follow-ups for role: ${userRole}`);

      // Calculate date range based on dateFilter
      let startDate, endDate;
      switch (dateFilter) {
        case "today":
          startDate = getTodayDate();
          endDate = getTodayDate();
          break;
        case "yesterday":
          startDate = getYesterdayDate();
          endDate = getYesterdayDate();
          break;
        case "week":
          startDate = getDateNDaysAgo(7);
          endDate = getTodayDate();
          break;
        case "month":
          startDate = getDateNDaysAgo(30);
          endDate = getTodayDate();
          break;
        case "all":
        default:
          // Don't set date filters for "all"
          startDate = null;
          endDate = null;
          break;
      }

      const params = {
        page: currentPage,
        limit: 10,
      };

      // Add date filters if set
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      // Add search parameter if provided
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      // Add status filter if provided
      if (statusFilter && statusFilter !== "") {
        params.status = statusFilter;
      }

      let response;
      if (userRole === 2) {
        if (!managerId) throw new Error("Manager ID not found.");
        response = await axiosInstance.get(
          `/calls/manager-follow-ups/${managerId}`,
          { params }
        );
      } else {
        if (userRole === 1) {
          if (!agentNumber) throw new Error("Agent number not found.");
          params.agentNumber = agentNumber;
        }
        response = await axiosInstance.get("/calls/follow-ups", {
          params,
        });
      }

      console.log("📋 Follow-ups API response:", response.data);

      if (response.data.success && response.data.data) {
        const {
          totalRecords,
          currentPage,
          totalPages,
          recordsPerPage,
          records,
        } = response.data.data;

        // Transform the data to match component needs
        const transformedFollowUps = (records || []).map((record) => {
          // Safely destructure with fallbacks
          const formDetail = record?.formDetail || {};
          const agent = record?.agent || {};
          const trader_master = record?.trader_master || {};

          return {
            id: formDetail.id,
            callId: formDetail.CallId,
            traderName:
              trader_master?.Trader_Name ||
              trader_master?.Trader_business_Name ||
              trader_master?.trader_name ||
              trader_master?.business_name ||
              "Unknown Trader",
            traderCode: trader_master?.Code || trader_master?.code || "N/A",
            traderContact:
              trader_master?.Contact_no ||
              trader_master?.contact_no ||
              trader_master?.phone ||
              formDetail.inquiryNumber ||
              "N/A",
            region:
              agent?.EmployeeRegion ||
              trader_master?.Region ||
              trader_master?.region ||
              "Unknown",
            agentName: agent?.EmployeeName || "Unknown Agent",
            agentPhone: agent?.EmployeePhone,
            callDateTime: formDetail.callDateTime,
            callType: formDetail.callType,
            supportType: formDetail.supportType?.supportName || "N/A",
            processType: formDetail.processType?.processName || "N/A",
            queryType: formDetail.queryType?.queryName || "N/A",
            remarks: formDetail.remarks || "No remarks",
            status: formDetail.status || "open",
            followUpDate: formDetail.followUpDate,
            inquiryNumber: formDetail.inquiryNumber,
            rawData: record, // Store original data for details modal
          };
        });

        setFollowUps(transformedFollowUps);

        // Calculate stats from the data
        const openCount = transformedFollowUps.filter(
          (f) => f.status === "open"
        ).length;
        const closedCount = transformedFollowUps.filter(
          (f) => f.status === "closed"
        ).length;

        setStats({
          total: totalRecords || 0,
          open: openCount,
          closed: closedCount,
          overdue: 0, // Can calculate based on followUpDate vs current date
        });

        setPagination({
          currentPage: currentPage || 1,
          totalPages: totalPages || 1,
          totalRecords: totalRecords || 0,
          recordsPerPage: recordsPerPage || 10,
        });
      } else {
        console.warn(
          "⚠️ Follow-ups API response structure unexpected:",
          response.data
        );
        setFollowUps([]);
        setStats({ total: 0, open: 0, closed: 0, overdue: 0 });
      }
    } catch (error) {
      console.error("❌ Error fetching follow-ups:", error);
      setError(error.message);
      setFollowUps([]);
      setStats({ total: 0, open: 0, closed: 0, overdue: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    if (userData) {
      fetchFollowUps();
    }
  }, [dateFilter, currentPage, statusFilter, debouncedSearchTerm, userData]);

  // Filter follow-ups (client-side for additional filtering)
  const filteredFollowUps = followUps.filter((followUp) => {
    const matchesSearch =
      followUp.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.traderContact.includes(searchTerm) ||
      followUp.callId.toString().includes(searchTerm) ||
      followUp.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Handle view details
  const handleViewDetails = (followUp) => {
    setSelectedFollowUp(followUp);
    setShowDetailsModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFollowUps();
  };

  // Handle call
  const handleCall = (phoneNumber, traderName) => {
    console.log("🔍 handleCall called with:", { phoneNumber, traderName });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Initiating call to ${phoneNumber} for ${traderName}`);

      // Set the current number first, then initiate call
      setCurrentNumber(phoneNumber);
      initiateCall(phoneNumber, { name: traderName });

      console.log("✅ Call initiated");
    } else {
      console.error("❌ No phone number provided for call");
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "open":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "closed":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime))) {
      return { date: "Invalid Date", time: "" };
    }
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const formatFollowUpDate = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime))) {
      return { text: "No date set", isOverdue: false };
    }
    const date = new Date(dateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    date.setHours(0, 0, 0, 0);

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: "Today", isOverdue: false };
    } else if (diffDays === 1) {
      return { text: "Tomorrow", isOverdue: false };
    } else {
      return { text: `In ${diffDays} days`, isOverdue: false };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 mr-2" />
                Follow-Up Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage pending follow-ups with traders
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
                <div
                  key={i}
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
                    <div className="text-xs text-blue-600">
                      Total Follow-ups
                    </div>
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
                      {stats?.open || 0}
                    </div>
                    <div className="text-xs text-green-600">Open</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-gray-900">
                      {stats?.closed || 0}
                    </div>
                    <div className="text-xs text-gray-600">Closed</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-red-900">
                      {stats?.overdue || 0}
                    </div>
                    <div className="text-xs text-red-600">Overdue</div>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search follow-ups..."
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
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {/* <option value="all">All Time</option> */}
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setDateFilter("today");
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Follow-ups
            </h3>
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

      {/* Follow-ups List */}
      {!error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
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
          ) : filteredFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Follow-ups
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter
                  ? "No follow-ups match your search criteria"
                  : "No follow-ups found for the selected period"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trader Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Support Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFollowUps.map((followUp) => {
                    const { date, time } = formatDateTime(
                      followUp.callDateTime
                    );
                    const followUpInfo = formatFollowUpDate(
                      followUp.followUpDate
                    );

                    return (
                      <tr key={followUp.id} className="hover:bg-gray-50">
                        {/* Trader Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {followUp.traderName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {followUp.traderContact}
                              </div>
                              <div className="text-xs text-gray-400">
                                Code: {followUp.traderCode}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Follow-up Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDateTime(followUp.followUpDate).date} at{" "}
                            {formatDateTime(followUp.followUpDate).time}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Follow-up:{" "}
                            <span
                              className={
                                followUpInfo.isOverdue
                                  ? "text-red-600 font-medium"
                                  : "text-gray-900"
                              }
                            >
                              {followUpInfo.text}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className={getStatusBadge(followUp.status)}>
                              {followUp.status.toUpperCase()}
                            </span>
                          </div>
                        </td>

                        {/* Support Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {followUp.supportType}
                          </div>
                          <div className="text-sm text-gray-500">
                            {followUp.processType}
                          </div>
                          <div className="text-xs text-gray-400">
                            {followUp.queryType}
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {followUp.remarks ? (
                              <div className="max-w-xs">
                                {followUp.remarks.length > 50 ? (
                                  <div>
                                    {expandedRemarks.has(followUp.id) ? (
                                      <div>
                                        <div className="whitespace-pre-wrap break-words mb-1">
                                          {followUp.remarks}
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(
                                              expandedRemarks
                                            );
                                            newExpanded.delete(followUp.id);
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
                                          {followUp.remarks.substring(0, 50)}...
                                        </span>
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(
                                              expandedRemarks
                                            );
                                            newExpanded.add(followUp.id);
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
                                  <span>{followUp.remarks}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                No remarks
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-sm font-medium sticky right-0 bg-white shadow-lg">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleViewDetails(followUp)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleCall(
                                  followUp.traderContact,
                                  followUp.traderName
                                )
                              }
                              className="text-green-600 hover:text-green-900 flex items-center"
                              disabled={!followUp.traderContact}
                            >
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              Call
                            </button>
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
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
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
      {showDetailsModal && selectedFollowUp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Follow-up Details - {selectedFollowUp.callId}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trader Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Trader Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {selectedFollowUp.traderName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">
                        {selectedFollowUp.traderContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">
                        {selectedFollowUp.traderCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">
                        {selectedFollowUp.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Call Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call ID:</span>
                      <span className="font-medium">
                        {selectedFollowUp.callId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Type:</span>
                      <span className="font-medium">
                        {selectedFollowUp.callType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Date:</span>
                      <span className="font-medium">
                        {formatDateTime(selectedFollowUp.callDateTime).date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Time:</span>
                      <span className="font-medium">
                        {formatDateTime(selectedFollowUp.callDateTime).time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Support Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support Type:</span>
                      <span className="font-medium">
                        {selectedFollowUp.supportType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Process Type:</span>
                      <span className="font-medium">
                        {selectedFollowUp.processType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Query Type:</span>
                      <span className="font-medium">
                        {selectedFollowUp.queryType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={getStatusBadge(selectedFollowUp.status)}>
                        {selectedFollowUp.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Agent Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Name:</span>
                      <span className="font-medium">
                        {selectedFollowUp.agentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Phone:</span>
                      <span className="font-medium">
                        {selectedFollowUp.agentPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">
                        {selectedFollowUp.region}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow-up Information */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow-up Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Follow-up Date:</span>
                    <span className="font-medium">
                      {new Date(selectedFollowUp.followUpDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">
                      {formatFollowUpDate(selectedFollowUp.followUpDate).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Remarks
                </h3>
                <div className="text-gray-900 whitespace-pre-wrap break-words">
                  {selectedFollowUp.remarks || "No remarks provided"}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() =>
                    handleCall(
                      selectedFollowUp.traderContact,
                      selectedFollowUp.traderName
                    )
                  }
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={!selectedFollowUp.traderContact}
                >
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Call Trader
                </button>
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

export default FollowUpPage;
