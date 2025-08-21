import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useDialer from "../../../hooks/useDialer";
import UserContext from "../../../context/UserContext";
import axiosInstance from "../../../library/axios";
import moment from "moment-timezone";

import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorDisplay from "./components/ErrorDisplay";
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import RecentCalls from "./components/RecentCalls";
import FollowUps from "./components/FollowUps";
import CallDetailModal from "./components/CallDetailModal";

// Admin Components
import AdminCharts from "./components/AdminCharts";
import EmployeePerformanceCards from "./components/EmployeePerformanceCards";
import EmployeeKPIDashboard from "./components/EmployeeKPIDashboard";

import {
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";

// Configuration
const SHOW_FLAG_BACKGROUND = true; // Set to true to show Indian flag animation background

const DashboardPage = () => {
  const { initiateCall, setCurrentNumber } = useDialer();
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();

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

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [callStats, setCallStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Admin-specific state
  const [adminData, setAdminData] = useState({
    callsPerRegion: null,
    callsPerEmployee: null,
    employeeKPIs: null,
  });

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
      case "yesterday": {
        const yesterday = getYesterdayDate();
        return { startDate: yesterday, endDate: yesterday };
      }
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
      alert(
        "Custom date range cannot exceed 30 days. Please select a shorter range."
      );
      // Reset to a valid 30-day range
      const maxEndDate = new Date(start);
      maxEndDate.setDate(maxEndDate.getDate() + 30);
      setCustomEndDate(maxEndDate.toISOString().split("T")[0]);
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
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  };

  // Admin API Functions
  const fetchAdminCallsPerRegion = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      console.log("📊 Fetching admin calls per region with date range:", {
        startDate,
        endDate,
        dateFilter,
      });

      const response = await axiosInstance.get(`/admin/calls-per-region`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      console.log("📊 Admin calls per region API response:", response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn(
          "⚠️ Admin calls per region API response structure unexpected:",
          response.data
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching admin calls per region:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch calls per region"
      );
    }
  };

  const fetchAdminCallsPerEmployee = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      console.log("📊 Fetching admin calls per employee with date range:", {
        startDate,
        endDate,
        dateFilter,
      });

      const response = await axiosInstance.get(`/admin/calls-per-employee`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      console.log("📊 Admin calls per employee API response:", response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn(
          "⚠️ Admin calls per employee API response structure unexpected:",
          response.data
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching admin calls per employee:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch calls per employee"
      );
    }
  };

  const fetchAdminEmployeeKPIs = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      console.log("📊 Fetching admin employee KPIs with date range:", {
        startDate,
        endDate,
        dateFilter,
      });

      const response = await axiosInstance.get(`/admin/employees-kpi`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      console.log("📊 Admin employee KPIs API response:", response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn(
          "⚠️ Admin employee KPIs API response structure unexpected:",
          response.data
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching admin employee KPIs:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch employee KPIs"
      );
    }
  };

  // API Functions
  const fetchCallStats = async () => {
    try {
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const agentNumber = userData?.EmployeePhone;
      const { startDate, endDate } = getDateRange();

      console.log("📊 Fetching call stats with date range:", {
        startDate,
        endDate,
        dateFilter,
      });

      // Check if user is admin (EmployeeRole = 3), manager (EmployeeRole = 2) or agent (EmployeeRole = 1)
      if (userRole === 3) {
        // Admin - fetch overall system statistics
        console.log("📊 Fetching admin call stats");

        const response = await axiosInstance.get("/calls/stats", {
          params: {
            startDate: startDate,
            endDate: endDate,
          },
        });
        console.log("📊 Admin stats API response:", response.data);

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error("Failed to fetch admin call stats");
        }
      } else if (userRole === 2) {
        // Manager - fetch combined statistics with date range
        if (!employeeId) {
          throw new Error("Manager ID not found. Please login again.");
        }

        console.log("📊 Fetching manager call stats for:", employeeId);

        const response = await axiosInstance.get(
          `/calls/manager-call-stats/${employeeId}`,
          {
            params: {
              startDate: startDate,
              endDate: endDate,
            },
          }
        );
        console.log("📊 Manager stats API response:", response.data);

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error("Failed to fetch manager call stats");
        }
      } else {
        // Agent - fetch individual agent statistics with date range
        if (!agentNumber) {
          throw new Error("Agent phone number not found. Please login again.");
        }

        console.log(
          "📊 Fetching call stats for agent:",
          agentNumber,
          "Date range:",
          startDate,
          "to",
          endDate
        );

        const params = {
          startDate: startDate,
          endDate: endDate,
          agentNumber: agentNumber,
        };

        const response = await axiosInstance.get("/calls/stats", {
          params,
        });

        console.log("📊 Agent stats API response:", response.data);

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error("Failed to fetch agent call stats");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching call stats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch call stats"
      );
    }
  };

  const fetchRecentCalls = async (search = "") => {
    try {
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const agentNumber = userData?.EmployeePhone;
      const { startDate, endDate } = getDateRange();

      console.log("📞 Fetching recent calls with date range:", {
        startDate,
        endDate,
        dateFilter,
      });

      // Determine API call based on user role
      let response;

      if (userRole === 3) {
        // Admin - fetch all calls
        console.log("📞 Fetching recent calls for admin");
        response = await axiosInstance.get("/calls/recent-calls", {
          params: {
            startDate: startDate,
            endDate: endDate,
            ...(search && { search }),
          },
        });
      } else if (userRole === 2) {
        // Manager
        if (!employeeId) {
          throw new Error("Manager ID not found. Please login again.");
        }
        console.log("📞 Fetching recent calls for manager:", employeeId);
        response = await axiosInstance.get(
          `/calls/manager-recent-calls/${employeeId}`,
          {
            params: {
              // managerId: employeeId,
              startDate: startDate,
              endDate: endDate,
              ...(search && { search }),
            },
          }
        );
      } else {
        // Agent
        if (!agentNumber) {
          throw new Error("Agent phone number not found. Please login again.");
        }
        console.log("📞 Fetching recent calls for agent:", agentNumber);
        response = await axiosInstance.get("/calls/recent-calls", {
          params: {
            agentNumber: agentNumber,
            startDate: startDate,
            endDate: endDate,
            ...(search && { search }),
          },
        });
      }

      console.log(
        `📞 ${
          userRole === 3 ? "Admin" : userRole === 2 ? "Manager" : "Agent"
        } recent calls API response:`,
        response.data
      );

      if (response.data.success && response.data.data?.records) {
        // Transform the API data to match our component structure
        const transformedCalls = response.data.data.records.map((call) => {
          // Calculate duration in MM:SS format
          const formatDuration = (seconds) => {
            if (!seconds || seconds === 0) return "0:00";
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
          };

          // Determine call status based on duration and type
          const getCallStatus = (call) => {
            if (call.duration > 0) return "completed";
            if (call.type === "inbound" && call.duration === 0) return "missed";
            if (call.type === "outbound" && call.duration === 0)
              return "failed";
            return "completed";
          };

          // Get trader name from trader_master data (updated to use new API structure)
          const customerName =
            call.trader_master?.Trader_Name ||
            call.trader_master?.Trader_business_Name ||
            call.contact?.Contact_Name ||
            call.contact?.Trader_Name ||
            call.contact?.trader_name ||
            call.contact?.name ||
            null;

          // Extract region information from trader_master (using new API structure)
          const region =
            call.trader_master?.Region ||
            call.trader_master?.Zone ||
            call.contact?.Region ||
            call.contact?.Zone ||
            call.contact?.zone ||
            "Unknown";

          // Get status from API (using the status field or derive from duration)
          const callStatus = call.status || getCallStatus(call);

          // Get remarks from formDetail
          const remarks = call.formDetail?.remarks || null;

          // Get agent information (for manager and admin view)
          const agentName =
            call.employee?.EmployeeName || call.agent?.EmployeeName || null;
          const agentId =
            call.employee?.EmployeeId || call.agent?.EmployeeId || null;

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
            // Agent information (for manager and admin view)
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
              call.customerName?.toLowerCase().includes(search.toLowerCase()) ||
              call.number.includes(search) ||
              call.callId.toString().includes(search) ||
              // For managers and admins, also search by agent name
              ((userData?.EmployeeRole === 2 || userData?.EmployeeRole === 3) &&
                call.agentName?.toLowerCase().includes(search.toLowerCase()))
          );
        }

        console.log(
          `📞 Successfully transformed ${filteredCalls.length} calls:`,
          filteredCalls
        );
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
    try {
      const userRole = userData?.EmployeeRole;
      const employeeId = userData?.EmployeeId;
      const { startDate, endDate } = getDateRange();

      if (!employeeId) {
        throw new Error("Employee ID not found. Please login again.");
      }

      console.log(
        `📋 Fetching follow-ups for ${
          userRole === 3 ? "admin" : userRole === 2 ? "manager" : "agent"
        }:`,
        employeeId,
        "Date range:",
        startDate,
        "to",
        endDate
      );

      const params = {
        startDate: startDate,
        endDate: endDate,
        limit: 5, // Only fetch 5 for dashboard widget
      };

      if (userRole === 1) {
        params.agentNumber = userData?.EmployeePhone || employeeId;
      }

      let response;
      if (userRole === 2) {
        response = await axiosInstance.get(
          `/calls/manager-follow-ups/${employeeId}`,
          {
            params,
          }
        );
      } else {
        response = await axiosInstance.get("/calls/follow-ups", {
          params,
        });
      }

      console.log(
        `📋 ${
          userRole === 3 ? "Admin" : userRole === 2 ? "Manager" : "Agent"
        } follow-ups API response:`,
        response.data
      );

      if (response.data.success && response.data.data) {
        // Transform the API data to match component structure
        const transformedFollowUps = (response.data.data.records || []).map(
          (record) => {
            // Safely destructure with fallbacks
            const formDetail = record?.formDetail || {};
            const agent = record?.agent || {};
            const trader_master = record?.trader_master || {};

            // Determine priority based on follow-up date
            const followUpDate = new Date(formDetail.followUpDate);
            const today = new Date();
            const diffDays = Math.ceil(
              (followUpDate - today) / (1000 * 60 * 60 * 24)
            );

            let priority = "Normal";
            if (diffDays < 0) {
              priority = "High"; // Overdue
            } else if (diffDays <= 1) {
              priority = "Medium"; // Due today or tomorrow
            }

            return {
              id: formDetail.id,
              customerName:
                trader_master?.Trader_Name ||
                trader_master?.Trader_business_Name ||
                trader_master?.trader_name ||
                trader_master?.business_name ||
                "Unknown Trader",
              traderName:
                trader_master?.Trader_Name ||
                trader_master?.Trader_business_Name ||
                trader_master?.trader_name ||
                trader_master?.business_name ||
                "Unknown Trader",
              phoneNumber:
                trader_master?.Contact_no ||
                trader_master?.contact_no ||
                trader_master?.phone ||
                formDetail.inquiryNumber ||
                "N/A",
              traderContact:
                trader_master?.Contact_no ||
                trader_master?.contact_no ||
                trader_master?.phone ||
                formDetail.inquiryNumber ||
                "N/A",
              followUpDate: formDetail.followUpDate,
              priority: priority,
              issue: formDetail.remarks || "No remarks provided",
              remarks: formDetail.remarks || "No remarks provided",
              callId: formDetail.CallId,
              status: formDetail.status,
              callType: formDetail.callType,
              agentName: agent?.EmployeeName || "Unknown Agent",
              supportType: formDetail.supportType?.supportName || "N/A",
              processType: formDetail.processType?.processName || "N/A",
              queryType: formDetail.queryType?.queryName || "N/A",
              rawData: record, // Store original data
            };
          }
        );

        return transformedFollowUps;
      } else {
        console.warn(
          "⚠️ Follow-ups API response structure unexpected:",
          response.data
        );
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching follow-ups:", error);
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
      // For admin users, also fetch admin-specific data
      if (userData?.EmployeeRole === 3) {
        const [
          statsData,
          callsData,
          followUpsData,
          regionData,
          employeeData,
          kpiData,
        ] = await Promise.all([
          fetchCallStats(),
          fetchRecentCalls(searchTerm),
          fetchFollowUps(),
          fetchAdminCallsPerRegion(),
          fetchAdminCallsPerEmployee(),
          fetchAdminEmployeeKPIs(),
        ]);

        setCallStats(statsData);
        setRecentCalls(callsData);
        setFollowUps(followUpsData);
        setAdminData({
          callsPerRegion: regionData,
          callsPerEmployee: employeeData,
          employeeKPIs: kpiData,
        });
      } else {
        // For regular users, fetch only standard data
        const [statsData, callsData, followUpsData] = await Promise.all([
          fetchCallStats(),
          fetchRecentCalls(searchTerm),
          fetchFollowUps(),
        ]);

        setCallStats(statsData);
        setRecentCalls(callsData);
        setFollowUps(followUpsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects - Combined to prevent duplicate API calls
  useEffect(() => {
    // Only load data if userData is available (prevents initial double-load)
    if (!userData?.EmployeeId && !userData?.EmployeePhone) {
      return;
    }

    if (searchTerm !== undefined && searchTerm !== "") {
      // Debounce search-triggered loads
      const delayedSearch = setTimeout(() => {
        loadDashboardData();
      }, 500);

      return () => clearTimeout(delayedSearch);
    } else {
      // Immediate load for filter changes (non-search)
      loadDashboardData();
    }
  }, [
    dateFilter,
    customStartDate,
    customEndDate,
    searchTerm,
    userData?.EmployeeId,
    userData?.EmployeePhone,
  ]);

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
    console.log("📋 Current modal state:", {
      isDetailModalOpen,
      selectedCallDetail,
    });
    setSelectedCallDetail(call);
    setIsDetailModalOpen(true);
    console.log("📋 Modal should be opening now...");
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCallDetail(null);
  };

  // Format follow-up date helper
  const formatFollowUpDate = (dateTime) => {
    const dateIST = moment.tz(dateTime, "Asia/Kolkata").startOf("day");
    const todayIST = moment().tz("Asia/Kolkata").startOf("day");

    const diffDays = dateIST.diff(todayIST, "days");

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

  // Handle view follow-up details
  const handleViewFollowUpDetails = (followUp) => {
    console.log("📋 Viewing follow-up details:", followUp);
    navigate("/dashboard/follow-up");
  };

  // Handle call from follow-up
  const handleCallFromFollowUp = (phoneNumber, traderName) => {
    console.log("📞 Initiating call from follow-up:", {
      phoneNumber,
      traderName,
    });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Calling ${phoneNumber} for ${traderName}`);

      // Set the current number first, then initiate call
      setCurrentNumber(phoneNumber);
      initiateCall(phoneNumber, { name: traderName });

      console.log("✅ Follow-up call initiated");
    } else {
      console.error("❌ No phone number provided for follow-up call");
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader
        userData={userData}
        showFlagBackground={SHOW_FLAG_BACKGROUND}
      />

      <StatsCards
        userData={userData}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showCustomDateRange={showCustomDateRange}
        setShowCustomDateRange={setShowCustomDateRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        getTodayDate={getTodayDate}
        validateCustomDateRange={validateCustomDateRange}
        callStats={callStats}
        formatStatsDuration={formatStatsDuration}
        navigate={navigate}
      />

      {/* Admin-specific components - Only show for EmployeeRole === 3 */}
      {userData?.EmployeeRole === 3 && (
        <>
          <AdminCharts adminData={adminData} />
          <EmployeePerformanceCards adminData={adminData} onCall={handleCall} />
          <EmployeeKPIDashboard adminData={adminData} />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecentCalls
          userData={userData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          recentCalls={recentCalls}
          getCallTypeIcon={getCallTypeIcon}
          getStatusColor={getStatusColor}
          formatRelativeTime={formatRelativeTime}
          handleViewDetail={handleViewDetail}
          handleCall={handleCall}
          expandedRemarks={expandedRemarks}
          setExpandedRemarks={setExpandedRemarks}
        />

        <FollowUps
          userData={userData}
          followUps={followUps}
          formatFollowUpDate={formatFollowUpDate}
          getPriorityColor={getPriorityColor}
          handleViewFollowUpDetails={handleViewFollowUpDetails}
          handleCallFromFollowUp={handleCallFromFollowUp}
          navigate={navigate}
        />
      </div>

      <CallDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        callDetail={selectedCallDetail}
      />
    </div>
  );
};

export default DashboardPage;
