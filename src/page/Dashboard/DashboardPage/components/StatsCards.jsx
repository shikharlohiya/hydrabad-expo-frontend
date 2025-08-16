import React from "react";
import {
  ChartBarIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";

const StatsCards = ({
  userData,
  dateFilter,
  setDateFilter,
  showCustomDateRange,
  setShowCustomDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  getTodayDate,
  validateCustomDateRange,
  callStats,
  formatStatsDuration,
  navigate,
}) => {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userData?.EmployeeRole === 2
                  ? "Team Call Statistics"
                  : "Your Call Statistics"}
              </h3>
              <p className="text-sm text-gray-600">
                {userData?.EmployeeRole === 2
                  ? "Combined statistics for all agents under your supervision"
                  : "Your individual call performance metrics"}
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
                  <span className="text-xs text-gray-400 ml-2">
                    (Max 30 days)
                  </span>
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
                <p className="text-lg font-bold text-gray-900">
                  {callStats?.overall?.totalCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {callStats?.overall?.answeredCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">
                  {callStats?.overall?.missedCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Missed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {formatStatsDuration(callStats?.overall?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-gray-500">Avg</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {formatStatsDuration(callStats?.overall?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-gray-500">Talk Time</p>
              </div>
            </div>
          </div>

          {/* Inbound Stats */}
          <button
            onClick={() => navigate("/dashboard/incoming-call")}
            className="group border-r border-gray-200 pr-4 last:border-r-0 last:pr-0 hover:bg-green-50 transition-colors duration-200 rounded-lg p-2 w-full text-left cursor-pointer"
          >
            <div className="flex items-center mb-2">
              <PhoneArrowDownLeftIcon className="w-4 h-4 text-green-600 mr-1" />
              <h4 className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                Inbound
              </h4>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {callStats?.inbound?.totalCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {callStats?.inbound?.answeredCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">
                  {callStats?.inbound?.missedCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Missed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {formatStatsDuration(callStats?.inbound?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-gray-500">Avg</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {formatStatsDuration(callStats?.inbound?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-gray-500">Talk Time</p>
              </div>
            </div>
          </button>

          {/* Outbound Stats */}
          <button
            onClick={() => navigate("/dashboard/outgoing-call")}
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
                <p className="text-lg font-bold text-gray-900">
                  {callStats?.outbound?.totalCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {callStats?.outbound?.answeredCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">
                  {callStats?.outbound?.missedCalls || 0}
                </p>
                <p className="text-xs text-gray-500">Missed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {formatStatsDuration(callStats?.outbound?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-gray-500">Avg</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {formatStatsDuration(callStats?.outbound?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-gray-500">Talk Time</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
