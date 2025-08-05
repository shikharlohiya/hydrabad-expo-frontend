import React, { useState, useEffect, useContext } from "react";
import {
  PhoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../library/axios";
import UserContext from "../../../context/UserContext";
import useDialer from "../../../hooks/useDialer";

const ContactsPage = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active"); // Default to active

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(null);

  // Counts and statistics
  const [traderCounts, setTraderCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  
  const { userData } = useContext(UserContext);
  const { 
    initiateCall, 
    canInitiateCall, 
    isCallActive, 
    callStatus,
    setCurrentNumber,
    currentNumber,
    CALL_STATUS 
  } = useDialer();

  // Fetch traders data with pagination
  const fetchTraders = async (page = 1, limit = pageSize, status = selectedStatus, region = selectedRegion) => {
    const employeeId = userData?.EmployeeId;
    
    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }
      
      if (region) {
        params.append('region', region);
      }
      
      console.log(`Making API call to: /traders/employee/${employeeId}?${params.toString()}`);
      const response = await axiosInstance.get(
        `/traders/employee/${employeeId}?${params.toString()}`
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        const { traders, pagination, employeeInfo } = response.data.data;
        
        setTraders(traders || []);
        setPagination(pagination);
        setEmployeeInfo(employeeInfo);
        
        // Update pagination state
        if (pagination) {
          setCurrentPage(pagination.currentPage);
          setTotalPages(pagination.totalPages);
          setTotalRecords(pagination.totalRecords);
          setHasNextPage(pagination.hasNextPage);
          setHasPrevPage(pagination.hasPrevPage);
        }
      } else {
        setError("Failed to fetch traders data");
      }
    } catch (err) {
      console.error("Error fetching traders:", err);
      setError(err.response?.data?.message || "Failed to fetch traders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch trader counts
  const fetchTraderCounts = async () => {
    const employeeId = userData?.EmployeeId;
    
    if (!employeeId) {
      console.error("Employee ID not found for counts API");
      return;
    }
    
    try {
      setCountsLoading(true);
      
      console.log(`Making counts API call to: /traders/count/employee/${employeeId}`);
      const response = await axiosInstance.get(
        `/traders/count/employee/${employeeId}`
      );
      
      console.log("Counts API Response:", response.data);
      
      if (response.data.success) {
        setTraderCounts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching trader counts:", err);
    } finally {
      setCountsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userData) {
      fetchTraders();
      fetchTraderCounts();
    }
  }, [userData]);

  // Refetch when page, status, or region filter changes
  useEffect(() => {
    if (userData) {
      fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion);
    }
  }, [currentPage, pageSize, selectedStatus, selectedRegion]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRegionFilterChange = (region) => {
    setSelectedRegion(region);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Search functionality (client-side for now, could be moved to server-side)
  const filteredTraders = traders.filter((trader) => {
    if (!searchTerm) return true;
    return (
      trader.Trader_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.Trader_business_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.Contact_no?.includes(searchTerm) ||
      trader.Code?.includes(searchTerm) ||
      trader.Region?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Debug dialer state (only when needed)
  // console.log("🔍 Dialer Debug Info:", { callStatus, isCallActive });

  // Handle call button click
  const handleCall = (phoneNumber, traderName) => {
    console.log("🔍 handleCall called with:", { phoneNumber, traderName });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Initiating call to ${phoneNumber} for ${traderName}`);
      console.log("📋 Contact info being passed:", { name: traderName });
      
      // Set the current number first, then initiate call
      setCurrentNumber(phoneNumber);
      initiateCall(phoneNumber, { name: traderName });
      
      console.log("✅ Call initiated - form should open when call connects");
    } else {
      console.error("❌ No phone number provided");
    }
  };

  // Get unique regions and statuses for filters
  const uniqueRegions = traderCounts?.matchedRegions || [...new Set(traders.map((trader) => trader.Region))].filter(Boolean);
  const uniqueStatuses = traderCounts?.statusCounts?.map(s => s.status) || [...new Set(traders.map((trader) => trader.status))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Contacts</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traders Directory</h1>
            <p className="text-gray-600 mt-1">
              {searchTerm ? `${filteredTraders.length} filtered` : `${traders.length}`} of {totalRecords} traders
              {pagination && (
                <span className="ml-2 text-sm">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
            {employeeInfo && (
              <p className="text-sm text-blue-600 mt-1">
                Region: {employeeInfo.region}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="text-sm text-gray-500">Total Contacts</span>
            </div>
            {traderCounts && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {traderCounts.statusCounts?.find(s => s.status === 'active')?.count || 0}
                </div>
                <span className="text-sm text-gray-500">Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Regions</option>
            {uniqueRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {traderCounts?.statusCounts?.find(s => s.status === status) && 
                  ` (${traderCounts.statusCounts.find(s => s.status === status).count})`
                }
              </option>
            ))}
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              handleRegionFilterChange("");
              handleStatusFilterChange("active"); // Set to active instead of empty
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion);
              fetchTraderCounts();
            }}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Traders List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredTraders.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No traders found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedRegion || selectedStatus
                ? "Try adjusting your search or filter criteria"
                : "No traders available for your region"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trader Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTraders.map((trader) => (
                  <tr key={trader.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-800">
                              {trader.Trader_Name?.charAt(0) || "T"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {trader.Trader_Name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Code: {trader.Code}
                          </div>
                          <div className="text-sm text-gray-500">
                            📞 {trader.Contact_no}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trader.Trader_business_Name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{trader.Region}</div>
                          <div className="text-sm text-gray-500">{trader.Zone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trader.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {trader.status === "active" ? (
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        )}
                        {trader.status?.charAt(0).toUpperCase() + trader.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCall(trader.Contact_no, trader.Trader_Name)}
                        disabled={!trader.Contact_no}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          trader.Contact_no
                            ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          !trader.Contact_no
                            ? "No phone number available"
                            : "Click to call"
                        }
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {((currentPage - 1) * pageSize) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalRecords)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{totalRecords}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats from API */}
      {traderCounts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Traders</dt>
                    <dd className="text-lg font-medium text-gray-900">{traderCounts.totalCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Traders</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {traderCounts.statusCounts?.find(s => s.status === 'active')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Inactive Traders</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {traderCounts.statusCounts?.find(s => s.status === 'inactive')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Regions</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {traderCounts.matchedRegions?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Breakdown */}
      {traderCounts?.zoneCounts && traderCounts.zoneCounts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Zone-wise Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {traderCounts.zoneCounts.map((zone) => (
              <div key={zone.zone} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-indigo-600">{zone.count}</div>
                <div className="text-sm font-medium text-gray-500">{zone.zone}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
