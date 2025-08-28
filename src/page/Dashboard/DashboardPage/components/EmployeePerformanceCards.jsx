import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  PhoneIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
} from "@heroicons/react/24/outline";

const EmployeePerformanceCards = ({ adminData, onCall }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("totalCalls"); // totalCalls, connectionRate, name
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  // Calculate connection rate
  const calculateConnectionRate = (connected, total) => {
    if (total === 0) return 0;
    return Math.round((connected / total) * 100);
  };

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

  // Prepare and sort employee data
  const prepareEmployeeData = () => {
    if (!adminData.callsPerEmployee?.employees) return [];

    return adminData.callsPerEmployee.employees
      .map((emp) => ({
        ...emp,
        connectionRate: calculateConnectionRate(
          emp.inboundCalls.connected + emp.outboundCalls.connected,
          emp.totalCalls
        ),
        totalConnected:
          emp.inboundCalls.connected + emp.outboundCalls.connected,
        totalNotConnected:
          emp.inboundCalls.notConnected + emp.outboundCalls.notConnected,
      }))
      .sort((a, b) => {
        let compareValue;
        switch (sortBy) {
          case "name":
            compareValue = a.employeeName.localeCompare(b.employeeName);
            break;
          case "connectionRate":
            compareValue = a.connectionRate - b.connectionRate;
            break;
          case "totalCalls":
          default:
            compareValue = a.totalCalls - b.totalCalls;
            break;
        }
        return sortOrder === "asc" ? compareValue : -compareValue;
      });
  };

  const employeeData = prepareEmployeeData();

  // Get top performers (top 3)
  const topPerformers = employeeData
    .filter((emp) => emp.totalCalls > 0)
    .slice(0, 3);

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

  if (!adminData.callsPerEmployee) {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Employee Performance
            </h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No employee data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Top Performers Banner */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-4 mb-6">
          <div className="flex items-center mb-3">
            <TrophyIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              🏆 Top Performers
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((emp, index) => (
              <div
                key={emp.employeeId}
                className="bg-white rounded-lg p-4 border border-yellow-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-yellow-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {emp.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {emp.employeePhone}
                      </p>
                    </div>
                  </div>
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Total Calls</p>
                    <p className="font-bold text-lg">{emp.totalCalls}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success Rate</p>
                    <p className="font-bold text-lg text-green-600">
                      {emp.connectionRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Performance Cards */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Employee Performance
              </h3>
            </div>
            <div className="text-sm text-gray-600">
              {adminData.callsPerEmployee.summary.totalEmployees} employees •{" "}
              {adminData.callsPerEmployee.summary.grandTotalCalls} total calls
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button
              onClick={() => handleSort("totalCalls")}
              className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors ${
                sortBy === "totalCalls"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Total Calls
              <SortIcon field="totalCalls" />
            </button>
            <button
              onClick={() => handleSort("connectionRate")}
              className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors ${
                sortBy === "connectionRate"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Success Rate
              <SortIcon field="connectionRate" />
            </button>
            <button
              onClick={() => handleSort("name")}
              className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors ${
                sortBy === "name"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Name
              <SortIcon field="name" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {employeeData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employeeData.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                >
                  {/* Employee Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {employee.employeeName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {employee.employeePhone}
                      </p>
                    </div>
                    {employee.totalCalls > 0 && (
                      <button
                        onClick={() =>
                          onCall &&
                          onCall(employee.employeePhone, employee.employeeName)
                        }
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        title="Call employee"
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Call Statistics */}
                  <div className="space-y-3">
                    {/* Total Calls */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Calls</span>
                      <span className="font-bold text-lg">
                        {employee.totalCalls}
                      </span>
                    </div>

                    {/* Success Rate */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Success Rate
                      </span>
                      <span
                        className={`font-bold ${
                          employee.connectionRate >= 70
                            ? "text-green-600"
                            : employee.connectionRate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {employee.connectionRate}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          employee.connectionRate >= 70
                            ? "bg-green-500"
                            : employee.connectionRate >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${employee.connectionRate}%` }}
                      ></div>
                    </div>

                    {/* Call Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/dashboard/incoming-call?agentPhone=${employee.employeePhone}`
                          )
                        }
                      >
                        <PhoneArrowDownLeftIcon className="w-3 h-3 text-blue-500 mr-1" />
                        <span className="text-gray-600">
                          In: {employee.inboundCalls.total}
                        </span>
                      </div>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/dashboard/outgoing-call?agentPhone=${employee.employeePhone}`
                          )
                        }
                      >
                        <PhoneArrowUpRightIcon className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-gray-600">
                          Out: {employee.outboundCalls.total}
                        </span>
                      </div>
                    </div>

                    {/* Connected vs Not Connected */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">
                          Connected: {employee.totalConnected}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">
                          Missed: {employee.totalNotConnected}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No employee data available for the selected period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceCards;
