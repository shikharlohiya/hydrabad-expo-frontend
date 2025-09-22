import React from "react";
import {
  User,
  Building2,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Phone,
  Hash,
} from "lucide-react";

const SapCustomerDetails = ({ sapData, isLoading, error }) => {
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    // Remove any existing currency symbols and clean the string
    const cleanAmount = amount.toString().replace(/[₹,\s]/g, "");
    const numAmount = parseFloat(cleanAmount);

    if (isNaN(numAmount)) return amount;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Math.abs(numAmount));
  };

  const getStatusColor = (status) => {
    if (!status) return "text-gray-700 bg-gray-100";

    switch (status.toLowerCase()) {
      case "active":
        return "text-green-700 bg-green-100";
      case "inactive":
        return "text-red-700 bg-red-100";
      case "blocked":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getCreditStatus = (outstanding, limit) => {
    if (!outstanding || !limit) return "normal";

    const outstandingAmount = parseFloat(outstanding.toString().replace(/[₹,\s-]/g, ""));
    const limitAmount = parseFloat(limit.toString().replace(/[₹,\s]/g, ""));

    if (outstandingAmount > limitAmount) return "overdue";
    if (outstandingAmount > limitAmount * 0.8) return "warning";
    return "normal";
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <XCircle className="w-4 h-4" />
          <span>Error loading SAP data: {error}</span>
        </div>
      </div>
    );
  }

  if (!sapData) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 text-sm">
          No SAP customer data available
        </div>
        <div className="text-xs text-gray-400 mt-1">
          SAP customer details will appear here when available
        </div>
      </div>
    );
  }

  const creditStatus = getCreditStatus(sapData.CustomerOutst, sapData.CreditLimit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
        <Database className="w-4 h-4 text-blue-500" />
        <h5 className="font-medium text-gray-900 text-sm">SAP Customer Details</h5>
        {sapData.Result && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
      </div>

      {/* Customer Basic Info */}
      <div className="bg-blue-50 rounded-lg p-3 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h6 className="font-semibold text-gray-900 text-base truncate">
              {sapData.CustomerName || "Unknown Customer"}
            </h6>
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="w-3 h-3 text-gray-500" />
              <span className="text-sm text-gray-600">{sapData.MobileNumber}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Hash className="w-3 h-3 text-gray-500" />
              <span className="text-sm text-gray-600 font-mono">
                Customer ID: {sapData.Kunnr}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {sapData.CustomerStatus && (
          <div className="flex items-center justify-start">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                sapData.CustomerStatus
              )}`}
            >
              {sapData.CustomerStatus}
            </span>
          </div>
        )}
      </div>

      {/* Address Information */}
      <div className="space-y-2">
        <h6 className="font-medium text-gray-900 text-sm flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-500" />
          Address
        </h6>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
          <div>{sapData.Address}</div>
          <div className="mt-1">
            {sapData.City}
            {sapData.Pincode && `, ${sapData.Pincode}`}
          </div>
          <div className="mt-1 text-gray-600">
            {sapData.RegionDesc} ({sapData.Region})
          </div>
        </div>
      </div>

      {/* Sales Information */}
      <div className="space-y-2">
        <h6 className="font-medium text-gray-900 text-sm flex items-center">
          <Building2 className="w-4 h-4 mr-1 text-gray-500" />
          Sales Information
        </h6>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Sales Group</div>
            <div className="font-medium text-gray-900">
              {sapData.SalesDesc} ({sapData.SalesGroup})
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Sales Office</div>
            <div className="font-medium text-gray-900">
              {sapData.salesOffDesc} ({sapData.SalesOffice})
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Branch</div>
            <div className="font-medium text-gray-900">{sapData.Branch}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Division</div>
            <div className="font-medium text-gray-900">{sapData.Division}</div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-2">
        <h6 className="font-medium text-gray-900 text-sm flex items-center">
          <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
          Financial Details
        </h6>

        {/* Credit Status Alert */}
        {creditStatus === "overdue" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700 font-medium">
              Credit Limit Exceeded
            </span>
          </div>
        )}

        {creditStatus === "warning" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-700 font-medium">
              Near Credit Limit
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Credit Limit</div>
            <div className="font-semibold text-gray-900 text-sm">
              {formatCurrency(sapData.CreditLimit)}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Outstanding Amount</div>
            <div className={`font-semibold text-sm ${
              creditStatus === "overdue" ? "text-red-600" :
              creditStatus === "warning" ? "text-yellow-600" : "text-gray-900"
            }`}>
              {formatCurrency(sapData.CustomerOutst)}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Credit Overdue</div>
            <div className="font-medium text-red-600">
              {formatCurrency(sapData.CreditOverdue)}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Credit Remaining</div>
            <div className="font-medium text-green-600">
              {formatCurrency(sapData.CreditRem)}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Credit Days</div>
            <div className="font-medium text-gray-900">
              {sapData.CreaditDays} days
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500">Open Orders</div>
            <div className="font-medium text-gray-900">
              {sapData.OpenOrder}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <h6 className="font-medium text-gray-900 text-sm">Additional Information</h6>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {sapData.VirtualAccount && (
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Virtual Account</div>
              <div className="font-mono text-gray-900 text-xs">
                {sapData.VirtualAccount}
              </div>
            </div>
          )}

          {sapData.ClearAddr && (
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Clear Address</div>
              <div className="font-medium text-gray-900">{sapData.ClearAddr}</div>
            </div>
          )}

          {sapData.DistriChallan && (
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Distribution Challan</div>
              <div className="font-medium text-gray-900">{sapData.DistriChallan}</div>
            </div>
          )}

          {sapData.SalesOrg && (
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Sales Organization</div>
              <div className="font-medium text-gray-900">{sapData.SalesOrg}</div>
            </div>
          )}
        </div>
      </div>

      {/* Remark */}
      {sapData.Remark && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-xs text-green-700 font-medium">
            {sapData.Remark}
          </div>
        </div>
      )}
    </div>
  );
};

export default SapCustomerDetails;