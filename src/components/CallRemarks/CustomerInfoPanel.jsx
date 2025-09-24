import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Phone,
  Shield,
  Activity,
  Building2,
  MapPin,
  Database,
  UserCheck,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";
import SapCustomerDetails from "./SapCustomerDetails";
import { fetchSapCustomerDetailsWithCache } from "../../services/sapCustomerService";

const CustomerInfoPanel = ({ customerData, phoneNumber, hasSearched = false }) => {
  // SAP customer data state
  const [sapCustomerData, setSapCustomerData] = useState(null);
  const [sapLoading, setSapLoading] = useState(false);
  const [sapError, setSapError] = useState(null);

  // SAP search state
  const [sapSearchInput, setSapSearchInput] = useState(phoneNumber || "");
  const [searchedNumber, setSearchedNumber] = useState(phoneNumber || "");

  // Update search input when phoneNumber prop changes
  useEffect(() => {
    if (phoneNumber) {
      setSapSearchInput(phoneNumber);
      setSearchedNumber(phoneNumber);
    }
  }, [phoneNumber]);

  // Fetch SAP customer details when searched number changes
  useEffect(() => {
    const fetchSapData = async () => {
      if (!searchedNumber) {
        setSapCustomerData(null);
        setSapError(null);
        return;
      }

      setSapLoading(true);
      setSapError(null);

      try {
        console.log("🔍 CustomerInfoPanel: Starting SAP fetch for:", searchedNumber);
        const result = await fetchSapCustomerDetailsWithCache(searchedNumber);
        console.log("✅ CustomerInfoPanel: SAP fetch result:", result);

        if (result && result.success) {
          setSapCustomerData(result.data);
          setSapError(null);
        } else {
          setSapCustomerData(null);
          setSapError(result?.message || "Failed to fetch SAP customer details");
        }
      } catch (error) {
        console.error("❌ CustomerInfoPanel: Error fetching SAP customer details:", error);
        setSapCustomerData(null);
        setSapError("Network error while fetching SAP customer details");
      } finally {
        setSapLoading(false);
      }
    };

    // Add error boundary around the async function
    try {
      fetchSapData();
    } catch (error) {
      console.error("❌ CustomerInfoPanel: Error in useEffect:", error);
      setSapLoading(false);
      setSapError("Failed to initialize SAP data fetch");
    }
  }, [searchedNumber]);

  // Handle SAP search
  const handleSapSearch = () => {
    if (sapSearchInput.trim()) {
      setSearchedNumber(sapSearchInput.trim());
    }
  };

  const handleRefreshSap = () => {
    if (searchedNumber) {
      // Clear cache and refetch
      setSapCustomerData(null);
      setSapError(null);
      const fetchSapData = async () => {
        setSapLoading(true);
        try {
          const result = await fetchSapCustomerDetailsWithCache(searchedNumber, true); // Force refresh
          if (result && result.success) {
            setSapCustomerData(result.data);
            setSapError(null);
          } else {
            setSapCustomerData(null);
            setSapError(result?.message || "Failed to fetch SAP customer details");
          }
        } catch (error) {
          console.error("❌ Error refreshing SAP data:", error);
          setSapCustomerData(null);
          setSapError("Network error while fetching SAP customer details");
        } finally {
          setSapLoading(false);
        }
      };
      fetchSapData();
    }
  };
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
      case "trader":
        return "text-blue-700 bg-blue-100";
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

  // Show appropriate message when no internal customer data but we might have SAP data
  const showNoCustomerMessage = !customerData && hasSearched;
  const showSearchPrompt = !customerData && !hasSearched;

  const { traderMaster, contactInfo } = customerData || {};

  return (
    <div className="p-4 space-y-6">
      {/* SAP Search Interface */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <h5 className="text-sm font-medium text-gray-900">SAP Customer Search</h5>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={sapSearchInput}
              onChange={(e) => setSapSearchInput(e.target.value)}
              placeholder="Enter mobile number..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSapSearch()}
            />
          </div>
          <button
            onClick={handleSapSearch}
            disabled={sapLoading || !sapSearchInput.trim()}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button
            onClick={handleRefreshSap}
            disabled={sapLoading || !searchedNumber}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${sapLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Current Search Info */}
        {searchedNumber && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700 text-sm">
              <Database className="w-4 h-4" />
              <span>
                {sapLoading
                  ? `Searching SAP for: ${searchedNumber}...`
                  : `SAP search results for: ${searchedNumber}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Show search prompt */}
      {showSearchPrompt && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Search for customer information to view details</p>
        </div>
      )}

      {/* Show no customer message but still allow SAP data */}
      {showNoCustomerMessage && (
        <div className="text-center py-4">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No customer information found in internal system</p>
          <p className="text-xs text-gray-400 mt-1">Checking SAP system for customer details...</p>
        </div>
      )}

      {/* Customer Header - only show if we have customerData */}
      {customerData && (
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-lg truncate">
              {customerData.name || "Unknown Trader"}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Phone: {searchedNumber || phoneNumber || customerData.phoneNumber || "N/A"}
            </p>

            {/* Account ID */}
            {customerData.accountId && (
              <p className="text-sm text-gray-500 mt-1">
                Code: {customerData.accountId}
              </p>
            )}

            {/* Business Name */}
            {customerData.businessName && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                {customerData.businessName}
              </p>
            )}

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
                {customerData.accountType || "Trader"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trader Master Data */}
      {traderMaster && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1 flex items-center">
            <Database className="w-4 h-4 mr-2 text-blue-500" />
            Master Record
          </h5>
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900 font-medium">
                  {traderMaster.Trader_Name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Business:</span>
                <span className="text-gray-900">
                  {traderMaster.Trader_business_Name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="text-gray-900 font-mono">
                  {traderMaster.Code || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Region:</span>
                <span className="text-gray-900">
                  {traderMaster.Region || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Zone:</span>
                <span className="text-gray-900">
                  {traderMaster.Zone || "N/A"}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${getStatusColor(
                    traderMaster.status
                  )}`}
                >
                  {traderMaster.status || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {formatDate(traderMaster.createdAt)}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Contact Directory Data */}
      {contactInfo && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1 flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-green-500" />
            Saved Contact in Directory
          </h5>
          <div className="bg-green-50 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900 font-medium">
                  {contactInfo.Contact_Name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900">
                  {contactInfo.Type || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Region:</span>
                <span className="text-gray-900">
                  {contactInfo.Region || "N/A"}
                </span>
              </div>
              {contactInfo.Zone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Zone:</span>
                  <span className="text-gray-900">{contactInfo.Zone}</span>
                </div>
              )}
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    contactInfo.isActive
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {contactInfo.isActive ? "Active" : "Inactive"}
                </span>
              </div> */}
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Added:</span>
                <span className="text-gray-900">
                  {formatDate(contactInfo.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-gray-900">
                  {formatDate(contactInfo.updatedAt)}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Contact Information - Always show if we have a phone number */}
      {(searchedNumber || phoneNumber) && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Contact Information
          </h5>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">
                {searchedNumber || phoneNumber}
              </span>
            </div>
            {customerData?.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">
                  {customerData.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Information - Only show if we have customer data */}
      {customerData && (customerData.businessName || customerData.region || customerData.zone) && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Business Information
          </h5>
          <div className="space-y-2">
            {customerData.businessName && (
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">
                  {customerData.businessName}
                </span>
              </div>
            )}
            {(customerData.region || customerData.zone) && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">
                  {[customerData.region, customerData.zone]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-up Information */}
      {/* {(customerData.lastActionDate ||
        customerData.followUpDate ||
        customerData.completedOn) && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Follow-up Details
          </h5>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {customerData.lastActionDate && (
              <div>
                <div className="text-gray-500 mb-1">Last Action Date</div>
                <span className="text-gray-900">
                  {formatDate(customerData.lastActionDate)}
                </span>
              </div>
            )}
            {customerData.followUpDate && (
              <div>
                <div className="text-gray-500 mb-1">Follow-up Date</div>
                <span className="text-gray-900">
                  {formatDate(customerData.followUpDate)}
                </span>
              </div>
            )}
            {customerData.completedOn && (
              <div>
                <div className="text-gray-500 mb-1">Completed On</div>
                <span className="text-gray-900">
                  {formatDate(customerData.completedOn)}
                </span>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Agent Information */}
      {/* {customerData.agentId && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Agent Information
          </h5>
          <div className="text-sm">
            <div className="text-gray-500 mb-1">Assigned Agent ID</div>
            <span className="text-gray-900 font-medium">
              {customerData.agentId}
            </span>
          </div>
        </div>
      )} */}

      {/* Call Statistics */}
      {/* {customerData.totalCalls !== undefined && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
            Call Statistics
          </h5>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Calls:</span>
              <span className="text-sm font-medium text-gray-900">
                {customerData.totalCalls}
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Data Source Info */}
      {/* <div className="space-y-3">
        <h5 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
          Data Sources
        </h5>
        <div className="flex flex-wrap gap-2">
          {traderMaster && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
              <Database className="w-3 h-3 mr-1" />
              Master Record
            </span>
          )}
          {contactInfo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
              <UserCheck className="w-3 h-3 mr-1" />
              Contact Directory
            </span>
          )}
        </div>
      </div> */}

      {/* SAP Customer Details Section */}
      <div className={`${customerData ? "border-t border-gray-200 pt-4" : ""}`}>
        <SapCustomerDetails
          sapData={sapCustomerData}
          isLoading={sapLoading}
          error={sapError}
        />
      </div>
    </div>
  );
};

export default CustomerInfoPanel;
