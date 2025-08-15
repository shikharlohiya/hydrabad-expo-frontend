import React from 'react';
import Select from 'react-select';
import { FaSearch, FaSync, FaChartBar, FaUserTie, FaUser } from "react-icons/fa";
import { ROLE_CONFIG } from "../constants";

const FilterSection = ({ filters, onFilterChange, onFilterSubmit, onClearFilters, roles, regions, isLoading }) => {
  const regionOptions = regions.map(r => ({ value: r, label: r }));

  const handleMultiSelectChange = (selectedOptions) => {
    onFilterChange({ target: { name: 'EmployeeRegion', value: selectedOptions.map(o => o.value).join(',') } });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold text-gray-800 flex items-center"><FaSearch className="mr-2" /> Search & Filter</h2>
      </div>

      <form onSubmit={onFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <input type="text" name="EmployeeId" value={filters.EmployeeId} onChange={onFilterChange} placeholder="Employee ID" className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm" />
        <input type="text" name="EmployeePhone" value={filters.EmployeePhone} onChange={onFilterChange} placeholder="Phone Number" className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm" />
        <input type="text" name="EmployeeName" value={filters.EmployeeName} onChange={onFilterChange} placeholder="Employee Name" className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm" />
        <select name="EmployeeRoleID" value={filters.EmployeeRoleID} onChange={onFilterChange} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm">
          <option value="">All Roles</option>
          {roles.map((role) => {
            const IconComponent = {
              FaChartBar: FaChartBar,
              FaUserTie: FaUserTie,
              FaUser: FaUser,
            }[ROLE_CONFIG[role.RoleId]?.icon];
            return (
              <option key={role.RoleId} value={role.RoleId}>
                {IconComponent && <IconComponent className="inline-block mr-2" />} {role.RoleName}
              </option>
            );
          })}
        </select>
        <Select
          isMulti
          name="EmployeeRegion"
          options={regionOptions}
          className="basic-multi-select"
          classNamePrefix="select"
          value={regionOptions.filter(o => filters.EmployeeRegion.split(',').includes(o.value))}
          onChange={handleMultiSelectChange}
        />

        <div className="flex gap-2">
          <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center text-sm">{isLoading ? <FaSync className="animate-spin" /> : <FaSearch />}</button>
          <button type="button" onClick={onClearFilters} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors flex items-center text-sm"><FaSync /></button>
        </div>
      </form>
    </div>
  );
};

export default FilterSection;