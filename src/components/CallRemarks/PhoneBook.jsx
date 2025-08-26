import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Phone,
  MapPin,
  Building2,
  UserCheck,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../library/axios";

const PhoneBook = () => {
  // State for contacts and pagination
  const [contacts, setContacts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // Items per page

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown options state
  const [regions, setRegions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownLoading, setDropdownLoading] = useState({
    regions: false,
    roles: false,
    branches: false,
  });

  // Fetch contacts with current filters
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedRole) params.append("role", selectedRole);
      if (selectedBranch) params.append("branch", selectedBranch);

      const response = await axiosInstance.get(`/phonebook/record?${params}`);

      if (response.data.success && Array.isArray(response.data.data)) {
        setContacts(response.data.data);
        setTotalRecords(response.data.totalRecords || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setContacts([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setContacts([]);
        setTotalRecords(0);
        setTotalPages(1);
      } else {
        setError("Failed to fetch contacts.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    selectedRegion,
    selectedRole,
    selectedBranch,
    currentPage,
    limit,
  ]);

  // Debounced fetch for search
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search/filter
      fetchContacts();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm, selectedRegion, selectedRole, selectedBranch]);

  // Fetch contacts when page changes
  useEffect(() => {
    if (currentPage !== 1) {
      fetchContacts();
    }
  }, [currentPage]);

  // Fetch dropdown options
  const fetchRegions = async (query = "") => {
    setDropdownLoading((prev) => ({ ...prev, regions: true }));
    try {
      const response = await axiosInstance.get(`/phonebook/region?q=${query}`);
      if (response.data.success) {
        setRegions(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, regions: false }));
    }
  };

  const fetchRoles = async (query = "") => {
    setDropdownLoading((prev) => ({ ...prev, roles: true }));
    try {
      const response = await axiosInstance.get(`/phonebook/roles?q=${query}`);
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, roles: false }));
    }
  };

  const fetchBranches = async (query = "") => {
    if (!selectedRegion) {
      setBranches([]);
      return;
    }

    setDropdownLoading((prev) => ({ ...prev, branches: true }));
    try {
      const response = await axiosInstance.get(
        `/phonebook/branches?region=${selectedRegion}&q=${query}`
      );
      if (response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, branches: false }));
    }
  };

  // Initialize dropdown data
  useEffect(() => {
    fetchRegions();
    fetchRoles();
  }, []);

  // Fetch branches when region changes
  useEffect(() => {
    if (selectedRegion) {
      fetchBranches();
      setSelectedBranch(""); // Reset branch selection when region changes
    } else {
      setBranches([]);
      setSelectedBranch("");
    }
  }, [selectedRegion]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("");
    setSelectedRole("");
    setSelectedBranch("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedRegion || selectedRole || selectedBranch;

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Phone Book</h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Filter Toggle and Clear */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {
                  [selectedRegion, selectedRole, selectedBranch].filter(Boolean)
                    .length
                }
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled={!selectedRegion}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {totalRecords > 0
              ? `Showing ${(currentPage - 1) * limit + 1}-${Math.min(
                  currentPage * limit,
                  totalRecords
                )} of ${totalRecords} contacts`
              : "No contacts found"}
          </span>
          {totalPages > 1 && (
            <span className="text-xs">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading contacts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="p-3">
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {contact.EmployeeName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {contact.EmployeeId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {contact.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{contact.Contact1}</span>
                    </div>

                    {contact.Contact2 &&
                      contact.Contact2 !== contact.Contact1 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">
                            {contact.Contact2}
                          </span>
                        </div>
                      )}

                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{contact.Role}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">
                        {contact.BranchName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{contact.Region}</span>
                      {contact.Zone && (
                        <span className="text-xs text-gray-400">
                          • {contact.Zone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900 mb-1">
                No Contacts Found
              </p>
              <p className="text-sm text-gray-500 max-w-xs">
                {searchTerm || hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "No contacts available in the directory"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Simplified pagination for side panel */}
            <div className="flex items-center gap-1">
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-1 text-sm rounded-md hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span className="text-gray-400 text-sm">...</span>
                  )}
                </>
              )}

              {currentPage > 1 && (
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  className="px-3 py-1 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  {currentPage - 1}
                </button>
              )}

              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
                {currentPage}
              </button>

              {currentPage < totalPages && (
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  className="px-3 py-1 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  {currentPage + 1}
                </button>
              )}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="text-gray-400 text-sm">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 text-sm rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneBook;
