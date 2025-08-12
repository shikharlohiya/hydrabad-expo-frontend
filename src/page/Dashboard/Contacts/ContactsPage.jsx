// import React, { useState, useEffect, useContext } from "react";
// import {
//   PhoneIcon,
//   MagnifyingGlassIcon,
//   FunnelIcon,
//   UserGroupIcon,
//   BuildingOfficeIcon,
//   MapPinIcon,
//   CalendarIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   ChartBarIcon,
// } from "@heroicons/react/24/outline";
// import axiosInstance from "../../../library/axios";
// import UserContext from "../../../context/UserContext";
// import useDialer from "../../../hooks/useDialer";

// const ContactsPage = () => {
//   const [traders, setTraders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("active"); // Default to active

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [hasNextPage, setHasNextPage] = useState(false);
//   const [hasPrevPage, setHasPrevPage] = useState(false);
//   const [pageSize, setPageSize] = useState(20);
//   const [pagination, setPagination] = useState(null);

//   // Counts and statistics
//   const [traderCounts, setTraderCounts] = useState(null);
//   const [countsLoading, setCountsLoading] = useState(false);
//   const [employeeInfo, setEmployeeInfo] = useState(null);
  
//   const { userData } = useContext(UserContext);
//   const { 
//     initiateCall, 
//     canInitiateCall, 
//     isCallActive, 
//     callStatus,
//     setCurrentNumber,
//     currentNumber,
//     CALL_STATUS 
//   } = useDialer();

//   // Fetch traders data with pagination
//   const fetchTraders = async (page = 1, limit = pageSize, status = selectedStatus, region = selectedRegion, search = searchTerm) => {
//     const employeeId = userData?.EmployeeId;
    
//     if (!employeeId) {
//       setError("Employee ID not found. Please login again.");
//       setLoading(false);
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
      
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: limit.toString(),
//       });
      
//       if (status) {
//         params.append('status', status);
//       }
      
//       if (region) {
//         params.append('region', region);
//       }
      
//       // Add search parameter for server-side search
//       if (search && search.trim()) {
//         params.append('search', search.trim());
//       }
      
//       console.log(`Making API call to: /traders/employee/${employeeId}?${params.toString()}`);
//       const response = await axiosInstance.get(
//         `/traders/employee/${employeeId}?${params.toString()}`
//       );
      
//       console.log("API Response:", response.data);
      
//       if (response.data.success) {
//         const { traders, pagination, employeeInfo } = response.data.data;
        
//         setTraders(traders || []);
//         setPagination(pagination);
//         setEmployeeInfo(employeeInfo);
        
//         // Update pagination state
//         if (pagination) {
//           setCurrentPage(pagination.currentPage);
//           setTotalPages(pagination.totalPages);
//           setTotalRecords(pagination.totalRecords);
//           setHasNextPage(pagination.hasNextPage);
//           setHasPrevPage(pagination.hasPrevPage);
//         }
//       } else {
//         setError("Failed to fetch traders data");
//       }
//     } catch (err) {
//       console.error("Error fetching traders:", err);
//       setError(err.response?.data?.message || "Failed to fetch traders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch trader counts
//   const fetchTraderCounts = async () => {
//     const employeeId = userData?.EmployeeId;
    
//     if (!employeeId) {
//       console.error("Employee ID not found for counts API");
//       return;
//     }
    
//     try {
//       setCountsLoading(true);
      
//       console.log(`Making counts API call to: /traders/count/employee/${employeeId}`);
//       const response = await axiosInstance.get(
//         `/traders/count/employee/${employeeId}`
//       );
      
//       console.log("Counts API Response:", response.data);
      
//       if (response.data.success) {
//         setTraderCounts(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching trader counts:", err);
//     } finally {
//       setCountsLoading(false);
//     }
//   };

//   // Initial data fetch
//   useEffect(() => {
//     if (userData) {
//       fetchTraders();
//       fetchTraderCounts();
//     }
//   }, [userData]);

//   // Refetch when page, status, or region filter changes
//   useEffect(() => {
//     if (userData) {
//       fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion, searchTerm);
//     }
//   }, [currentPage, pageSize, selectedStatus, selectedRegion]);

//   // Handle search with debouncing
//   useEffect(() => {
//     if (userData) {
//       // Reset to first page when searching
//       const delayedSearch = setTimeout(() => {
//         if (currentPage === 1) {
//           fetchTraders(1, pageSize, selectedStatus, selectedRegion, searchTerm);
//         } else {
//           setCurrentPage(1); // This will trigger the above useEffect
//         }
//       }, 500); // 500ms delay for debouncing

//       return () => clearTimeout(delayedSearch);
//     }
//   }, [searchTerm]);

//   // Pagination handlers
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const handlePageSizeChange = (newPageSize) => {
//     setPageSize(newPageSize);
//     setCurrentPage(1); // Reset to first page when changing page size
//   };

//   const handleStatusFilterChange = (status) => {
//     setSelectedStatus(status);
//     setCurrentPage(1); // Reset to first page when filtering
//   };

//   const handleRegionFilterChange = (region) => {
//     setSelectedRegion(region);
//     setCurrentPage(1); // Reset to first page when filtering
//   };

//   // Note: Search is now handled server-side, so we use traders directly

//   // Debug dialer state (only when needed)
//   // console.log("🔍 Dialer Debug Info:", { callStatus, isCallActive });

//   // Handle call button click
//   const handleCall = (phoneNumber, traderName) => {
//     console.log("🔍 handleCall called with:", { phoneNumber, traderName });
//     if (phoneNumber && phoneNumber.trim() !== "") {
//       console.log(`📞 Initiating call to ${phoneNumber} for ${traderName}`);
//       console.log("📋 Contact info being passed:", { name: traderName });
      
//       // Set the current number first, then initiate call
//       setCurrentNumber(phoneNumber);
//       initiateCall(phoneNumber, { name: traderName });
      
//       console.log("✅ Call initiated - form should open when call connects");
//     } else {
//       console.error("❌ No phone number provided");
//     }
//   };

//   // Get unique regions and statuses for filters
//   const uniqueRegions = traderCounts?.matchedRegions || [];
//   const uniqueStatuses = traderCounts?.statusCounts?.map(s => s.status) || [];

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         <div className="animate-pulse">
//           {/* Header Skeleton with Shimmer */}
//           <div className="bg-white shadow rounded-lg">
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <div className="h-6 bg-gray-200 rounded w-48 mb-2 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-4 bg-gray-200 rounded w-64 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Cards Skeleton */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//                 {[...Array(4)].map((_, i) => (
//                   <div key={i} className="bg-gray-50 rounded-lg p-4">
//                     <div className="h-4 bg-gray-200 rounded w-20 mb-2 relative overflow-hidden">
//                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                     </div>
//                     <div className="h-8 bg-gray-200 rounded w-12 relative overflow-hidden">
//                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Search and Filters Skeleton */}
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="h-10 bg-gray-200 rounded w-80 relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <div className="h-10 bg-gray-200 rounded w-24 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-32 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-28 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Table Skeleton with Shimmer */}
//           <div className="bg-white shadow rounded-lg overflow-hidden">
//             {/* Table Header */}
//             <div className="bg-gray-50 px-6 py-3">
//               <div className="grid grid-cols-12 gap-4">
//                 <div className="col-span-3">
//                   <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="h-4 bg-gray-200 rounded w-14 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="h-4 bg-gray-200 rounded w-18 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="col-span-1">
//                   <div className="h-4 bg-gray-200 rounded w-12 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Table Rows */}
//             <div className="divide-y divide-gray-200">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="px-6 py-4">
//                   <div className="grid grid-cols-12 gap-4">
//                     <div className="col-span-3">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
//                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                         </div>
//                         <div>
//                           <div className="h-4 bg-gray-200 rounded w-32 mb-1 relative overflow-hidden">
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                           </div>
//                           <div className="h-3 bg-gray-200 rounded w-24 relative overflow-hidden">
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                       </div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                       </div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                       </div>
//                     </div>
//                     <div className="col-span-1">
//                       <div className="h-6 bg-gray-200 rounded-full w-16 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                       </div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="h-8 bg-gray-200 rounded w-20 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Pagination Skeleton */}
//           <div className="bg-white shadow rounded-lg">
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div className="h-4 bg-gray-200 rounded w-40 relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <div className="h-10 bg-gray-200 rounded w-20 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-8 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-8 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded w-20 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Add custom shimmer animation styles */}
//         <style jsx>{`
//           @keyframes shimmer {
//             0% {
//               transform: translateX(-100%);
//             }
//             100% {
//               transform: translateX(100%);
//             }
//           }

//           .animate-shimmer {
//             animation: shimmer 1.5s infinite;
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Contacts</h3>
//           <p className="text-gray-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Compact Header with Stats */}
//       <div className="bg-white shadow rounded-lg">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-xl font-semibold text-gray-900">Traders Directory</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 {traders.length} of {totalRecords} traders
//                 {pagination && (
//                   <span className="ml-2">
//                     • Page {currentPage} of {totalPages}
//                   </span>
//                 )}
//                 {employeeInfo && (
//                   <span className="ml-2 text-blue-600">
//                     • {employeeInfo.region}
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>

//           {/* Compact Stats Row */}
//           {traderCounts && (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
//               <div className="text-center">
//                 <div className="text-base font-semibold text-indigo-600">{traderCounts.totalCount}</div>
//                 <div className="text-xs text-gray-500">Total</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-base font-semibold text-green-600">
//                   {traderCounts.statusCounts?.find(s => s.status === 'active')?.count || 0}
//                 </div>
//                 <div className="text-xs text-gray-500">Active</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-base font-semibold text-red-600">
//                   {traderCounts.statusCounts?.find(s => s.status === 'inactive')?.count || 0}
//                 </div>
//                 <div className="text-xs text-gray-500">Inactive</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-base font-semibold text-blue-600">
//                   {traderCounts.matchedRegions?.length || 0}
//                 </div>
//                 <div className="text-xs text-gray-500">Regions</div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white shadow rounded-lg p-4">
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//           {/* Search */}
//           <div className="relative">
//             <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search traders..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           {/* Region Filter */}
//           <select
//             value={selectedRegion}
//             onChange={(e) => handleRegionFilterChange(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//           >
//             <option value="">All Regions</option>
//             {uniqueRegions.map((region) => (
//               <option key={region} value={region}>
//                 {region}
//               </option>
//             ))}
//           </select>

//           {/* Status Filter */}
//           <select
//             value={selectedStatus}
//             onChange={(e) => handleStatusFilterChange(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//           >
//             {uniqueStatuses.map((status) => (
//               <option key={status} value={status}>
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//                 {traderCounts?.statusCounts?.find(s => s.status === status) && 
//                   ` (${traderCounts.statusCounts.find(s => s.status === status).count})`
//                 }
//               </option>
//             ))}
//           </select>

//           {/* Page Size */}
//           <select
//             value={pageSize}
//             onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//           >
//             <option value={10}>10 per page</option>
//             <option value={20}>20 per page</option>
//             <option value={50}>50 per page</option>
//             <option value={100}>100 per page</option>
//           </select>

//           {/* Clear Filters */}
//           <button
//             onClick={() => {
//               setSearchTerm("");
//               handleRegionFilterChange("");
//               handleStatusFilterChange("active"); // Set to active instead of empty
//             }}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Clear Filters
//           </button>

//           {/* Refresh */}
//           <button
//             onClick={() => {
//               fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion, searchTerm);
//               fetchTraderCounts();
//             }}
//             disabled={loading}
//             className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? "Loading..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       {/* Traders List - Compact Table */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         {traders.length === 0 ? (
//           <div className="text-center py-8">
//             <UserGroupIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
//             <h3 className="text-sm font-medium text-gray-900 mb-1">No traders found</h3>
//             <p className="text-xs text-gray-600">
//               {searchTerm || selectedRegion || selectedStatus
//                 ? "Try adjusting your search criteria"
//                 : "No traders available"}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Trader
//                   </th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Business
//                   </th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Location
//                   </th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {traders.map((trader) => (
//                   <tr key={trader.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-8 w-8">
//                           <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
//                             <span className="text-xs font-medium text-indigo-800">
//                               {trader.Trader_Name?.charAt(0) || "T"}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="ml-3 min-w-0 flex-1">
//                           <div className="text-sm font-medium text-gray-900 truncate">
//                             {trader.Trader_Name || "N/A"}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {trader.Code} • {trader.Contact_no}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="text-sm text-gray-900 max-w-xs truncate" title={trader.Trader_business_Name}>
//                         {trader.Trader_business_Name || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="text-sm text-gray-900">{trader.Region}</div>
//                       <div className="text-xs text-gray-500">{trader.Zone}</div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           trader.status === "active"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                           trader.status === "active" ? "bg-green-600" : "bg-red-600"
//                         }`}></div>
//                         {trader.status?.charAt(0).toUpperCase() + trader.status?.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => handleCall(trader.Contact_no, trader.Trader_Name)}
//                         disabled={!trader.Contact_no}
//                         className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white focus:outline-none focus:ring-1 focus:ring-offset-1 ${
//                           trader.Contact_no
//                             ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
//                             : "bg-gray-400 cursor-not-allowed"
//                         }`}
//                         title={
//                           !trader.Contact_no
//                             ? "No phone number"
//                             : "Click to call"
//                         }
//                       >
//                         <PhoneIcon className="h-3 w-3 mr-1" />
//                         Call
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Compact Pagination */}
//         {totalPages > 1 && (
//           <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-200">
//             <div className="flex-1 flex justify-between sm:hidden">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={!hasPrevPage}
//                 className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={!hasNextPage}
//                 className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//               </button>
//             </div>
//             <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-xs text-gray-600">
//                   Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
//                 </p>
//               </div>
//               <div>
//                 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!hasPrevPage}
//                     className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <ChevronLeftIcon className="h-4 w-4" />
//                   </button>

//                   {(() => {
//                     const pages = [];
//                     const maxVisiblePages = 5;
//                     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//                     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
//                     if (endPage - startPage + 1 < maxVisiblePages) {
//                       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//                     }

//                     for (let i = startPage; i <= endPage; i++) {
//                       pages.push(
//                         <button
//                           key={i}
//                           onClick={() => handlePageChange(i)}
//                           className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
//                             i === currentPage
//                               ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
//                               : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
//                           }`}
//                         >
//                           {i}
//                         </button>
//                       );
//                     }
//                     return pages;
//                   })()}

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!hasNextPage}
//                     className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <ChevronRightIcon className="h-4 w-4" />
//                   </button>
//                 </nav>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default ContactsPage;






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
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  ClockIcon,
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
  const [selectedStatus, setSelectedStatus] = useState("active");

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState(null);

  // Remarks expansion state
  const [expandedRemarks, setExpandedRemarks] = useState(new Set());

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

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No data";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "No data";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "No remarks";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Helper function to get form status
  const getFormStatus = (trader) => {
    if (trader.latestCall?.FormDetail?.status) {
      return trader.latestCall.FormDetail.status;
    }
    return "no-call"; // Default status when no call history exists
  };

  // Helper function to get form status badge classes
  const getFormStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "closed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "open":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "no-call":
        return `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  // Helper function to get status display text (UPDATED)
  const getStatusDisplayText = (status) => {
    switch (status) {
      case "closed":
        return "Closed";
      case "open":
        return "Open";
      case "no-call":
        return "-"; // Changed from "No Call" to "-"
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // Helper function to toggle remarks expansion
  const toggleRemarksExpansion = (traderId) => {
    const newExpanded = new Set(expandedRemarks);
    if (newExpanded.has(traderId)) {
      newExpanded.delete(traderId);
    } else {
      newExpanded.add(traderId);
    }
    setExpandedRemarks(newExpanded);
  };

  // Handle view details
  const handleViewDetails = (trader) => {
    setSelectedTrader(trader);
    setShowDetailsModal(true);
  };

  // Fetch traders data with pagination
  const fetchTraders = async (page = 1, limit = pageSize, status = selectedStatus, region = selectedRegion, search = searchTerm) => {
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
      
      if (search && search.trim()) {
        params.append('search', search.trim());
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

  // Combined data fetch to prevent duplicate API calls
  useEffect(() => {
    if (!userData) {
      return;
    }

    // Fetch counts only on initial userData load
    if (currentPage === 1 && selectedStatus === "active" && !selectedRegion && !searchTerm) {
      fetchTraderCounts();
    }

    if (searchTerm !== undefined && searchTerm !== '') {
      // Debounce search-triggered loads
      const delayedSearch = setTimeout(() => {
        if (currentPage === 1) {
          fetchTraders(1, pageSize, selectedStatus, selectedRegion, searchTerm);
        } else {
          setCurrentPage(1); // This will trigger another useEffect call
        }
      }, 500);

      return () => clearTimeout(delayedSearch);
    } else {
      // Immediate load for filter/pagination changes
      fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion, searchTerm);
    }
  }, [userData, currentPage, pageSize, selectedStatus, selectedRegion, searchTerm]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleRegionFilterChange = (region) => {
    setSelectedRegion(region);
    setCurrentPage(1);
  };

  // Handle call button click
  const handleCall = (phoneNumber, traderName) => {
    console.log("🔍 handleCall called with:", { phoneNumber, traderName });
    if (phoneNumber && phoneNumber.trim() !== "") {
      console.log(`📞 Initiating call to ${phoneNumber} for ${traderName}`);
      console.log("📋 Contact info being passed:", { name: traderName });
      
      setCurrentNumber(phoneNumber);
      initiateCall(phoneNumber, { name: traderName });
      
      console.log("✅ Call initiated - form should open when call connects");
    } else {
      console.error("❌ No phone number provided");
    }
  };

  // Get unique regions and statuses for filters
  const uniqueRegions = traderCounts?.matchedRegions || [];
  const uniqueStatuses = traderCounts?.statusCounts?.map(s => s.status) || [];

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
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
                {traders.length} of {totalRecords} traders
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
              handleStatusFilterChange("active");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              fetchTraders(currentPage, pageSize, selectedStatus, selectedRegion, searchTerm);
              fetchTraderCounts();
            }}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Enhanced Traders List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {traders.length === 0 ? (
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
                    Last Call Info
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {traders.map((trader) => (
                  <tr key={trader.id} className="hover:bg-gray-50">
                    {/* Trader Details */}
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

                    {/* Business */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={trader.Trader_business_Name}>
                        {trader.Trader_business_Name || "N/A"}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{trader.Region}</div>
                      <div className="text-xs text-gray-500">{trader.Zone}</div>
                    </td>

                    {/* Last Call Info with Enhanced Remarks Display */}
                    <td className="px-4 py-3">
                      {trader.latestCall ? (
                        <div className="text-xs">
                          <div className="text-gray-900 font-medium">
                            {formatDate(trader.latestCall.createdAt)}
                          </div>
                          <div className="text-gray-500 mt-1 max-w-xs">
                            {trader.latestCall.FormDetail?.remarks ? (
                              trader.latestCall.FormDetail.remarks.length > 30 ? (
                                <div>
                                  {expandedRemarks.has(trader.id) ? (
                                    <div>
                                      <div className="whitespace-pre-wrap break-words mb-1">
                                        {trader.latestCall.FormDetail.remarks}
                                      </div>
                                      <button
                                        onClick={() => toggleRemarksExpansion(trader.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                      >
                                        show less
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <span>{trader.latestCall.FormDetail.remarks.substring(0, 30)}...</span>
                                      <button
                                        onClick={() => toggleRemarksExpansion(trader.id)}
                                        className="ml-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                      >
                                        read more
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span>{trader.latestCall.FormDetail.remarks}</span>
                              )
                            ) : (
                              "No remarks"
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">No call history</div>
                      )}
                    </td>

                    {/* Form Status (Updated to show "-" instead of "No Call") */}
                    <td className="px-4 py-3">
                      <span className={getFormStatusBadge(getFormStatus(trader))}>
                        {getStatusDisplayText(getFormStatus(trader))}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCall(trader.Contact_no, trader.Trader_Name)}
                          disabled={!trader.Contact_no}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white focus:outline-none focus:ring-1 focus:ring-offset-1 ${
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
                        
                        <button
                          onClick={() => handleViewDetails(trader)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Details
                        </button>
                      </div>
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

      {/* Details Modal */}
      {showDetailsModal && selectedTrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Trader Details - {selectedTrader.Trader_Name}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Trader Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Trader Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trader ID:</span>
                      <span className="font-medium">{selectedTrader.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">{selectedTrader.Code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trader Name:</span>
                      <span className="font-medium">{selectedTrader.Trader_Name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Name:</span>
                      <span className="font-medium">{selectedTrader.Trader_business_Name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Number:</span>
                      <span className="font-medium">{selectedTrader.Contact_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{selectedTrader.Region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{selectedTrader.Zone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trader Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTrader.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedTrader.status?.charAt(0).toUpperCase() + selectedTrader.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Form Status:</span>
                      <span className={getFormStatusBadge(getFormStatus(selectedTrader))}>
                        {getStatusDisplayText(getFormStatus(selectedTrader))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(selectedTrader.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{formatDate(selectedTrader.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Latest Call Information */}
                {selectedTrader.latestCall ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Call Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call ID:</span>
                        <span className="font-medium">{selectedTrader.latestCall.CallId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-medium">{selectedTrader.latestCall.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call Start:</span>
                        <span className="font-medium">
                          {formatDateTime(selectedTrader.latestCall.callStartTime).date} at {formatDateTime(selectedTrader.latestCall.callStartTime).time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTrader.latestCall.aDialStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedTrader.latestCall.aDialStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTrader.latestCall.bDialStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedTrader.latestCall.bDialStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Call Type:</span>
                        <span className="font-medium">{selectedTrader.latestCall.callType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disconnected By:</span>
                        <span className="font-medium">{selectedTrader.latestCall.disconnectedBy || 'N/A'}</span>
                      </div>
                      
                      {/* Recording */}
                      {selectedTrader.latestCall.recordVoice && (
                        <div className="pt-2">
                          <span className="text-gray-600 text-sm">Call Recording:</span>
                          <div className="mt-1">
                            <a 
                              href={selectedTrader.latestCall.recordVoice}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              <PlayIcon className="w-4 h-4 mr-1" />
                              Play Recording
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call History</h3>
                    <div className="text-center text-gray-500">
                      <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No call history available</p>
                    </div>
                  </div>
                )}

                {/* Form Details */}
                {selectedTrader.latestCall?.FormDetail && (
                  <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Form ID:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Call Type:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.callType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inquiry Number:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.inquiryNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Form Status:</span>
                          <span className={getFormStatusBadge(selectedTrader.latestCall.FormDetail.status)}>
                            {getStatusDisplayText(selectedTrader.latestCall.FormDetail.status)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Support Type:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.SupportType?.supportName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Process Type:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.ProcessType?.processName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Query Type:</span>
                          <span className="font-medium">{selectedTrader.latestCall.FormDetail.QueryType?.queryName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Follow-up Date:</span>
                          <span className="font-medium">
                            {selectedTrader.latestCall.FormDetail.followUpDate 
                              ? formatDate(selectedTrader.latestCall.FormDetail.followUpDate)
                              : 'No follow-up scheduled'}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 text-sm">Remarks:</span>
                        <div className="mt-1 p-3 bg-white border rounded-lg">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedTrader.latestCall.FormDetail.remarks || 'No remarks provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between">
                <div className="flex space-x-3">
                  {selectedTrader.Contact_no && (
                    <button
                      onClick={() => {
                        handleCall(selectedTrader.Contact_no, selectedTrader.Trader_Name);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Call Now
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
