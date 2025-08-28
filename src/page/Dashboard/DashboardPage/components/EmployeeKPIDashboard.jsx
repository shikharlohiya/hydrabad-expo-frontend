import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const EmployeeKPIDashboard = ({ adminData }) => {
  const [viewMode, setViewMode] = useState("table"); // scatter, bar, table
  const [sortBy, setSortBy] = useState("totalCalls");
  const [sortOrder, setSortOrder] = useState("desc");

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
    }
  };

  // Prepare KPI data
  const prepareKPIData = () => {
    if (!adminData.employeeKPIs) return [];

    return adminData.employeeKPIs
      .filter((emp) => emp.totalCalls > 0)
      .map((emp) => ({
        ...emp,
        totalTalkTimeMinutes: Math.round(emp.totalTalkTime / 60),
        efficiency:
          emp.totalCalls > 0
            ? Math.round(emp.totalTalkTime / 60 / emp.totalCalls)
            : 0,
        avgTalkTimeMinutes: Math.round(emp.avgTalkTime / 60),
      }))
      .sort((a, b) => {
        let compareValue;
        switch (sortBy) {
          case "employeeName":
            compareValue = a.employeeName.localeCompare(b.employeeName);
            break;
          case "totalTalkTime":
            compareValue = a.totalTalkTime - b.totalTalkTime;
            break;
          case "avgTalkTime":
            compareValue = a.avgTalkTime - b.avgTalkTime;
            break;
          case "efficiency":
            compareValue = a.efficiency - b.efficiency;
            break;
          case "totalCalls":
          default:
            compareValue = a.totalCalls - b.totalCalls;
            break;
        }
        return sortOrder === "asc" ? compareValue : -compareValue;
      });
  };

  const kpiData = prepareKPIData();

  // Custom tooltip for scatter chart
  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.employeeName}</p>
          <p className="text-blue-600">{`Total Calls: ${data.totalCalls}`}</p>
          <p className="text-green-600">{`Talk Time: ${data.totalTalkTimeMinutes} min`}</p>
          <p className="text-purple-600">{`Avg per Call: ${data.avgTalkTimeMinutes} min`}</p>
          <p className="text-orange-600">{`Efficiency: ${data.efficiency} min/call`}</p>
        </div>
      );
    }
    return null;
  };

  // Get top performers by different metrics
  const getTopPerformers = (metric, limit = 3) => {
    return [...kpiData]
      .sort((a, b) => {
        switch (metric) {
          case "calls":
            return b.totalCalls - a.totalCalls;
          case "talkTime":
            return b.totalTalkTime - a.totalTalkTime;
          case "avgTime":
            return b.avgTalkTime - a.avgTalkTime;
          default:
            return b.totalCalls - a.totalCalls;
        }
      })
      .slice(0, limit);
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  if (!adminData.employeeKPIs || kpiData.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Employee KPIs
            </h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No KPI data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Top Caller */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">🏆 Most Calls</p>
              <p className="text-lg font-bold text-gray-900">
                {getTopPerformers("calls", 1)[0]?.employeeName}
              </p>
              <p className="text-sm text-gray-600">
                {getTopPerformers("calls", 1)[0]?.totalCalls} calls
              </p>
            </div>
            <TrophyIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Longest Talk Time */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                ⏰ Most Talk Time
              </p>
              <p className="text-lg font-bold text-gray-900">
                {getTopPerformers("talkTime", 1)[0]?.employeeName}
              </p>
              <p className="text-sm text-gray-600">
                {formatDuration(
                  getTopPerformers("talkTime", 1)[0]?.totalTalkTime
                )}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Best Average */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                ⭐ Best Avg Time
              </p>
              <p className="text-lg font-bold text-gray-900">
                {getTopPerformers("avgTime", 1)[0]?.employeeName}
              </p>
              <p className="text-sm text-gray-600">
                {formatDuration(getTopPerformers("avgTime", 1)[0]?.avgTalkTime)}
                /call
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main KPI Dashboard */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Employee KPI Dashboard
              </h3>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("scatter")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "scatter"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Scatter View
              </button>
              <button
                onClick={() => setViewMode("bar")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "bar"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Scatter Chart View */}
          {viewMode === "scatter" && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Calls vs Talk Time Analysis
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                  data={kpiData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="totalCalls"
                    name="Total Calls"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="totalTalkTimeMinutes"
                    name="Talk Time (min)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter dataKey="totalTalkTimeMinutes" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar Chart View */}
          {viewMode === "bar" && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Talk Time Comparison
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={kpiData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="employeeName"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "totalTalkTimeMinutes" ? `${value} min` : value,
                      name === "totalTalkTimeMinutes"
                        ? "Total Talk Time"
                        : name === "avgTalkTimeMinutes"
                        ? "Avg Talk Time"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalTalkTimeMinutes"
                    fill="#10B981"
                    name="Total Talk Time (min)"
                  />
                  <Bar
                    dataKey="avgTalkTimeMinutes"
                    fill="#3B82F6"
                    name="Avg Talk Time (min)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">
                  Detailed KPI Table
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <button
                    onClick={() => handleSort("employeeName")}
                    className={`flex items-center text-sm px-2 py-1 rounded transition-colors ${
                      sortBy === "employeeName"
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Name <SortIcon field="employeeName" />
                  </button>
                  <button
                    onClick={() => handleSort("totalCalls")}
                    className={`flex items-center text-sm px-2 py-1 rounded transition-colors ${
                      sortBy === "totalCalls"
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Calls <SortIcon field="totalCalls" />
                  </button>
                  <button
                    onClick={() => handleSort("totalTalkTime")}
                    className={`flex items-center text-sm px-2 py-1 rounded transition-colors ${
                      sortBy === "totalTalkTime"
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Talk Time <SortIcon field="totalTalkTime" />
                  </button>
                  <button
                    onClick={() => handleSort("avgTalkTime")}
                    className={`flex items-center text-sm px-2 py-1 rounded transition-colors ${
                      sortBy === "avgTalkTime"
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Avg Time <SortIcon field="avgTalkTime" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Inbound
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Outbound
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Total Calls
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Total Talk Time
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Avg Inbound
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Avg Outbound
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Overall Avg
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">
                        Efficiency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {kpiData.map((employee) => (
                      <tr
                        key={employee.employeeId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.employeeName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {employee.employeeId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>
                            <p className="font-medium">
                              {employee.inboundCalls}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDuration(employee.totalInboundDuration)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>
                            <p className="font-medium">
                              {employee.outboundCalls}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDuration(employee.totalOutboundDuration)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-bold text-lg">
                            {employee.totalCalls}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-medium text-green-600">
                            {formatDuration(employee.totalTalkTime)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-blue-600">
                            {formatDuration(employee.avgInboundDuration)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-green-600">
                            {formatDuration(employee.avgOutboundDuration)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-medium text-purple-600">
                            {formatDuration(employee.avgTalkTime)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p
                            className={`font-medium ${
                              employee.efficiency <= 3
                                ? "text-green-600"
                                : employee.efficiency <= 5
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {employee.efficiency} min/call
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmployeeKPIDashboard;
