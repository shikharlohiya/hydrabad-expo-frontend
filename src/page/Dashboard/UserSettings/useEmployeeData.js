import { useState, useCallback } from "react";
import axiosInstance from "../../../library/axios";

const useEmployeeData = (isAdmin) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      ).toString();
      const res = await axiosInstance.get(
        `/admin/employees${params ? `?${params}` : ""}`
      );
      setEmployees(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
      console.error("Error fetching employees:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      const [employeesRes, rolesRes, regionsRes] = await Promise.all([
        axiosInstance.get("/admin/employees"),
        axiosInstance.get("/admin/employee-roles"),
        axiosInstance.get("/admin/unique-regions"),
      ]);

      setEmployees(employeesRes.data?.data || []);
      setRoles(rolesRes.data?.data || []);
      setRegions(regionsRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch initial data");
      console.error("Error fetching initial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const createEmployee = useCallback(
    async (employeeData) => {
      setIsLoading(true);
      setError(null);
      try {
        await axiosInstance.post("/admin/employees", employeeData);
        await fetchEmployees();
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create employee");
        console.error("Error creating employee:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchEmployees]
  );

  const updateEmployee = useCallback(
    async (employeeId, employeeData) => {
      setIsLoading(true);
      setError(null);
      try {
        await axiosInstance.put(`/admin/employees/${employeeId}`, employeeData);
        await fetchEmployees();
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update employee");
        console.error("Error updating employee:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchEmployees]
  );

  const deleteEmployee = useCallback(
    async (employeeId) => {
      setIsLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/admin/employees/${employeeId}`);
        await fetchEmployees();
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete employee");
        console.error("Error deleting employee:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchEmployees]
  );

  return {
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
  };
};

export default useEmployeeData;
