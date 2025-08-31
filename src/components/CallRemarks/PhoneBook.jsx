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
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../../library/axios";

const PhoneBook = ({ isCompact = false }) => {
  // localStorage keys
  const STORAGE_KEY = 'phoneBookFilters';
  
  // Helper functions for localStorage
  const saveFiltersToStorage = (filters) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
      return {};
    }
  };

  // State for contacts and pagination
  const [contacts, setContacts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // Items per page

  // Search and filter state - initialize with default values
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Load saved filters after component mounts
  useEffect(() => {
    const saved = loadFiltersFromStorage();
    console.log('📞 Loading PhoneBook filters:', saved);
    
    if (saved.searchTerm) setSearchTerm(saved.searchTerm);
    if (saved.selectedRegion) setSelectedRegion(saved.selectedRegion);
    if (saved.selectedRole) setSelectedRole(saved.selectedRole);
    if (saved.selectedBranch) setSelectedBranch(saved.selectedBranch);
    if (typeof saved.showFilters === 'boolean') setShowFilters(saved.showFilters);
  }, []);

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

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filtersToSave = {
      searchTerm,
      selectedRegion,
      selectedRole,
      selectedBranch,
      showFilters,
    };
    saveFiltersToStorage(filtersToSave);
  }, [searchTerm, selectedRegion, selectedRole, selectedBranch, showFilters]);

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

  // Responsive classes based on compact mode
  const containerClass = isCompact
    ? "h-full flex flex-col bg-white overflow-hidden"
    : "h-screen flex flex-col bg-white overflow-hidden";

  const headerPadding = isCompact ? "p-2" : "p-3 sm:p-4";
  const contentPadding = isCompact ? "px-2 py-1" : "px-3 sm:px-4 py-2";
  const cardPadding = isCompact ? "p-2" : "p-3";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div
        className={`flex-shrink-0 ${headerPadding} border-b border-gray-100 bg-white`}
      >
        <h2
          className={`font-semibold text-gray-900 mb-2 ${
            isCompact ? "text-base" : "text-lg sm:text-xl"
          }`}
        >
          Phone Book
        </h2>

        {/* Search and Filter Controls */}
        <div className="space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={"Search by name, ID, phone, region"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                isCompact ? "py-1.5" : "py-2"
              }`}
            />
          </div>

          {/* Filter Controls Row */}
          {!isCompact && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                    {
                      [selectedRegion, selectedRole, selectedBranch].filter(
                        Boolean
                      ).length
                    }
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}

          {/* Compact Filter Toggle */}
          {isCompact && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                    {
                      [selectedRegion, selectedRole, selectedBranch].filter(
                        Boolean
                      ).length
                    }
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded p-2">
              <div
                className={`space-y-2 ${
                  isCompact
                    ? ""
                    : "sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2"
                }`}
              >
                {/* Region Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters in Compact Mode */}
              {isCompact && hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-2 flex items-center justify-center gap-1 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div
        className={`flex-shrink-0 ${contentPadding} border-b border-gray-100 bg-gray-50`}
      >
        <div className="text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span className="truncate">
              {totalRecords > 0
                ? `${(currentPage - 1) * limit + 1}-${Math.min(
                    currentPage * limit,
                    totalRecords
                  )} of ${totalRecords}`
                : "No contacts found"}
            </span>
            {totalPages > 1 && (
              <span className="whitespace-nowrap">
                {currentPage}/{totalPages}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contacts List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-center px-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : contacts.length > 0 ? (
          <div className={cardPadding}>
            {/* Contact Cards - Single column for compact, grid for full mode */}
            <div
              className={
                isCompact
                  ? "space-y-2"
                  : "space-y-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-3 sm:space-y-0"
              }
            >
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`bg-white border border-gray-200 rounded hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer ${
                    isCompact ? "p-2" : "p-3"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={`bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompact ? "w-6 h-6" : "w-8 h-8"
                      }`}
                    >
                      <User
                        className={`text-blue-600 ${
                          isCompact ? "w-3 h-3" : "w-4 h-4"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-medium text-gray-900 truncate ${
                          isCompact ? "text-xs" : "text-sm"
                        }`}
                      >
                        {contact.EmployeeName}
                      </h3>
                      <p
                        className={`text-gray-500 ${
                          isCompact ? "text-xs" : "text-xs"
                        }`}
                      >
                        ID: {contact.EmployeeId}
                      </p>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        contact.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {contact.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div
                    className={`space-y-1 ${isCompact ? "text-xs" : "text-xs"}`}
                  >
                    {/* Phone */}
                    <div className="flex items-center gap-1.5">
                      <Phone
                        className={`text-gray-400 flex-shrink-0 ${
                          isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-gray-700 font-medium block truncate">
                          {contact.Contact1}
                        </span>
                        {contact.Contact2 &&
                          contact.Contact2 !== contact.Contact1 && (
                            <span className="text-gray-500 block truncate">
                              {contact.Contact2}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-1.5">
                      <UserCheck
                        className={`text-gray-400 flex-shrink-0 ${
                          isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                      />
                      <span className="text-gray-600 truncate">
                        {contact.Role}
                      </span>
                    </div>

                    {/* Branch */}
                    <div className="flex items-center gap-1.5">
                      <Building2
                        className={`text-gray-400 flex-shrink-0 ${
                          isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                      />
                      <span className="text-gray-600 truncate">
                        {contact.BranchName}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className={`text-gray-400 flex-shrink-0 ${
                          isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                      />
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-gray-600 truncate">
                          {contact.Region}
                        </span>
                        {contact.Zone && (
                          <span className="text-gray-400 whitespace-nowrap">
                            • {contact.Zone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center px-2">
              <div
                className={`bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  isCompact ? "w-8 h-8" : "w-10 h-10"
                }`}
              >
                <User
                  className={`text-gray-400 ${
                    isCompact ? "w-4 h-4" : "w-5 h-5"
                  }`}
                />
              </div>
              <p
                className={`font-medium text-gray-900 mb-1 ${
                  isCompact ? "text-xs" : "text-sm"
                }`}
              >
                No Contacts Found
              </p>
              <p
                className={`text-gray-500 max-w-xs mx-auto ${
                  isCompact ? "text-xs" : "text-xs"
                }`}
              >
                {searchTerm || hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "No contacts available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`flex-shrink-0 ${
            isCompact ? "p-2" : "p-3"
          } border-t border-gray-100 bg-white`}
        >
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors ${
                isCompact ? "p-1" : "p-1.5"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-0.5">
              {/* Simplified pagination for compact mode */}
              {isCompact ? (
                <span className="px-2 py-1 text-xs text-gray-600">
                  {currentPage} / {totalPages}
                </span>
              ) : (
                <>
                  {currentPage > 2 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      <span className="text-gray-400 text-xs">...</span>
                    </>
                  )}

                  {currentPage > 1 && (
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      className="px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors"
                    >
                      {currentPage - 1}
                    </button>
                  )}

                  <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
                    {currentPage}
                  </button>

                  {currentPage < totalPages && (
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      className="px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors"
                    >
                      {currentPage + 1}
                    </button>
                  )}

                  {currentPage < totalPages - 1 && (
                    <>
                      <span className="text-gray-400 text-xs">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors ${
                isCompact ? "p-1" : "p-1.5"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneBook;
