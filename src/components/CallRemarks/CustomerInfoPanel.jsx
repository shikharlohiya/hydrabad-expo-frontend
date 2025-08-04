import React from "react";
import { User, Mail, Calendar, Phone, Shield, Activity } from "lucide-react";

const CustomerInfoPanel = ({ customerData, phoneNumber }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-700 bg-green-100";
      case "inactive":
        return "text-red-700 bg-red-100";
      case "pending":
        return "text-yellow-700 bg-yellow-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "premium":
        return "text-purple-700 bg-purple-100";
      case "standard":
        return "text-blue-700 bg-blue-100";
      case "basic":
        return "text-gray-700 bg-gray-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const calculateYears = (joinDate) => {
    if (!joinDate) return 0;
    try {
      const years = Math.floor(
        (new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24 * 365)
      );
      return years > 0 ? years : 0;
    } catch {
      return 0;
    }
  };

  if (!customerData) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 text-sm">No customer data available</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Customer Header */}
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-lg truncate">
            {customerData.name || "Unknown Customer"}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            ID: {customerData.accountId || customerData.customerId || "N/A"}
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                customerData.status
              )}`}
            >
              {customerData.status || "Unknown"}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(
                customerData.accountType
              )}`}
            >
              <Shield className="w-3 h-3 mr-1" />
              {customerData.accountType || "Basic"}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
          Contact Information
        </h5>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-900">
              {phoneNumber || customerData.phoneNumber || "N/A"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-900 truncate">
              {customerData.email || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
          Account Details
        </h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Join Date</div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900">
                {formatDate(customerData.joinDate || customerData.createdAt)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Last Activity</div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900">
                {formatDate(
                  customerData.lastActivity || customerData.updatedAt
                )}
              </span>
            </div>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Total Calls</div>
            <span className="text-gray-900 font-medium">
              {customerData.totalCalls || 0}
            </span>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Years Active</div>
            <span className="text-gray-900 font-medium">
              {calculateYears(customerData.joinDate || customerData.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info (if available) */}
      {(customerData.notes || customerData.description) && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Notes
          </h5>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              {customerData.notes || customerData.description}
            </p>
          </div>
        </div>
      )}

      {/* Customer Summary */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
          Summary
        </h5>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {customerData.accountType || "Basic"} customer active for{" "}
            {calculateYears(customerData.joinDate || customerData.createdAt)}{" "}
            years
            {customerData.totalCalls > 0 &&
              ` with ${customerData.totalCalls} previous calls`}
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoPanel;
