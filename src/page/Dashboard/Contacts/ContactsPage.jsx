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
      <div className="space-y-4">
        <div className="animate-pulse">
          {/* Header Skeleton with Shimmer */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-64 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-12 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search and Filters Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="h-10 bg-gray-200 rounded w-80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded w-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Skeleton with Shimmer */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-14 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-18 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="h-4 bg-gray-200 rounded w-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                        </div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-24 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="h-6 bg-gray-200 rounded-full w-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-8 bg-gray-200 rounded w-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded w-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add custom shimmer animation styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .animate-shimmer {
            animation: shimmer 1.5s infinite;
          }
        `}</style>
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
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Traders Directory</h1>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? `${filteredTraders.length} filtered` : `${traders.length}`} of {totalRecords} traders
                {pagination && (
                  <span className="ml-2">
                    • Page {currentPage} of {totalPages}
                  </span>
                )}
                {employeeInfo && (
                  <span className="ml-2 text-blue-600">
                    • {employeeInfo.region}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Compact Stats Row */}
          {traderCounts && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-base font-semibold text-indigo-600">{traderCounts.totalCount}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-base font-semibold text-green-600">
                  {traderCounts.statusCounts?.find(s => s.status === 'active')?.count || 0}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-base font-semibold text-red-600">
                  {traderCounts.statusCounts?.find(s => s.status === 'inactive')?.count || 0}
                </div>
                <div className="text-xs text-gray-500">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-base font-semibold text-blue-600">
                  {traderCounts.matchedRegions?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Regions</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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

      {/* Traders List - Compact Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredTraders.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No traders found</h3>
            <p className="text-xs text-gray-600">
              {searchTerm || selectedRegion || selectedStatus
                ? "Try adjusting your search criteria"
                : "No traders available"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trader
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTraders.map((trader) => (
                  <tr key={trader.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-800">
                              {trader.Trader_Name?.charAt(0) || "T"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {trader.Trader_Name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {trader.Code} • {trader.Contact_no}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={trader.Trader_business_Name}>
                        {trader.Trader_business_Name || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{trader.Region}</div>
                      <div className="text-xs text-gray-500">{trader.Zone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          trader.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          trader.status === "active" ? "bg-green-600" : "bg-red-600"
                        }`}></div>
                        {trader.status?.charAt(0).toUpperCase() + trader.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCall(trader.Contact_no, trader.Trader_Name)}
                        disabled={!trader.Contact_no}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                          trader.Contact_no
                            ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          !trader.Contact_no
                            ? "No phone number"
                            : "Click to call"
                        }
                      >
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

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
                          className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
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
                    className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContactsPage;
