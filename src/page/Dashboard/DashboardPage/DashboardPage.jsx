import React, { useState, useEffect, useContext } from "react";
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import useDialer from "../../../hooks/useDialer";
import UserContext from "../../../context/UserContext";
import axiosInstance from "../../../library/axios";

// Configuration
const COMING_SOON_MODE = false; // Set to true to show coming soon page
const MOCK_MODE = false; // Set to false when API is ready

// Mock data for testing (remove when API is ready)
const mockCallStats = {
  totalCalls: 127,
  answeredCalls: 98,
  missedCalls: 29,
  avgCallDuration: "4:32",
  totalTalkTime: "8h 45m",
  pendingFollowUps: 12,
};

const mockRecentCalls = [
  {
    id: 1,
    number: "+91 98765 43210",
    customerName: "Rajesh Kumar",
    type: "incoming",
    status: "completed",
    duration: "5:23",
    callDateTime: "2024-12-20T10:30:00Z",
    category: "Technical Support",
    remarks: "Login issue resolved",
  },
  {
    id: 2,
    number: "+91 87654 32109",
    customerName: "Priya Sharma",
    type: "outgoing",
    status: "completed",
    duration: "3:45",
    callDateTime: "2024-12-20T08:15:00Z",
    category: "Sales Inquiry",
    remarks: "Account upgrade discussion",
  },
  {
    id: 3,
    number: "+91 76543 21098",
    customerName: null,
    type: "incoming",
    status: "missed",
    duration: "0:00",
    callDateTime: "2024-12-20T06:45:00Z",
    category: "General",
    remarks: null,
  },
  {
    id: 4,
    number: "+91 65432 10987",
    customerName: "Amit Patel",
    type: "outgoing",
    status: "completed",
    duration: "7:12",
    callDateTime: "2024-12-19T14:22:00Z",
    category: "Billing Issue",
    remarks: "Fee structure clarification",
  },
  {
    id: 5,
    number: "+91 54321 09876",
    customerName: "Sneha Reddy",
    type: "incoming",
    status: "completed",
    duration: "2:34",
    callDateTime: "2024-12-19T11:18:00Z",
    category: "Account Management",
    remarks: "Document verification completed",
  },
];

const mockFollowUps = [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    phoneNumber: "+91 98765 43210",
    followUpDate: "2024-12-21",
    priority: "High",
    issue: "Trading platform login issue",
    callId: "CALL001",
    status: "pending",
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    phoneNumber: "+91 87654 32109",
    followUpDate: "2024-12-22",
    priority: "Medium",
    issue: "Account verification documents",
    callId: "CALL002",
    status: "pending",
  },
  {
    id: 3,
    customerName: "Amit Patel",
    phoneNumber: "+91 65432 10987",
    followUpDate: "2024-12-23",
    priority: "Low",
    issue: "Fee structure inquiry",
    callId: "CALL003",
    status: "pending",
  },
];

const DashboardPage = () => {
  const { callHistory, formatDuration } = useDialer();
  const { userData } = useContext(UserContext);

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [callStats, setCallStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Functions
  const fetchCallStats = async (period = "today") => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockCallStats), 800);
      });
    }

    try {
      const response = await axiosInstance.get("/dashboard/call-stats", {
        params: {
          period,
          employeeId: userData?.EmployeeId,
        },
      });
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error fetching call stats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch call statistics"
      );
    }
  };

  const fetchRecentCalls = async (period = "today", search = "") => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredCalls = mockRecentCalls;
          if (search) {
            filteredCalls = mockRecentCalls.filter(
              (call) =>
                call.customerName
                  ?.toLowerCase()
                  .includes(search.toLowerCase()) ||
                call.number.includes(search)
            );
          }
          resolve(filteredCalls);
        }, 600);
      });
    }

    try {
      const response = await axiosInstance.get("/dashboard/recent-calls", {
        params: {
          period,
          search,
          employeeId: userData?.EmployeeId,
          limit: 10,
        },
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching recent calls:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch recent calls"
      );
    }
  };

  const fetchFollowUps = async () => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockFollowUps), 500);
      });
    }

    try {
      const response = await axiosInstance.get("/dashboard/follow-ups", {
        params: {
          employeeId: userData?.EmployeeId,
          status: "pending",
        },
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch follow-ups"
      );
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsData, callsData, followUpsData] = await Promise.all([
        fetchCallStats(selectedPeriod),
        fetchRecentCalls(selectedPeriod, searchTerm),
        fetchFollowUps(),
      ]);

      setCallStats(statsData);
      setRecentCalls(callsData);
      setFollowUps(followUpsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadDashboardData();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Utility functions
  const getCallTypeIcon = (type) => {
    return type === "incoming" ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "missed":
        return "text-red-600 bg-red-100";
      case "failed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRelativeTime = (dateTime) => {
    if (!dateTime) return "Unknown";

    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "1 day ago";
      if (diffInDays < 7) return `${diffInDays} days ago`;

      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  // Coming Soon Component - Overlay on actual dashboard
  if (COMING_SOON_MODE) {
    return (
      <div className="relative bg-gray-50 min-h-screen">
        {/* Mock Mode Indicator */}
        {MOCK_MODE && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <span className="font-medium">🧪 Demo Mode Active</span>
              <span className="text-sm">- Using sample data for testing</span>
            </div>
          </div>
        )}

        {/* Actual Dashboard Content */}
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PhoneIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Calls
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.totalCalls}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Answered</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.answeredCalls}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Missed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.missedCalls}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Duration
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.avgCallDuration}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Talk Time
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.totalTalkTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Follow-ups
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockCallStats.pendingFollowUps}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Calls */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Calls
                    </h2>
                    <div className="flex items-center space-x-3">
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        disabled
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] opacity-50"
                      >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                      <button
                        disabled
                        className="p-2 text-gray-400 hover:text-gray-600 opacity-50"
                      >
                        <FunnelIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-4 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search calls by name or number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] opacity-50"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockRecentCalls.map((call) => {
                        const CallIcon = getCallTypeIcon(call.type);
                        return (
                          <tr key={call.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-full ${
                                    call.type === "incoming"
                                      ? "bg-blue-100"
                                      : "bg-green-100"
                                  }`}
                                >
                                  <CallIcon
                                    className={`w-4 h-4 ${
                                      call.type === "incoming"
                                        ? "text-blue-600"
                                        : "text-green-600"
                                    }`}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {call.customerName || "Unknown Caller"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {call.number}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  call.status
                                )}`}
                              >
                                {call.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.duration}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {call.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatRelativeTime(call.callDateTime)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar - Pending Follow-ups */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pending Follow-ups
                    </h3>
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {mockFollowUps.map((followUp) => (
                      <div
                        key={followUp.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {followUp.customerName}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {followUp.phoneNumber}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {followUp.issue}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Due:{" "}
                              {new Date(
                                followUp.followUpDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              followUp.priority
                            )}`}
                          >
                            {followUp.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="text-center max-w-lg mx-auto p-8">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mx-auto flex items-center justify-center animate-pulse">
                <RocketLaunchIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>

            {/* Coming Soon Message */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Dashboard
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We're putting the finishing touches on your analytics dashboard.
              Real-time insights and reporting will be available soon!
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur border border-white/50 rounded-full px-4 py-2 shadow-lg mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                In Development
              </span>
              <WrenchScrewdriverIcon className="w-4 h-4 text-gray-500" />
            </div>

            {/* Expected Launch */}
            <div className="text-sm text-gray-500">
              Expected Launch:{" "}
              <span className="font-semibold text-blue-600">This Week</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          {/* Stats Cards Skeleton with Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow border border-gray-200 relative overflow-hidden"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton with Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 rounded relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-200 rounded relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add custom shimmer animation */}
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          {MOCK_MODE && (
            <p className="text-sm text-blue-600 mt-4">
              🧪 Running in demo mode
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mock Mode Indicator */}
      {MOCK_MODE && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-center space-x-2 text-yellow-800">
            <span className="font-medium">🧪 Demo Mode Active</span>
            <span className="text-sm">- Using sample data for testing</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.totalCalls || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Answered</p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.answeredCalls || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Missed</p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.missedCalls || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.avgCallDuration || "0:00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Talk Time
              </p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.totalTalkTime || "0h 0m"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Follow-ups</p>
              <p className="text-xl font-bold text-gray-900">
                {callStats?.pendingFollowUps || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Calls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Calls
                </h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCalls.length > 0 ? (
                    recentCalls.map((call) => {
                      const CallIcon = getCallTypeIcon(call.type);
                      return (
                        <tr key={call.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`p-2 rounded-full ${
                                  call.type === "incoming"
                                    ? "bg-blue-100"
                                    : "bg-green-100"
                                }`}
                              >
                                <CallIcon
                                  className={`w-4 h-4 ${
                                    call.type === "incoming"
                                      ? "text-blue-600"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {call.customerName || "Unknown Caller"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {call.number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                call.status
                              )}`}
                            >
                              {call.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {call.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatRelativeTime(call.callDateTime)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No calls found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Pending Follow-ups */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Follow-ups
                </h3>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {followUps.length > 0 ? (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {followUp.customerName}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {followUp.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {followUp.issue}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Due:{" "}
                            {new Date(
                              followUp.followUpDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            followUp.priority
                          )}`}
                        >
                          {followUp.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No pending follow-ups</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
