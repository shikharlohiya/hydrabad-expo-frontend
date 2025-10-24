import {
  ChartBarIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  ArrowDownTrayIcon,
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
  isExporting,
  handleExcelExport,
}) => {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {userData?.EmployeeRole === 2
                  ? "Team Call Statistics"
                  : "Your Call Statistics"}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
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
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
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
                    className="text-sm border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
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
                    className="text-sm border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  />
                  <span className="text-xs text-gray-400 ml-2">
                    (Max 30 days)
                  </span>
                </div>
              )}
               <button
                onClick={handleExcelExport}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 shadow-sm transition-all duration-200"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export Excel"}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center mb-3 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white ml-2">Overall</h4>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center relative z-10">
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.overall?.totalCalls || 0}
                </p>
                <p className="text-xs text-blue-100 font-medium">Total</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.overall?.answeredCalls || 0}
                </p>
                <p className="text-xs text-blue-100 font-medium">Answered</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.overall?.missedCalls || 0}
                </p>
                <p className="text-xs text-blue-100 font-medium">Missed</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.overall?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-blue-100 font-medium">Avg</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.overall?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-blue-100 font-medium">Talk Time</p>
              </div>
            </div>
          </div>

          {/* Inbound Stats */}
          <button
            onClick={() => navigate("/dashboard/incoming-call")}
            className="group bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 w-full text-left cursor-pointer relative overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center mb-3 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <PhoneArrowDownLeftIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white ml-2">
                Inbound
              </h4>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center relative z-10">
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.inbound?.totalCalls || 0}
                </p>
                <p className="text-xs text-green-100 font-medium">Total</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.inbound?.answeredCalls || 0}
                </p>
                <p className="text-xs text-green-100 font-medium">Answered</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.inbound?.missedCalls || 0}
                </p>
                <p className="text-xs text-green-100 font-medium">Missed</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.inbound?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-green-100 font-medium">Avg</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.inbound?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-green-100 font-medium">Talk Time</p>
              </div>
            </div>
          </button>

          {/* Outbound Stats */}
          <button
            onClick={() => navigate("/dashboard/outgoing-call")}
            className="group bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 w-full text-left cursor-pointer relative overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center mb-3 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <PhoneArrowUpRightIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white ml-2">
                Outbound
              </h4>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center relative z-10">
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.outbound?.totalCalls || 0}
                </p>
                <p className="text-xs text-purple-100 font-medium">Total</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.outbound?.answeredCalls || 0}
                </p>
                <p className="text-xs text-purple-100 font-medium">Answered</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {callStats?.outbound?.missedCalls || 0}
                </p>
                <p className="text-xs text-purple-100 font-medium">Missed</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.outbound?.avgCallDuration) ||
                    "0:00"}
                </p>
                <p className="text-xs text-purple-100 font-medium">Avg</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white drop-shadow-md">
                  {formatStatsDuration(callStats?.outbound?.totalTalkTime) ||
                    "0m"}
                </p>
                <p className="text-xs text-purple-100 font-medium">Talk Time</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
