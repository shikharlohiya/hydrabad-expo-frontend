import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import {
  FaChartBar,
  FaUserTie,
  FaMapMarkerAlt,
  FaPhone,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSync,
  FaBan,
  FaUsers,
  FaGlobe,
  FaMagic,
  FaUser,
  FaPlus,
} from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import UserContext from "../../../context/UserContext";
import StatCard from "./components/StatCard";
import Modal from "./components/Modal";
import EmployeeForm from "./components/EmployeeForm";
import ConfirmationModal from "./components/ConfirmationModal";
import EmployeeCard from "./components/EmployeeCard";
import FilterSection from "./components/FilterSection";
import Shimmer from "./components/Shimmer";
import useEmployeeData from "./useEmployeeData";
import {
  ADMIN_ROLE_ID,
  TRADER_ROLE_ID,
  MANAGER_ROLE_ID,
  INITIAL_EMPLOYEE_STATE,
  ROLE_CONFIG,
} from "./constants";

// Main Component
const UserSettings = () => {
  const { userData } = useContext(UserContext);
  const isAdmin = userData?.EmployeeRole === ADMIN_ROLE_ID;

  const {
    employees,
    roles,
    regions,
    isLoading,
    error,
    fetchInitialData,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeData(isAdmin);

  const [filters, setFilters] = useState(INITIAL_EMPLOYEE_STATE);
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Memoized data calculations
  const employeeStats = useMemo(() => {
    const traders = employees.filter(
      (emp) => emp.EmployeeRoleID === TRADER_ROLE_ID
    );
    const managers = employees.filter(
      (emp) => emp.EmployeeRoleID === MANAGER_ROLE_ID
    );
    const totalEmployees = employees.length;
    const uniqueRegions = [
      ...new Set(
        employees.flatMap((emp) =>
          emp.EmployeeRegion.split(",").map((r) => r.trim())
        )
      ),
    ].length;

    return { traders, managers, totalEmployees, uniqueRegions };
  }, [employees]);

  // Event handlers
  const handleFilterChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleFilterSubmit = useCallback(
    (e) => {
      e.preventDefault();
      fetchEmployees(filters);
    },
    [fetchEmployees, filters]
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_EMPLOYEE_STATE);
    fetchEmployees();
  }, [fetchEmployees]);

  const openModal = useCallback((type, employee = null) => {
    setSelectedEmployee(employee);
    setModals((prev) => ({ ...prev, [type]: true }));
  }, []);

  const closeModal = useCallback((type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setSelectedEmployee(null);
  }, []);

  const handleCreateEmployee = useCallback(
    async (employeeData) => {
      const success = await createEmployee(employeeData);
      if (success) {
        closeModal("create");
      }
    },
    [createEmployee, closeModal]
  );

  const handleUpdateEmployee = useCallback(
    async (employeeData) => {
      const success = await updateEmployee(
        selectedEmployee.EmployeeId,
        employeeData
      );
      if (success) {
        closeModal("edit");
      }
    },
    [updateEmployee, selectedEmployee, closeModal]
  );

  const handleDeleteEmployee = useCallback(async () => {
    const success = await deleteEmployee(selectedEmployee.EmployeeId);
    if (success) {
      closeModal("delete");
    }
  }, [deleteEmployee, selectedEmployee, closeModal]);

  // Early return for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4 text-red-500">
            <FaBan />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUsers className="mr-3" /> Employee Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your team members and their roles.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => openModal("create")}
              className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
            >
              <FaPlus />
              Add Employee
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="py-1">
                <FiAlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Employees"
            value={employeeStats.totalEmployees}
            icon={<FaUsers />}
            color="indigo"
          />
          <StatCard
            title="Traders"
            value={employeeStats.traders.length}
            icon={<FaChartBar />}
            color="blue"
          />
          <StatCard
            title="Managers"
            value={employeeStats.managers.length}
            icon={<FaUserTie />}
            color="purple"
          />
        </div>

        {/* Filter Section */}
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onFilterSubmit={handleFilterSubmit}
          onClearFilters={clearFilters}
          roles={roles}
          regions={regions}
          isLoading={isLoading}
        />

        {/* Main Content */}
        {isLoading ? (
          <Shimmer />
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-5xl mb-4 text-gray-400">
              <FaSearch />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No employees found
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Try adjusting your search filters or add a new employee.
            </p>
            <button
              onClick={() => openModal("create")}
              className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              Add Employee
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.EmployeeId}
                  employee={employee}
                  onEdit={() => openModal("edit", employee)}
                  onDelete={() => openModal("delete", employee)}
                  roleConfig={
                    ROLE_CONFIG[employee.EmployeeRoleID] || {
                      name: employee.role?.RoleName || "Unknown",
                      color: "gray",
                      bgColor: "bg-gray-50",
                      borderColor: "border-gray-200",
                      textColor: "text-gray-700",
                      badgeColor: "bg-gray-100 text-gray-800",
                      icon: <FaUser />,
                    }
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={modals.create}
          onClose={() => closeModal("create")}
          title={
            <span className="flex items-center">
              <FaMagic className="mr-2" /> Create New Employee
            </span>
          }
          size="lg"
        >
          <EmployeeForm
            roles={roles}
            regions={regions}
            onSubmit={handleCreateEmployee}
            onCancel={() => closeModal("create")}
            submitLabel="Create Employee"
          />
        </Modal>

        <Modal
          isOpen={modals.edit}
          onClose={() => closeModal("edit")}
          title={
            <span className="flex items-center">
              <FaEdit className="mr-2" /> Edit Employee
            </span>
          }
          size="lg"
        >
          <EmployeeForm
            employee={selectedEmployee}
            roles={roles}
            regions={regions}
            onSubmit={handleUpdateEmployee}
            onCancel={() => closeModal("edit")}
            submitLabel="Update Employee"
          />
        </Modal>

        <ConfirmationModal
          isOpen={modals.delete}
          onClose={() => closeModal("delete")}
          onConfirm={handleDeleteEmployee}
          title={
            <span className="flex items-center">
              <FaTrash className="mr-2" /> Delete Employee
            </span>
          }
          message={`Are you sure you want to delete ${selectedEmployee?.EmployeeName}? This action cannot be undone.`}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UserSettings;
