import React from "react";
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const RecentCalls = ({
  userData,
  searchTerm,
  setSearchTerm,
  recentCalls,
  getCallTypeIcon,
  getStatusColor,
  formatRelativeTime,
  handleViewDetail,
  handleCall,
  expandedRemarks,
  setExpandedRemarks,
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow border border-gray-200 max-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {userData?.EmployeeRole === 2
                ? "Recent Team Calls"
                : "Recent Calls"}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                userData?.EmployeeRole === 2
                  ? "Search team calls by name, number, or agent..."
                  : "Search calls by name or number..."
              }
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
                              return isNaN(date.getTime())
                                ? "Invalid Date"
                                : date.toLocaleDateString();
                            } catch {
                              return "Invalid Date";
                            }
                          })()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            try {
                              const date = new Date(call.callStartTime);
                              return isNaN(date.getTime())
                                ? "Invalid Time"
                                : date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                            } catch {
                              return "Invalid Time";
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.duration}
                      </td>
                      {userData?.EmployeeRole === 2 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-sm text-gray-900">
                            {call.agentName || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {call.agentNumber || call.agentId || "N/A"}
                          </div>
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
                                      {call.remarks.substring(0, 15)}...
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
                            onClick={() =>
                              handleCall(call.number, call.customerName)
                            }
                            disabled={!call.number}
                            className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 w-full ${
                              call.number
                                ? "text-green-600 bg-green-50 hover:bg-green-100 focus:ring-green-500"
                                : "text-gray-400 bg-gray-50 cursor-not-allowed"
                            }`}
                            title={
                              !call.number ? "No phone number" : "Call back"
                            }
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
  );
};

export default RecentCalls;
