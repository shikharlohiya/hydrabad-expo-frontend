import React from "react";
import Select from "react-select";
import {
  FaSearch,
  FaSync,
  FaChartBar,
  FaUserTie,
  FaUser,
} from "react-icons/fa";
import { ROLE_CONFIG } from "../constants";

const FilterSection = ({
  filters,
  onFilterChange,
  onFilterSubmit,
  onClearFilters,
  roles,
  regions,
  isLoading,
}) => {
  // Regions for multi-select
  const regionOptions = regions.map((r) => ({ value: r, label: r }));

  // Roles for single select with icons
  const roleOptions = [
    { value: "", label: "All Roles" },
    ...roles.map((role) => {
      const IconComponent = {
        FaChartBar,
        FaUserTie,
        // FaUser,
      }[ROLE_CONFIG[role.RoleId]?.icon];

      return {
        value: role.RoleId,
        label: (
          <div className="flex items-center">
            {IconComponent && <IconComponent className="inline-block mr-2" />}
            {role.RoleName}
          </div>
        ),
      };
    }),
  ];

  // Handle region multi-select
  const handleMultiSelectChange = (selectedOptions) => {
    onFilterChange({
      target: {
        name: "EmployeeRegion",
        value: selectedOptions.map((o) => o.value).join(","),
      },
    });
  };

  // Handle role select
  const handleRoleSelectChange = (selectedOption) => {
    onFilterChange({
      target: {
        name: "EmployeeRoleID",
        value: selectedOption ? selectedOption.value : "",
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold text-gray-800 flex items-center">
          <FaSearch className="mr-2" /> Search & Filter
        </h2>
      </div>

      <form onSubmit={onFilterSubmit} className="flex flex-wrap gap-3">
        {/* Employee ID */}
        <input
          type="text"
          name="EmployeeId"
          value={filters.EmployeeId}
          onChange={onFilterChange}
          placeholder="Employee ID"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-[180px] h-[40px]"
        />

        {/* Phone Number */}
        <input
          type="text"
          name="EmployeePhone"
          value={filters.EmployeePhone}
          onChange={onFilterChange}
          placeholder="Phone Number"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-[180px] h-[40px]"
        />

        {/* Employee Name */}
        <input
          type="text"
          name="EmployeeName"
          value={filters.EmployeeName}
          onChange={onFilterChange}
          placeholder="Employee Name"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-[180px] h-[40px]"
        />

        {/* Employee Role */}
        <div className="w-[180px]">
          <Select
            name="EmployeeRoleID"
            options={roleOptions}
            value={
              roleOptions.find((o) => o.value === filters.EmployeeRoleID) ||
              roleOptions[0]
            }
            onChange={handleRoleSelectChange}
            classNamePrefix="select"
          />
        </div>

        {/* Employee Region */}
        <div className="w-[220px]">
          <Select
            isMulti
            name="EmployeeRegion"
            options={regionOptions}
            value={regionOptions.filter((o) =>
              filters.EmployeeRegion.split(",").includes(o.value)
            )}
            onChange={handleMultiSelectChange}
            styles={{
              valueContainer: (provided) => ({
                ...provided,
                maxHeight: 70,
                overflowY: "auto",
              }),
            }}
            classNamePrefix="select"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <FaSync className="animate-spin" /> : <FaSearch />}
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            <FaSync />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterSection;
