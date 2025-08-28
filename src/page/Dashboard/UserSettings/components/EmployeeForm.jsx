import React, { useState } from "react";
import Select from "react-select";
import { INITIAL_EMPLOYEE_STATE } from "../constants";

const EmployeeForm = ({
  employee,
  roles,
  regions,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const [formData, setFormData] = useState(
    employee
      ? {
          ...employee,
          EmployeeRegion: employee.EmployeeRegion.split(",").map((r) =>
            r.trim()
          ),
        }
      : { ...INITIAL_EMPLOYEE_STATE, EmployeeRegion: [] }
  );
  const [validationErrors, setValidationErrors] = useState({});

  const handleRoleSelectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      EmployeeRoleID: selectedOption ? selectedOption.value : "",
    }));
    if (validationErrors.EmployeeRoleID) {
      setValidationErrors((prev) => ({ ...prev, EmployeeRoleID: "" }));
    }
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      EmployeeRegion: selectedOptions.map((o) => o.value),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.EmployeeName.trim()) errors.EmployeeName = "Name is required";
    if (!formData.EmployeeRoleID) errors.EmployeeRoleID = "Role is required";
    if (formData.EmployeeRegion.length === 0)
      errors.EmployeeRegion = "Region is required";

    if (!employee) {
      if (!formData.EmployeeId.trim())
        errors.EmployeeId = "Employee ID is required";
    }
    if (!formData.EmployeePhone.trim())
      errors.EmployeePhone = "Phone is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        EmployeeRegion: formData.EmployeeRegion.join(", "),
      });
    }
  };

  const regionOptions = regions.map((r) => ({ value: r, label: r }));
  const roleOptions = roles.map((role) => ({
    value: role.RoleId,
    label: role.RoleName,
  }));

  // Custom styles to ensure proper z-index
  const selectStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID
          </label>
          <input
            type="text"
            name="EmployeeId"
            value={formData.EmployeeId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              validationErrors.EmployeeId ? "border-red-500" : ""
            }`}
            placeholder="Enter employee ID"
            disabled={!!employee}
          />
          {validationErrors.EmployeeId && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.EmployeeId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="EmployeePhone"
            value={formData.EmployeePhone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              validationErrors.EmployeePhone ? "border-red-500" : ""
            }`}
            placeholder="Enter phone number"
          />
          {validationErrors.EmployeePhone && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.EmployeePhone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="EmployeeName"
          value={formData.EmployeeName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
            validationErrors.EmployeeName ? "border-red-500" : ""
          }`}
          placeholder="Enter full name"
        />
        {validationErrors.EmployeeName && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.EmployeeName}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <Select
            name="EmployeeRoleID"
            options={roleOptions}
            classNamePrefix="select"
            value={
              roleOptions.find((o) => o.value === formData.EmployeeRoleID) ||
              null
            }
            onChange={handleRoleSelectChange}
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
          {validationErrors.EmployeeRoleID && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.EmployeeRoleID}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <Select
            isMulti
            name="EmployeeRegion"
            options={regionOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={regionOptions.filter((o) =>
              formData.EmployeeRegion.includes(o.value)
            )}
            onChange={handleMultiSelectChange}
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
          {validationErrors.EmployeeRegion && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.EmployeeRegion}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
