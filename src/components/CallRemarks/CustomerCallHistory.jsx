import React from "react";
import {
  Clock,
  Calendar,
  Phone,
  Tag,
  User,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";

const CustomerCallHistory = ({ callHistory, phoneNumber }) => {
  // Create unique key for each call record
  const getUniqueKey = (call, index) => {
    const keyParts = [
      call.id || call.CallId || "",
      call.startTime || "",
      call.agentId || call.agent || "",
      call.customerNumber || "",
      call.duration || "",
      index,
    ];
    return keyParts.join("-");
  };

  const getCallTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "inbound":
        return "text-green-700 bg-green-100";
      case "outbound":
        return "text-blue-700 bg-blue-100";
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "answered":
        return "text-green-600";
      case "missed":
      case "unanswered":
        return "text-red-600";
      case "busy":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCallType = (type) => {
    const types = {
      inbound: "Inbound",
      outbound: "Outbound",
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

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      return new Date(dateTimeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "N/A";
    }
  };

  const formatDuration = (duration) => {
    if (!duration && duration !== 0) return "N/A";

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

  const getCallIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "inbound":
        return <PhoneIncoming className="w-4 h-4" />;
      case "outbound":
        return <PhoneOutgoing className="w-4 h-4" />;
      default:
        return <PhoneCall className="w-4 h-4" />;
    }
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
        <h4 className="text-sm font-medium text-gray-900">Call History111</h4>
        <p className="text-xs text-gray-500 mt-1">
          Showing last {callHistory.length} call record
          {callHistory.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {callHistory.map((call, index) => (
          <div
            key={getUniqueKey(call, index)}
            className="border border-gray-200 rounded-lg bg-white p-3 hover:shadow-sm transition-shadow"
          >
            {/* Call Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(call.date || call.startTime)}
                </span>
                <span className="text-xs text-gray-500">
                  at {formatTime(call.time || call.startTime)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(call.duration)}</span>
              </div>
            </div>

            {/* Call Type and Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallTypeColor(
                    call.type || call.callType
                  )}`}
                >
                  {getCallIcon(call.type || call.callType)}
                  <span className="ml-1">
                    {formatCallType(call.type || call.callType)}
                  </span>
                </span>

                {/* Call Status */}
                {call.status && (
                  <span
                    className={`text-xs font-medium ${getStatusColor(
                      call.status
                    )}`}
                  >
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </span>
                )}
              </div>

              {/* Call ID - Uncomment if needed */}
              {/* {(call.id || call.CallId) && (
                <span className="text-xs text-gray-500 font-mono">
                  #{call.id || call.CallId}
                </span>
              )} */}
            </div>

            {/* Call Details */}
            <div className="space-y-1">
              {/* Agent Information */}
              {(call.agent?.EmployeeName || call.agent?.name || call.agentName || call.agent) && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <User className="w-3 h-3" />
                  <span className="font-medium">Agent:</span>
                  <span>
                    {call.agent?.EmployeeName ||
                     call.agent?.name ||
                     call.agentName ||
                     (typeof call.agent === 'string' ? call.agent : 'Unknown Agent')}
                  </span>
                  {(call.agent?.EmployeePhone || call.agent?.phone || call.agentPhone) && (
                    <span className="text-gray-500">
                      ({call.agent?.EmployeePhone || call.agent?.phone || call.agentPhone})
                    </span>
                  )}
                </div>
              )}

              {/* Phone Numbers - Uncomment if needed */}
              {/* <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {call.customerNumber && (
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {call.customerNumber}
                  </div>
                )}
                {call.agentNumber && (
                  <div>
                    <span className="font-medium">Agent:</span>{" "}
                    {call.agentNumber}
                  </div>
                )}
              </div> */}

              {/* Call Times */}
              {(call.startTime || call.endTime) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {call.startTime && (
                    <div>
                      <span className="font-medium">Started:</span>{" "}
                      {formatTime(call.startTime)}
                    </div>
                  )}
                  {call.endTime && (
                    <div>
                      <span className="font-medium">Ended:</span>{" "}
                      {formatTime(call.endTime)}
                    </div>
                  )}
                </div>
              )}

              {/* Voice Recording - Uncomment if needed */}
              {/* {call.voiceRecording && call.voiceRecording !== "No Voice" && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Recording:</span>{" "}
                  {call.voiceRecording}
                </div>
              )} */}

              {/* Form Details */}
              {call.formDetail && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Form:</span>
                  <span className="text-green-600 ml-1">Completed</span>
                </div>
              )}
              {call.formDetail && call.formDetail.remarks && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Remark:</span>
                  <span className="text-black ml-1">
                    {call.formDetail.remarks}
                  </span>
                </div>
              )}

              {/* Legacy fields for backward compatibility - Uncomment if needed */}
              {/* {(call.category || call.subject) && (
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
              )} */}
            </div>

            {/* Additional Info - Uncomment if needed */}
            {/* {(call.satisfaction || call.priority) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  {call.priority && (
                    <span className="text-gray-600">
                      Priority:{" "}
                      <span className="font-medium">{call.priority}</span>
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
            )} */}
          </div>
        ))}
      </div>

      {/* Load More (if many calls) */}
      {callHistory.length >= 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing {callHistory.length} call records
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerCallHistory;
