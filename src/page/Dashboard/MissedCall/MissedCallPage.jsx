import React, { useState, useEffect, useContext } from "react";
import {
  PhoneIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";
import { useCall } from "../../../hooks/useCall";

const MissedCallsPage = () => {
  const { userData } = useContext(UserContext);
  const { initiateCall } = useCall();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [missedCalls, setMissedCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [hasOutgoingCall, setHasOutgoingCall] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Helper function to get today's date
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch missed calls data
  const fetchMissedCalls = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 20,
      };

      if (searchTerm.trim()) {
        params.callerNumber = searchTerm.trim();
      }

      if (hasOutgoingCall !== "") {
        params.hasOutgoingCall = hasOutgoingCall;
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      console.log("📞 Fetching missed calls with params:", params);

      const response = await axiosInstance.get("/calls/missed", { params });

      console.log("📞 Missed calls API response:", response.data);

      if (response.data.success) {
        setMissedCalls(response.data.data || []);
        setPagination({
          currentPage: response.data.summary?.currentPage || 1,
          totalPages: response.data.summary?.totalPages || 1,
          totalRecords: response.data.summary?.totalMissedCalls || 0,
        });
      } else {
        setError("Failed to fetch missed calls data");
      }
    } catch (error) {
      console.error("❌ Error fetching missed calls:", error);
      setError(error.message);
      setMissedCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summary stats
  const fetchStats = async () => {
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await axiosInstance.get("/calls/missed/stats/summary", {
        params,
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchMissedCalls();
  }, [currentPage, searchTerm, hasOutgoingCall, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  // Handle view details
  const handleViewDetails = async (call) => {
    try {
      const response = await axiosInstance.get(
        `/calls/missed/${call.incomingCall.callId}`
      );

      if (response.data.success) {
        setSelectedCall(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("❌ Error fetching call details:", error);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMissedCalls();
    fetchStats();
  };

  // Handle callback
  const handleCallback = (phoneNumber) => {
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Initiating callback to ${phoneNumber}`);
      initiateCall(phoneNumber);
    }
  };

  // Format date time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Get status badge
  const getStatusBadge = (call) => {
    if (call.hasBeenCalledBack) {
      return "bg-green-100 text-green-800";
    } else if (call.needsOutgoingCall) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (call) => {
    if (call.hasBeenCalledBack) {
      return "Called Back";
    } else if (call.needsOutgoingCall) {
      return "Needs Callback";
    } else {
      return "No Action Needed";
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
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                Missed Calls Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage missed calls that require callbacks
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
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-red-900">
                      {stats.overview?.totalMissedCalls || 0}
                    </div>
                    <div className="text-xs text-red-600">Total Missed</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-yellow-900">
                      {stats.overview?.missedCallsNeedingCallback || 0}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Need Callbacks
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
                      {stats.overview?.missedCallsAlreadyCalledBack || 0}
                    </div>
                    <div className="text-xs text-green-600">Called Back</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PhoneArrowUpRightIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-blue-900">
                      {stats.overview?.callbackCompletionRate || "0%"}
                    </div>
                    <div className="text-xs text-blue-600">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search caller number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Callback Status Filter */}
            <select
              value={hasOutgoingCall}
              onChange={(e) => setHasOutgoingCall(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">All Missed Calls</option>
              <option value="false">Needs Callback</option>
              <option value="true">Already Called Back</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="From Date"
            />

            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="To Date"
            />

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setHasOutgoingCall("");
                setDateFrom("");
                setDateTo("");
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
              Error Loading Missed Calls
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

      {/* Missed Calls List */}
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
                  </div>
                ))}
              </div>
            </div>
          ) : missedCalls.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Missed Calls Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || hasOutgoingCall || dateFrom || dateTo
                  ? "No missed calls match your search criteria"
                  : "No missed calls found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caller Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Callback Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outgoing Call
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {missedCalls.map((call) => {
                    const { date, time } = formatDateTime(
                      call.incomingCall.callStartTime
                    );

                    return (
                      <tr
                        key={call.incomingCall.id}
                        className="hover:bg-gray-50"
                      >
                        {/* Caller Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-red-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {call.incomingCall.callerNumber}
                              </div>
                              <div className="text-xs text-gray-400">
                                Call ID: {call.incomingCall.callId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Call Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {date}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {time}
                          </div>
                          <div className="text-xs text-gray-400">
                            Duration:{" "}
                            {formatDuration(
                              call.incomingCall.totalCallDuration
                            )}
                          </div>
                        </td>

                        {/* Agent Info */}
                        <td className="px-6 py-4">
                          {call.incomingCall.agentNumber ? (
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">
                                Agent: {call.incomingCall.agentNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                Agent was available
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <div>No agent assigned</div>
                              <div className="text-xs text-red-500">
                                IVR only call
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Callback Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              call
                            )}`}
                          >
                            {call.hasBeenCalledBack ? (
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                            ) : call.needsOutgoingCall ? (
                              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircleIcon className="w-3 h-3 mr-1" />
                            )}
                            {getStatusText(call)}
                          </span>
                        </td>

                        {/* Outgoing Call Info */}
                        <td className="px-6 py-4">
                          {call.outgoingCall ? (
                            <div className="text-sm">
                              <div className="font-medium text-green-700">
                                Call ID: {call.outgoingCall.callId}
                              </div>
                              <div className="text-xs text-gray-500">
                                Duration:{" "}
                                {formatDuration(
                                  call.outgoingCall.totalCallDuration
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Status: {call.outgoingCall.bDialStatus}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No outgoing call
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleViewDetails(call)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </button>

                            {call.incomingCall.voiceRecording && (
                              <a
                                href={call.incomingCall.voiceRecording}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-900 flex items-center"
                              >
                                <PlayIcon className="w-4 h-4 mr-1" />
                                Recording
                              </a>
                            )}

                            {call.needsOutgoingCall && (
                              <button
                                onClick={() =>
                                  handleCallback(call.incomingCall.callerNumber)
                                }
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <PhoneIcon className="w-4 h-4 mr-1" />
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
                      {(currentPage - 1) * 20 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 20, pagination.totalRecords)}
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
                      Previous
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
                  Missed Call Details - {selectedCall.incomingCall.callId}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Call Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incoming Call Details */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Incoming Call (Missed)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call ID:</span>
                      <span className="font-medium">
                        {selectedCall.incomingCall.callId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Caller Number:</span>
                      <span className="font-medium">
                        {selectedCall.incomingCall.callerNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVR Number:</span>
                      <span className="font-medium">
                        {selectedCall.incomingCall.ivrNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedCall.incomingCall.callStartTime
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedCall.incomingCall.callEndTime
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formatDuration(
                          selectedCall.incomingCall.totalCallDuration
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Number:</span>
                      <span className="font-medium">
                        {selectedCall.incomingCall.agentNumber ||
                          "No agent assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Outgoing Call Details */}
                {selectedCall.outgoingCall ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <PhoneArrowUpRightIcon className="w-5 h-5 mr-2" />
                      Outgoing Call (Callback)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call ID:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.callId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent Number:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.agentNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Number:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.customerNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Time:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedCall.outgoingCall.callStartTime
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connected Time:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.bPartyConnectedTime
                            ? new Date(
                                selectedCall.outgoingCall.bPartyConnectedTime
                              ).toLocaleString()
                            : "Not connected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {formatDuration(
                            selectedCall.outgoingCall.totalCallDuration
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.bDialStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disconnected By:</span>
                        <span className="font-medium">
                          {selectedCall.outgoingCall.disconnectedBy || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      No Outgoing Call Yet
                    </h3>
                    <div className="text-center py-8">
                      <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-yellow-700 mb-4">
                        {selectedCall.status?.needsOutgoingCall
                          ? "This missed call requires a callback"
                          : "No callback needed for this missed call"}
                      </p>
                      {selectedCall.status?.needsOutgoingCall && (
                        <button
                          onClick={() => {
                            handleCallback(
                              selectedCall.incomingCall.callerNumber
                            );
                            setShowDetailsModal(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center mx-auto"
                        >
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          Make Callback Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Recording Section */}
              {selectedCall.incomingCall.voiceRecording && (
                <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Voice Recording
                  </h3>
                  <a
                    href={selectedCall.incomingCall.voiceRecording}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Play Incoming Call Recording
                  </a>
                  {selectedCall.outgoingCall?.recordVoice && (
                    <a
                      href={selectedCall.outgoingCall.recordVoice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Play Outgoing Call Recording
                    </a>
                  )}
                </div>
              )}

              {/* Raw Data (for debugging) */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Show Raw Data (Debug)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Incoming Call Raw Data:
                      </h4>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(
                          selectedCall.incomingCall.rawData,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                    {selectedCall.outgoingCall && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Outgoing Call Raw Data:
                        </h4>
                        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                          {JSON.stringify(
                            selectedCall.outgoingCall.rawData,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between">
                {selectedCall.status?.needsOutgoingCall && (
                  <button
                    onClick={() => {
                      handleCallback(selectedCall.incomingCall.callerNumber);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Call Back Now
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 ml-auto"
                >
                  Close
                </button>
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
  );
};

export default MissedCallsPage;
