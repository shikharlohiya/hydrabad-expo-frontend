import React, { useState, useEffect, useContext } from "react";
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  UserGroupIcon,
  PhoneIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CloudArrowDownIcon,
  DocumentTextIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";

const ReportPage = () => {
  const { userData } = useContext(UserContext);

  // User role detection
  const userRole = userData?.EmployeeRole;
  const employeeId = userData?.EmployeeId;
  const agentPhone = userData?.EmployeePhone;

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Helper function to get date 30 days ago
  const getDate30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };

  // State management
  const [startDate, setStartDate] = useState(getDate30DaysAgo());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [connectedFilter, setConnectedFilter] = useState("");
  const [isDownloading, setIsDownloading] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadErrors, setDownloadErrors] = useState({});
  const [successMessages, setSuccessMessages] = useState({});

  // Validate date range (max 31 days)
  const validateDateRange = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Start date cannot be later than end date.");
      return false;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      alert("Date range cannot exceed 31 days. Please select a shorter range.");
      return false;
    }

    return true;
  };

  // Generic download handler
  const handleDownload = async (reportType, config) => {
    if (!validateDateRange()) return;

    setIsDownloading((prev) => ({ ...prev, [reportType]: true }));
    setDownloadProgress((prev) => ({ ...prev, [reportType]: 0 }));
    setDownloadErrors((prev) => ({ ...prev, [reportType]: null }));
    setSuccessMessages((prev) => ({ ...prev, [reportType]: null }));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => ({
          ...prev,
          [reportType]: Math.min(prev[reportType] + 10, 90),
        }));
      }, 200);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      // Add conditional parameters based on config
      if (config.includeAgentNumber && userRole === 1 && agentPhone) {
        params.append("agentNumber", agentPhone);
      }
      if (config.includeEmployeeId && employeeId) {
        // Replace placeholder in URL
        config.endpoint = config.endpoint.replace(":employeeId", employeeId);
      }
      if (config.includeConnected && connectedFilter !== "") {
        params.append("connected", connectedFilter);
      }

      console.log(
        `Downloading ${reportType} report:`,
        config.endpoint,
        params.toString()
      );

      const response = await axiosInstance.get(config.endpoint, {
        params,
        responseType: "blob",
        timeout: 120000, // 2 minutes timeout
      });

      // Complete progress
      clearInterval(progressInterval);
      setDownloadProgress((prev) => ({ ...prev, [reportType]: 100 }));

      // Create and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const userPrefix =
        userRole === 1 ? "Agent" : userRole === 2 ? "Manager" : "Admin";
      link.download = `${userPrefix}_${config.filename}_${timestamp}_${startDate}_to_${endDate}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessages((prev) => ({
        ...prev,
        [reportType]: "Download completed successfully!",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessages((prev) => ({ ...prev, [reportType]: null }));
      }, 3000);
    } catch (error) {
      console.error(`${reportType} download failed:`, error);

      let errorMessage = "Download failed. Please try again.";
      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Download timed out. Please try with a smaller date range.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to download this report.";
      } else if (error.response?.status === 404) {
        errorMessage = "Report service not available.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setDownloadErrors((prev) => ({ ...prev, [reportType]: errorMessage }));

      // Clear error after 5 seconds
      setTimeout(() => {
        setDownloadErrors((prev) => ({ ...prev, [reportType]: null }));
      }, 5000);
    } finally {
      setIsDownloading((prev) => ({ ...prev, [reportType]: false }));
      setDownloadProgress((prev) => ({ ...prev, [reportType]: 0 }));
    }
  };

  // Report configurations
  const getReportConfigs = () => {
    const configs = {
      // New API Reports (Primary)
      outgoingCalls: {
        title: "Outgoing Calls Report",
        description: "Download detailed outgoing call records",
        icon: PhoneArrowUpRightIcon,
        endpoint: "/call-reports/download-outgoing",
        filename: "Outgoing_Calls_Report",
        includeAgentNumber: true,
        includeConnected: false,
        color: "blue",
        category: "primary",
      },
      incomingCalls: {
        title: "Incoming Calls Report",
        description: "Download detailed incoming call records",
        icon: PhoneArrowDownLeftIcon,
        endpoint: "/call-reports/download-incoming",
        filename: "Incoming_Calls_Report",
        includeAgentNumber: true,
        includeConnected: false,
        color: "green",
        category: "primary",
      },
    };

    // Add reports for managers and admins only
    if (userRole === 2 || userRole === 3) {
      configs.offHours = {
        title: "Off-Hours Calls Report",
        description: "Download calls made outside business hours",
        icon: ClockIcon,
        endpoint: "/call-reports/download-off-hours",
        filename: "Off_Hours_Report",
        includeAgentNumber: false,
        includeConnected: false,
        color: "purple",
        category: "primary",
      };

      configs.dailySummary = {
        title: "Daily Summary Report",
        description: "Download daily call statistics summary",
        icon: ChartBarIcon,
        endpoint: "/call-reports/download-daily-summary",
        filename: "Daily_Summary_Report",
        includeAgentNumber: false,
        includeConnected: false,
        color: "indigo",
        category: "primary",
      };

      configs.combinedReport = {
        title: "Combined Calls Report",
        description: "Download comprehensive call report",
        icon: DocumentTextIcon,
        endpoint: "/call-reports/download-combined",
        filename: "Combined_Report",
        includeAgentNumber: false,
        includeConnected: false,
        color: "teal",
        category: "primary",
      };
    }

    // Legacy Reports (Deprecated but still available)
    if (userRole === 2) {
      // Manager legacy reports
      configs.legacyManagerIncoming = {
        title: "Manager Incoming Calls (Legacy)",
        description: "Legacy manager incoming calls report",
        icon: PhoneArrowDownLeftIcon,
        endpoint: `/reports/manager-incoming-calls/:employeeId/download`,
        filename: "Legacy_Manager_Incoming",
        includeEmployeeId: true,
        includeConnected: true,
        color: "yellow",
        category: "legacy",
        deprecated: true,
      };

      configs.legacyManagerOutgoing = {
        title: "Manager Outgoing Calls (Legacy)",
        description: "Legacy manager outgoing calls report",
        icon: PhoneArrowUpRightIcon,
        endpoint: `/reports/manager-outgoing-calls/:employeeId/download`,
        filename: "Legacy_Manager_Outgoing",
        includeEmployeeId: true,
        includeConnected: true,
        color: "yellow",
        category: "legacy",
        deprecated: true,
      };

      configs.legacyManagerAll = {
        title: "Manager All Calls (Legacy)",
        description: "Legacy manager all calls report",
        icon: DocumentTextIcon,
        endpoint: `/reports/manager-all-calls/:employeeId/download`,
        filename: "Legacy_Manager_All",
        includeEmployeeId: true,
        includeConnected: true,
        color: "yellow",
        category: "legacy",
        deprecated: true,
      };
    }

    if (userRole === 1 || userRole === 3) {
      // Agent/Admin legacy reports
      configs.legacyIncoming = {
        title: "Incoming Calls (Legacy)",
        description: "Legacy incoming calls report",
        icon: PhoneArrowDownLeftIcon,
        endpoint: "/reports/incoming/download",
        filename: "Legacy_Incoming",
        includeAgentNumber: userRole === 1,
        includeConnected: true,
        color: "orange",
        category: "legacy",
        deprecated: true,
      };

      configs.legacyOutgoing = {
        title: "Outgoing Calls (Legacy)",
        description: "Legacy outgoing calls report",
        icon: PhoneArrowUpRightIcon,
        endpoint: "/reports/outgoing/download",
        filename: "Legacy_Outgoing",
        includeAgentNumber: userRole === 1,
        includeConnected: true,
        color: "orange",
        category: "legacy",
        deprecated: true,
      };

      configs.legacyAll = {
        title: "All Calls (Legacy)",
        description: "Legacy all calls report",
        icon: DocumentTextIcon,
        endpoint: "/reports/all/download",
        filename: "Legacy_All_Calls",
        includeAgentNumber: userRole === 1,
        includeConnected: true,
        color: "orange",
        category: "legacy",
        deprecated: true,
      };
    }

    return configs;
  };

  const reportConfigs = getReportConfigs();
  const primaryReports = Object.entries(reportConfigs).filter(
    ([_, config]) => config.category === "primary"
  );
  const legacyReports = Object.entries(reportConfigs).filter(
    ([_, config]) => config.category === "legacy"
  );

  // Get color classes for buttons
  const getButtonColorClasses = (color, isDownloading, hasError) => {
    if (hasError) {
      return "bg-red-600 text-white border-red-600 hover:bg-red-700";
    }
    if (isDownloading) {
      return "bg-gray-400 text-white border-gray-400 cursor-wait";
    }

    const colorMap = {
      blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
      green: "bg-green-600 text-white border-green-600 hover:bg-green-700",
      purple: "bg-purple-600 text-white border-purple-600 hover:bg-purple-700",
      indigo: "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700",
      teal: "bg-teal-600 text-white border-teal-600 hover:bg-teal-700",
      yellow: "bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700",
      orange: "bg-orange-600 text-white border-orange-600 hover:bg-orange-700",
    };

    return colorMap[color] || colorMap.blue;
  };

  // Render report card
  const renderReportCard = ([reportType, config]) => {
    const IconComponent = config.icon;
    const downloading = isDownloading[reportType];
    const progress = downloadProgress[reportType] || 0;
    const error = downloadErrors[reportType];
    const success = successMessages[reportType];

    return (
      <div
        key={reportType}
        className={`bg-white rounded-lg shadow-md border-l-4 ${
          config.deprecated
            ? "border-l-yellow-500 bg-yellow-50"
            : "border-l-blue-500"
        } hover:shadow-lg transition-shadow duration-200`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${
                  config.deprecated ? "bg-yellow-100" : "bg-blue-100"
                }`}
              >
                <IconComponent
                  className={`h-6 w-6 ${
                    config.deprecated ? "text-yellow-600" : "text-blue-600"
                  }`}
                />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  {config.title}
                  {config.deprecated && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                      Deprecated
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {downloading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Downloading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 flex items-center text-green-600 text-sm">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center text-red-600 text-sm">
              <XCircleIcon className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          {/* Download button */}
          <button
            onClick={() => handleDownload(reportType, config)}
            disabled={downloading}
            className={`w-full inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${getButtonColorClasses(
              config.color,
              downloading,
              error
            )}`}
          >
            {downloading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Downloading... {progress}%
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                Download Report
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <DocumentArrowDownIcon className="w-7 h-7 text-blue-600 mr-3" />
                Reports Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Download comprehensive call reports based on your role and
                requirements
              </p>

              {/* User info */}
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium">
                    {userRole === 1
                      ? "Agent"
                      : userRole === 2
                      ? "Manager"
                      : "Admin"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Name:</span>
                  <span className="ml-1">
                    {userData?.EmployeeName || "N/A"}
                  </span>
                </div>
                {userRole === 1 && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    <span>{agentPhone || "N/A"}</span>
                  </div>
                )}
                {(userRole === 2 || userRole === 3) && (
                  <div className="flex items-center">
                    <span className="font-medium">ID:</span>
                    <span className="ml-1">{employeeId || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
            Report Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Connected Filter (for legacy reports) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Status (Legacy Reports)
              </label>
              <select
                value={connectedFilter}
                onChange={(e) => setConnectedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Calls</option>
                <option value="true">Connected Only</option>
                <option value="false">Failed Only</option>
              </select>
            </div>

            {/* Date Range Info */}
            <div className="flex items-end">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                <div className="flex items-center text-blue-800 text-sm">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">
                      Date Range:{" "}
                      {Math.ceil(
                        Math.abs(new Date(endDate) - new Date(startDate)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                    <div className="text-blue-600">Max: 31 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-green-600" />
            Available Reports
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {primaryReports.length} Reports
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {primaryReports.map(renderReportCard)}
          </div>
        </div>
      </div>

      {/* Legacy Reports */}
      {legacyReports.length > 0 && (
        <div className="bg-white shadow rounded-lg border-l-4 border-l-yellow-500">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-yellow-600" />
              Legacy Reports
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Deprecated
              </span>
            </h2>

            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Notice: Legacy Reports</p>
                  <p>
                    These reports are deprecated and maintained for backward
                    compatibility only. Please use the primary reports above for
                    new implementations. Legacy reports may be removed in future
                    updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {legacyReports.map(renderReportCard)}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          How to Use Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Date Selection:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Select start and end dates (max 31 days)</li>
              <li>• Default range is last 30 days</li>
              <li>• Future dates are not allowed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Report Types:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>
                • <strong>Primary:</strong> Latest report format
              </li>
              <li>
                • <strong>Legacy:</strong> Older format (deprecated)
              </li>
              <li>• Connection filter applies to legacy reports only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
