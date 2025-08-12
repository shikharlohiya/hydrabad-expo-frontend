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
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import useDialer from "../../../hooks/useDialer";
import UserContext from "../../../context/UserContext";
import axiosInstance from "../../../library/axios";

// Configuration
const COMING_SOON_MODE = false; // Set to true to show coming soon page
const MOCK_MODE = false; // Set to false when API is ready - DISABLED for recent calls API integration
const SHOW_FLAG_BACKGROUND = false; // Set to true to show Indian flag animation background

// Mock data for testing (remove when API is ready)
const mockCallStats = {
  inbound: {
    totalCalls: 7,
    answeredCalls: 6,
    missedCalls: 1,
    totalTalkTime: 192,
    avgCallDuration: 27
  },
  outbound: {
    totalCalls: 9,
    answeredCalls: 7,
    missedCalls: 2,
    totalTalkTime: 104,
    avgCallDuration: 11
  },
  overall: {
    totalCalls: 16,
    answeredCalls: 13,
    missedCalls: 3,
    totalTalkTime: 296,
    avgCallDuration: 18
  }
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
  const { callHistory, formatDuration, initiateCall, canInitiateCall, isCallActive, callStatus, setCurrentNumber } = useDialer();
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get yesterday's date in YYYY-MM-DD format
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Helper function to get date N days ago in YYYY-MM-DD format
  const getDateNDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [callStats, setCallStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Enhanced Date Filter State - Dynamic dates based on current date
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(getTodayDate());
  const [customEndDate, setCustomEndDate] = useState(getTodayDate());
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Function to get date range based on filter selection
  const getDateRange = () => {
    const today = getTodayDate();
    
    switch (dateFilter) {
      case "today":
        return { startDate: today, endDate: today };
      case "yesterday":
        const yesterday = getYesterdayDate();
        return { startDate: yesterday, endDate: yesterday };
      case "week":
        return { startDate: getDateNDaysAgo(7), endDate: today };
      case "custom":
        return { startDate: customStartDate, endDate: customEndDate };
      default:
        return { startDate: today, endDate: today };
    }
  };

  // Function to validate custom date range (max 30 days)
  const validateCustomDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Please select valid dates.");
      return false;
    }
    
    if (start > end) {
      alert("Start date cannot be later than end date.");
      // Reset end date to start date
      setCustomEndDate(startDate);
      return false;
    }
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      alert("Custom date range cannot exceed 30 days. Please select a shorter range.");
      // Reset to a valid 30-day range
      const maxEndDate = new Date(start);
      maxEndDate.setDate(maxEndDate.getDate() + 30);
      setCustomEndDate(maxEndDate.toISOString().split('T')[0]);
      return false;
    }
    
    return true;
  };

  // Helper function to format duration from seconds to MM:SS or HH:MM format
  const formatStatsDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  // API Functions
  const fetchCallStats = async () => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockCallStats), 800);
      });
    }

    try {
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const agentNumber = userData?.EmployeePhone;
      const { startDate, endDate } = getDateRange();

      console.log("📊 Fetching call stats with date range:", { startDate, endDate, dateFilter });

      // Check if user is a manager (EmployeeRole = 2) or agent (EmployeeRole = 1)
      if (userRole === 2) {
        // Manager - fetch combined statistics with date range
        if (!employeeId) {
          throw new Error("Manager ID not found. Please login again.");
        }

        console.log("📊 Fetching manager call stats for:", employeeId);
        
        const response = await axiosInstance.get(`/calls/manager-call-stats/${employeeId}`, {
          params: {
            startDate: startDate,
            endDate: endDate,
          },
        });
        console.log("📊 Manager stats API response:", response.data);

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          console.warn("⚠️ Manager stats API response structure unexpected:", response.data);
          return mockCallStats; // Fallback to mock data
        }
      } else {
        // Agent - fetch individual agent statistics with date range
        if (!agentNumber) {
          throw new Error("Agent phone number not found. Please login again.");
        }

        console.log("📊 Fetching call stats for agent:", agentNumber, "Date range:", startDate, "to", endDate);
        
        const response = await axiosInstance.get("/calls/stats", {
          params: {
            startDate: startDate,
            endDate: endDate,
            agentNumber: agentNumber,
          },
        });

        console.log("📊 Agent stats API response:", response.data);

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          console.warn("⚠️ Agent stats API response structure unexpected:", response.data);
          return mockCallStats; // Fallback to mock data
        }
      }
    } catch (error) {
      console.error("❌ Error fetching call stats:", error);
      console.log("📊 Falling back to mock stats data");
      return mockCallStats; // Fallback to mock data instead of throwing error
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
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const agentNumber = userData?.EmployeePhone;
      const { startDate, endDate } = getDateRange();

      console.log("📞 Fetching recent calls with date range:", { startDate, endDate, dateFilter });

      // Determine API call based on user role
      const response = userRole === 2 
        ? await (async () => {
            if (!employeeId) {
              throw new Error("Manager ID not found. Please login again.");
            }
            console.log("📞 Fetching recent calls for manager:", employeeId);
            return await axiosInstance.get("/calls/recent-calls", {
              params: {
                managerId: employeeId,
                startDate: startDate,
                endDate: endDate,
                ...(search && { search }),
              },
            });
          })()
        : await (async () => {
            if (!agentNumber) {
              throw new Error("Agent phone number not found. Please login again.");
            }
            console.log("📞 Fetching recent calls for agent:", agentNumber);
            return await axiosInstance.get("/calls/recent-calls", {
              params: {
                agentNumber: agentNumber,
                startDate: startDate,
                endDate: endDate,
                ...(search && { search }),
              },
            });
          })();

      console.log(`📞 ${userRole === 2 ? 'Manager' : 'Agent'} recent calls API response:`, response.data);

      if (response.data.success && response.data.data?.records) {
        // Transform the API data to match our component structure
        const transformedCalls = response.data.data.records.map((call) => {
          // Calculate duration in MM:SS format
          const formatDuration = (seconds) => {
            if (!seconds || seconds === 0) return "0:00";
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
          };

          // Determine call status based on duration and type
          const getCallStatus = (call) => {
            if (call.duration > 0) return "completed";
            if (call.type === "inbound" && call.duration === 0) return "missed";
            if (call.type === "outbound" && call.duration === 0) return "failed";
            return "completed";
          };

          // Get trader name from trader_master data (updated to use new API structure)
          const customerName = call.trader_master?.Trader_Name || 
                              call.trader_master?.Trader_business_Name ||
                              call.contact?.Contact_Name || 
                              call.contact?.Trader_Name || 
                              call.contact?.trader_name || 
                              call.contact?.name || 
                              null;

          // Extract region information from trader_master (using new API structure)
          const region = call.trader_master?.Region || 
                        call.trader_master?.Zone || 
                        call.contact?.Region || 
                        call.contact?.Zone || 
                        call.contact?.zone || 
                        "Unknown";

          // Get status from API (using the status field or derive from duration)
          const callStatus = call.status || getCallStatus(call);

          // Get remarks from formDetail
          const remarks = call.formDetail?.remarks || null;

          // Get agent information (for manager view)
          const agentName = call.employee?.EmployeeName || call.agent?.name || null;
          const agentId = call.employee?.EmployeeId || call.agent?.id || null;

          return {
            id: call.CallId || `call_${Date.now()}_${Math.random()}`,
            number: call.number || "Unknown",
            customerName: customerName,
            type: call.type === "inbound" ? "incoming" : "outgoing",
            status: callStatus,
            duration: formatDuration(call.duration),
            callDateTime: call.startTime || new Date().toISOString(),
            callStartTime: call.startTime || new Date().toISOString(),
            region: region,
            remarks: remarks,
            // Agent information (for manager view)
            agentName: agentName,
            agentId: agentId,
            // Additional data for future use
            callId: call.CallId,
            agentNumber: call.agentNumber,
            endTime: call.endTime,
            contactData: call.contact,
            formDetail: call.formDetail,
            // Store original call data for debugging
            originalCallData: call,
          };
        });

        // Apply client-side search filtering if needed
        let filteredCalls = transformedCalls;
        if (search) {
          filteredCalls = transformedCalls.filter(
            (call) =>
              call.customerName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              call.number.includes(search) ||
              call.callId.toString().includes(search) ||
              // For managers, also search by agent name
              (userData?.EmployeeRole === 2 && call.agentName?.toLowerCase().includes(search.toLowerCase()))
          );
        }

        console.log(`📞 Successfully transformed ${filteredCalls.length} calls:`, filteredCalls);
        return filteredCalls;
      } else {
        console.warn("⚠️ API response structure unexpected:", response.data);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching recent calls:", error);
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
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const { startDate, endDate } = getDateRange();

      if (!employeeId) {
        throw new Error("Employee ID not found. Please login again.");
      }

      console.log(`📋 Fetching follow-ups for ${userRole === 2 ? 'manager' : 'agent'}:`, employeeId, "Date range:", startDate, "to", endDate);
      
      const response = await axiosInstance.get("/calls/follow-ups", {
        params: {
          agentNumber: employeeId, // For managers, this will fetch follow-ups for all their agents
          startDate: startDate,
          endDate: endDate,
        },
      });

      console.log(`📋 ${userRole === 2 ? 'Manager' : 'Agent'} follow-ups API response:`, response.data);

      if (response.data.success && response.data.data) {
        // Transform the API data to match component structure
        const transformedFollowUps = response.data.data.records.map((followUp) => {
          // Determine priority based on follow-up date
          const followUpDate = new Date(followUp.followUpDate);
          const today = new Date();
          const diffDays = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24));
          
          let priority = "Normal";
          if (diffDays < 0) {
            priority = "High"; // Overdue
          } else if (diffDays <= 1) {
            priority = "Medium"; // Due today or tomorrow
          }

          return {
            id: followUp.id,
            customerName: followUp.employee?.EmployeeName || "Unknown",
            phoneNumber: followUp.inquiryNumber,
            followUpDate: followUp.followUpDate,
            priority: priority,
            issue: followUp.remarks || "No remarks provided",
            callId: followUp.CallId,
            status: followUp.status,
            callType: followUp.callType,
            employeeData: followUp.employee,
            rawData: followUp, // Store original data
          };
        });

        return transformedFollowUps;
      } else {
        console.warn("⚠️ Follow-ups API response structure unexpected:", response.data);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching follow-ups:", error);
      console.log("📋 Falling back to mock follow-ups data");
      return mockFollowUps; // Fallback to mock data instead of throwing error
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsData, callsData, followUpsData] = await Promise.all([
        fetchCallStats(),
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
  }, [selectedPeriod, dateFilter, customStartDate, customEndDate]);

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

  // Handle call button click
  const handleCall = (phoneNumber, traderName) => {
    console.log("🔍 handleCall called with:", { phoneNumber, traderName });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Initiating call to ${phoneNumber} for ${traderName}`);
      console.log("📋 Contact info being passed:", { name: traderName });
      
      // Set the current number first, then initiate call
      setCurrentNumber(phoneNumber);
      initiateCall(phoneNumber, { name: traderName });
      
      console.log("✅ Call initiated - form should open when call connects");
    } else {
      console.error("❌ No phone number provided");
    }
  };

  // Handle view detail button click
  const handleViewDetail = (call) => {
    console.log("📋 Opening detail modal for call:", call);
    console.log("📋 Current modal state:", { isDetailModalOpen, selectedCallDetail });
    setSelectedCallDetail(call);
    setIsDetailModalOpen(true);
    console.log("📋 Modal should be opening now...");
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCallDetail(null);
  };

  // Coming Soon Component - Overlay on actual dashboard
  if (COMING_SOON_MODE) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Dashboard features are currently under development.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          {/* Compact Stats Skeleton */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-r border-gray-200 pr-4 last:border-r-0 last:pr-0">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[...Array(5)].map((_, j) => (
                        <div key={j}>
                          <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded w-10 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
      {/* Dashboard Header */}
      <div className="mb-4">
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
          {/* Animated Indian Flag Background - Toggle with SHOW_FLAG_BACKGROUND */}
          {SHOW_FLAG_BACKGROUND && (
            <div className="absolute inset-0 opacity-40">
            {/* Saffron stripe with realistic waving */}
            <div className="relative h-1/3 overflow-hidden">
              <div className="flag-saffron-wave absolute inset-0"></div>
              <div className="flag-saffron-glow absolute inset-0"></div>
              <div className="flag-saffron-shimmer absolute inset-0"></div>
            </div>
            
            {/* White stripe with dynamic effects */}
            <div className="relative h-1/3 bg-white overflow-hidden">
              <div className="flag-white-wave absolute inset-0"></div>
              <div className="flag-white-glow absolute inset-0"></div>
              
              {/* Enhanced Ashoka Chakra with spokes */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                <div className="chakra-enhanced">
                  <div className="chakra-center"></div>
                  <div className="chakra-spokes"></div>
                </div>
              </div>
            </div>
            
            {/* Green stripe with realistic waving */}
            <div className="relative h-1/3 overflow-hidden">
              <div className="flag-green-wave absolute inset-0"></div>
              <div className="flag-green-glow absolute inset-0"></div>
              <div className="flag-green-shimmer absolute inset-0"></div>
            </div>
            
            {/* Patriotic sparkles */}
            <div className="sparkle-container absolute inset-0">
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
              <div className="sparkle sparkle-4"></div>
              <div className="sparkle sparkle-5"></div>
            </div>
          </div>
          )}
          
          {/* Enhanced Content with Better Visibility */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg tracking-wide">
                {userData?.EmployeeRole === 2 ? '🏛️ Manager Dashboard' : '🎯 Agent Dashboard'}
              </h1>
              {userData?.EmployeeRole === 2 && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Manager View
                </span>
              )}
            </div>
            <div className="text-right bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md rounded-xl px-5 py-3 shadow-xl border border-white/50">
              <p className="text-sm text-gray-600 font-semibold">🙏 Welcome back,</p>
              <p className="text-xl font-bold text-gray-900 drop-shadow-md">{userData?.EmployeeName}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">
                <span className="inline-flex items-center">
                  {userData?.EmployeeRole === 2 ? '👨‍💼 Manager' : '👨‍💻 Agent'} • 📍 {userData?.EmployeeRegion}
                </span>
              </p>
            </div>
          </div>
          
          {/* Amazing CSS Animations - Only when flag background is enabled */}
          {SHOW_FLAG_BACKGROUND && (
          <style jsx>{`
            /* Realistic Flag Waving Animation */
            @keyframes flagWave {
              0% { 
                transform: translateX(0px) translateY(0px) rotate(0deg);
                clip-path: polygon(0% 0%, 100% 0%, 95% 50%, 100% 100%, 0% 100%, 5% 50%);
              }
              25% { 
                transform: translateX(2px) translateY(-1px) rotate(0.5deg);
                clip-path: polygon(0% 0%, 100% 0%, 98% 30%, 95% 70%, 100% 100%, 0% 100%, 2% 70%, 5% 30%);
              }
              50% { 
                transform: translateX(0px) translateY(1px) rotate(0deg);
                clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 95% 50%, 100% 100%, 0% 100%, 0% 50%, 5% 50%);
              }
              75% { 
                transform: translateX(-2px) translateY(-1px) rotate(-0.5deg);
                clip-path: polygon(0% 0%, 100% 0%, 95% 70%, 98% 30%, 100% 100%, 0% 100%, 5% 30%, 2% 70%);
              }
              100% { 
                transform: translateX(0px) translateY(0px) rotate(0deg);
                clip-path: polygon(0% 0%, 100% 0%, 95% 50%, 100% 100%, 0% 100%, 5% 50%);
              }
            }
            
            @keyframes glowPulse {
              0%, 100% { opacity: 0.3; filter: brightness(1); }
              50% { opacity: 0.7; filter: brightness(1.2); }
            }
            
            @keyframes shimmerMove {
              0% { transform: translateX(-200%) skewX(-15deg); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
            }
            
            @keyframes chakraRotate {
              0% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.1); }
              100% { transform: rotate(360deg) scale(1); }
            }
            
            @keyframes sparkleFloat {
              0%, 100% { transform: translateY(0px) scale(0.8); opacity: 0.4; }
              50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
            }
            
            /* Saffron Stripe Effects */
            .flag-saffron-wave {
              background: linear-gradient(135deg, 
                #ff9933 0%, 
                #ff7700 30%, 
                #ff9933 60%, 
                #ffaa44 100%
              );
              animation: flagWave 4s ease-in-out infinite;
            }
            
            .flag-saffron-glow {
              background: radial-gradient(circle at 30% 50%, 
                rgba(255, 153, 51, 0.8) 0%, 
                transparent 70%
              );
              animation: glowPulse 3s ease-in-out infinite;
            }
            
            .flag-saffron-shimmer {
              background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.6) 50%, 
                transparent 100%
              );
              animation: shimmerMove 3s ease-in-out infinite;
            }
            
            /* White Stripe Effects */
            .flag-white-wave {
              background: linear-gradient(135deg, 
                #ffffff 0%, 
                #f8f9ff 50%, 
                #ffffff 100%
              );
              animation: flagWave 4s ease-in-out infinite 0.5s;
            }
            
            .flag-white-glow {
              background: radial-gradient(circle at 70% 50%, 
                rgba(255, 255, 255, 0.9) 0%, 
                transparent 70%
              );
              animation: glowPulse 3s ease-in-out infinite 1s;
            }
            
            /* Green Stripe Effects */
            .flag-green-wave {
              background: linear-gradient(135deg, 
                #138808 0%, 
                #228B22 30%, 
                #138808 60%, 
                #32CD32 100%
              );
              animation: flagWave 4s ease-in-out infinite 1s;
            }
            
            .flag-green-glow {
              background: radial-gradient(circle at 30% 50%, 
                rgba(19, 136, 8, 0.8) 0%, 
                transparent 70%
              );
              animation: glowPulse 3s ease-in-out infinite 2s;
            }
            
            .flag-green-shimmer {
              background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.5) 50%, 
                transparent 100%
              );
              animation: shimmerMove 3s ease-in-out infinite 1.5s;
            }
            
            /* Enhanced Chakra */
            .chakra-enhanced {
              width: 100%;
              height: 100%;
              position: relative;
              animation: chakraRotate 8s linear infinite;
            }
            
            .chakra-center {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 20px;
              height: 20px;
              border: 3px solid #000080;
              border-radius: 50%;
              transform: translate(-50%, -50%);
              background: radial-gradient(circle, #ffffff 30%, #000080 70%);
            }
            
            .chakra-spokes {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 2px;
              height: 14px;
              background: #000080;
              transform: translate(-50%, -50%);
              box-shadow: 
                0 0 0 0 #000080,
                0 0 0 0 rotate(15deg) #000080,
                0 0 0 0 rotate(30deg) #000080,
                0 0 0 0 rotate(45deg) #000080,
                0 0 0 0 rotate(60deg) #000080,
                0 0 0 0 rotate(75deg) #000080,
                0 0 0 0 rotate(90deg) #000080,
                0 0 0 0 rotate(105deg) #000080,
                0 0 0 0 rotate(120deg) #000080,
                0 0 0 0 rotate(135deg) #000080,
                0 0 0 0 rotate(150deg) #000080,
                0 0 0 0 rotate(165deg) #000080;
            }
            
            /* Patriotic Sparkles */
            .sparkle {
              position: absolute;
              width: 4px;
              height: 4px;
              background: linear-gradient(45deg, #ff9933, #ffffff, #138808);
              border-radius: 50%;
              opacity: 0.6;
            }
            
            .sparkle-1 { top: 20%; left: 15%; animation: sparkleFloat 2s ease-in-out infinite; }
            .sparkle-2 { top: 60%; left: 85%; animation: sparkleFloat 2.5s ease-in-out infinite 0.5s; }
            .sparkle-3 { top: 30%; left: 75%; animation: sparkleFloat 3s ease-in-out infinite 1s; }
            .sparkle-4 { top: 80%; left: 25%; animation: sparkleFloat 2.2s ease-in-out infinite 1.5s; }
            .sparkle-5 { top: 45%; left: 90%; animation: sparkleFloat 2.8s ease-in-out infinite 2s; }
            
            .sparkle-container {
              pointer-events: none;
              z-index: 1;
            }
          `}</style>
          )}
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userData?.EmployeeRole === 2 ? 'Team Call Statistics' : 'Your Call Statistics'}
                </h3>
                <p className="text-sm text-gray-600">
                  {userData?.EmployeeRole === 2 
                    ? 'Combined statistics for all agents under your supervision' 
                    : 'Your individual call performance metrics'
                  }
                </p>
              </div>
              
              {/* Date Filter Component */}
              <div className="flex items-center space-x-3">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    const newFilter = e.target.value;
                    setDateFilter(newFilter);
                    if (newFilter === "custom") {
                      setShowCustomDateRange(true);
                    } else {
                      setShowCustomDateRange(false);
                    }
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last Week</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {/* Custom Date Range Inputs */}
                {showCustomDateRange && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={customStartDate}
                      max={getTodayDate()}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setCustomStartDate(newStartDate);
                        // Auto-adjust end date if it's before start date
                        if (customEndDate < newStartDate) {
                          setCustomEndDate(newStartDate);
                        }
                        validateCustomDateRange(newStartDate, customEndDate);
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      max={getTodayDate()}
                      min={customStartDate}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        setCustomEndDate(newEndDate);
                        validateCustomDateRange(customStartDate, newEndDate);
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    />
                    <span className="text-xs text-gray-400 ml-2">(Max 30 days)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Stats */}
            <div className="border-r border-gray-200 pr-4 last:border-r-0 last:pr-0">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-4 h-4 text-blue-600 mr-1" />
                <h4 className="text-sm font-semibold text-gray-700">Overall</h4>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{callStats?.overall?.totalCalls || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{callStats?.overall?.answeredCalls || 0}</p>
                  <p className="text-xs text-gray-500">Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{callStats?.overall?.missedCalls || 0}</p>
                  <p className="text-xs text-gray-500">Missed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{formatStatsDuration(callStats?.overall?.avgCallDuration) || "0:00"}</p>
                  <p className="text-xs text-gray-500">Avg</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{formatStatsDuration(callStats?.overall?.totalTalkTime) || "0m"}</p>
                  <p className="text-xs text-gray-500">Talk Time</p>
                </div>
              </div>
            </div>

            {/* Inbound Stats */}
            <button 
              onClick={() => navigate('/dashboard/incoming-call')}
              className="border-r border-gray-200 pr-4 last:border-r-0 last:pr-0 hover:bg-green-50 transition-colors duration-200 rounded-lg p-2 w-full text-left cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <PhoneArrowDownLeftIcon className="w-4 h-4 text-green-600 mr-1" />
                <h4 className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                  Inbound
                </h4>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{callStats?.inbound?.totalCalls || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{callStats?.inbound?.answeredCalls || 0}</p>
                  <p className="text-xs text-gray-500">Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{callStats?.inbound?.missedCalls || 0}</p>
                  <p className="text-xs text-gray-500">Missed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{formatStatsDuration(callStats?.inbound?.avgCallDuration) || "0:00"}</p>
                  <p className="text-xs text-gray-500">Avg</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{formatStatsDuration(callStats?.inbound?.totalTalkTime) || "0m"}</p>
                  <p className="text-xs text-gray-500">Talk Time</p>
                </div>
              </div>
            </button>

            {/* Outbound Stats */}
            <button 
              onClick={() => navigate('/dashboard/outgoing-call')}
              className="hover:bg-blue-50 transition-colors duration-200 rounded-lg p-2 w-full text-left cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <PhoneArrowUpRightIcon className="w-4 h-4 text-blue-600 mr-1" />
                <h4 className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  Outbound
                </h4>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{callStats?.outbound?.totalCalls || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{callStats?.outbound?.answeredCalls || 0}</p>
                  <p className="text-xs text-gray-500">Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{callStats?.outbound?.missedCalls || 0}</p>
                  <p className="text-xs text-gray-500">Missed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{formatStatsDuration(callStats?.outbound?.avgCallDuration) || "0:00"}</p>
                  <p className="text-xs text-gray-500">Avg</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{formatStatsDuration(callStats?.outbound?.totalTalkTime) || "0m"}</p>
                  <p className="text-xs text-gray-500">Talk Time</p>
                </div>
              </div>
            </button>
            
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Calls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200 max-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userData?.EmployeeRole === 2 ? 'Recent Team Calls' : 'Recent Calls'}
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
                  placeholder={userData?.EmployeeRole === 2 ? "Search team calls by name, number, or agent..." : "Search calls by name or number..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto relative">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Start
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    {userData?.EmployeeRole === 2 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.1)]">
                      Actions
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
                            <div className="text-sm text-gray-900">
                              {(() => {
                                try {
                                  const date = new Date(call.callStartTime);
                                  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                                } catch {
                                  return 'Invalid Date';
                                }
                              })()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(() => {
                                try {
                                  const date = new Date(call.callStartTime);
                                  return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch {
                                  return 'Invalid Time';
                                }
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {call.duration}
                          </td>
                          {userData?.EmployeeRole === 2 && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="text-sm text-gray-900">{call.agentName || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{call.agentNumber || call.agentId || 'N/A'}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.region}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {call.remarks ? (
                              <div>
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
                            ) : (
                              <span className="text-gray-400 italic">No remarks</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatRelativeTime(call.callDateTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky right-0 bg-white shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex flex-col space-y-1">
                              {/* View Detail Button */}
                              <button
                                onClick={() => handleViewDetail(call)}
                                className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                                title="View call details"
                              >
                                <EyeIcon className="h-3 w-3 mr-1" />
                                View Detail
                              </button>
                              
                              {/* Call Back Button */}
                              <button
                                onClick={() => handleCall(call.number, call.customerName)}
                                disabled={!call.number}
                                className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 w-full ${
                                  call.number
                                    ? "text-green-600 bg-green-50 hover:bg-green-100 focus:ring-green-500"
                                    : "text-gray-400 bg-gray-50 cursor-not-allowed"
                                }`}
                                title={!call.number ? "No phone number" : "Call back"}
                              >
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                Call Back
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={userData?.EmployeeRole === 2 ? "8" : "7"}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No calls found for the selected period
                      </td>
                      <td className="px-6 py-8 sticky right-0 bg-white"></td>
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
                  {userData?.EmployeeRole === 2 ? 'Team Pending Follow-ups' : 'Pending Follow-ups'}
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

      {/* Detail Modal */}
      {isDetailModalOpen && selectedCallDetail && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeDetailModal}
              style={{ zIndex: 9998 }}
            ></div>

            {/* Modal positioning */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal panel */}
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative"
              style={{ zIndex: 10000 }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="w-full">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Call Details - {selectedCallDetail.customerName || 'Unknown Caller'}
                    </h3>
                    <button
                      onClick={closeDetailModal}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Modal Content with max height and scroll */}
                  <div className="max-h-[70vh] overflow-y-auto">
                    {/* Call Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Trader Name</label>
                          <p className="text-sm text-gray-900">{selectedCallDetail.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <p className="text-sm text-gray-900">{selectedCallDetail.number || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Region</label>
                          <p className="text-sm text-gray-900">{selectedCallDetail.region || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Call Status</label>
                          <p className="text-sm text-gray-900 capitalize">{selectedCallDetail.status || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Duration</label>
                          <p className="text-sm text-gray-900">{selectedCallDetail.duration || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Call Type</label>
                          <p className="text-sm text-gray-900 capitalize">{selectedCallDetail.type || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Form Details Section */}
                      {selectedCallDetail.formDetail && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Form Details</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Call Type</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.callType || 'N/A'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Inquiry Number</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.inquiryNumber || 'N/A'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Support Type</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.SupportType?.supportName || 'N/A'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Process Type</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.ProcessType?.processName || 'N/A'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Query Type</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.QueryType?.queryName || 'N/A'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Remarks</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.formDetail.remarks || 'No remarks'}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                              <p className="text-sm text-gray-900">
                                {selectedCallDetail.formDetail.followUpDate 
                                  ? new Date(selectedCallDetail.formDetail.followUpDate).toLocaleDateString()
                                  : 'No follow-up scheduled'}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-500">Status</label>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedCallDetail.formDetail.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {selectedCallDetail.formDetail.status?.charAt(0).toUpperCase() + selectedCallDetail.formDetail.status?.slice(1) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Agent Information (for manager view) */}
                      {userData?.EmployeeRole === 2 && selectedCallDetail.agentName && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Agent Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Agent Name</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.agentName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Agent Number</label>
                              <p className="text-sm text-gray-900">{selectedCallDetail.agentNumber || selectedCallDetail.agentId}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Sticky */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sticky bottom-0 border-t">
                <button
                  onClick={closeDetailModal}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default DashboardPage;
