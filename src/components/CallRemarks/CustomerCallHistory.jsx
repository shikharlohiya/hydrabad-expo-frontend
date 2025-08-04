import React from "react";
import { Clock, Calendar, Phone, Tag } from "lucide-react";

const CustomerCallHistory = ({ callHistory, phoneNumber }) => {
  const getCallTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "support":
        return "text-blue-700 bg-blue-100";
      case "sales":
        return "text-green-700 bg-green-100";
      case "complaint":
        return "text-red-700 bg-red-100";
      case "billing":
        return "text-purple-700 bg-purple-100";
      case "information":
        return "text-gray-700 bg-gray-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCallType = (type) => {
    const types = {
      support: "Support",
      sales: "Sales",
      complaint: "Complaint",
      information: "Information",
      billing: "Billing",
      other: "Other",
    };
    return types[type?.toLowerCase()] || type || "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      // Handle both time strings and full datetime strings
      if (timeString.includes(":")) {
        return timeString.slice(0, 5); // Get HH:MM
      }
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return timeString;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";

    // If it's already formatted (MM:SS), return as is
    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }

    // If it's seconds, convert to MM:SS
    if (typeof duration === "number") {
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }

    return duration;
  };

  if (!callHistory || callHistory.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No call history available</p>
          <p className="text-gray-400 text-xs mt-1">
            Previous calls will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900">Call History</h4>
        <p className="text-xs text-gray-500 mt-1">
          {callHistory.length} previous call
          {callHistory.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {callHistory.map((call, index) => (
          <div
            key={call.id || index}
            className="border border-gray-200 rounded-lg bg-white p-3 hover:shadow-sm transition-shadow"
          >
            {/* Call Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(call.date || call.callDate)}
                </span>
                <span className="text-xs text-gray-500">
                  at {formatTime(call.time || call.callTime)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDuration(call.duration || call.callDuration)}
                </span>
              </div>
            </div>

            {/* Call Type and Priority */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallTypeColor(
                  call.type || call.callType
                )}`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {formatCallType(call.type || call.callType)}
              </span>

              {(call.priority || call.callPriority) && (
                <span
                  className={`text-xs font-medium ${getPriorityColor(
                    call.priority || call.callPriority
                  )}`}
                >
                  {(call.priority || call.callPriority)
                    .charAt(0)
                    .toUpperCase() +
                    (call.priority || call.callPriority).slice(1)}{" "}
                  Priority
                </span>
              )}
            </div>

            {/* Call Details */}
            {(call.category ||
              call.subject ||
              call.resolution ||
              call.remarks) && (
              <div className="space-y-1">
                {(call.category || call.subject) && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {call.category || call.subject}
                  </div>
                )}

                {(call.resolution || call.remarks) && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Notes:</span>{" "}
                    {call.resolution || call.remarks}
                  </div>
                )}

                {(call.agent || call.handledBy) && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Agent:</span>{" "}
                    {call.agent || call.handledBy}
                  </div>
                )}
              </div>
            )}

            {/* Status or Satisfaction (if available) */}
            {(call.status || call.satisfaction) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  {call.status && (
                    <span className="text-gray-600">
                      Status: <span className="font-medium">{call.status}</span>
                    </span>
                  )}
                  {call.satisfaction && (
                    <span className="text-gray-600">
                      Rating:{" "}
                      <span className="font-medium">{call.satisfaction}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More (if many calls) */}
      {callHistory.length >= 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing recent {callHistory.length} calls
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerCallHistory;
