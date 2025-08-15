import React from "react";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaUserTie,
  FaUser,
} from "react-icons/fa";
import { ROLE_CONFIG } from "../constants";

const EmployeeCard = ({ employee, onEdit, onDelete, roleConfig }) => {
  const IconComponent = {
    FaChartBar: FaChartBar,
    FaUserTie: FaUserTie,
    FaUser: FaUser,
  }[roleConfig.icon];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`text-xl ${roleConfig.textColor}`}>
            {IconComponent && <IconComponent />}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-800">
              {employee.EmployeeName}
            </h3>
            <p className="text-xs text-gray-500">ID: {employee.EmployeeId}</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig.badgeColor}`}
        >
          {roleConfig.name}
        </span>
      </div>

      <div className="space-y-1 mb-3 text-sm text-gray-600">
        <div className="flex items-center">
          <FaPhone className="mr-2" />
          <span>{employee.EmployeePhone}</span>
        </div>
        <div className="flex items-center flex-wrap">
          <FaMapMarkerAlt className="mr-2" />
          {employee.EmployeeRegion.split(",").map((region) => (
            <span
              key={region}
              className="bg-gray-200 text-gray-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full"
            >
              {region.trim()}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          onClick={() => onEdit(employee)}
          className="flex-1 bg-gray-100 text-gray-700 font-medium py-1.5 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(employee)}
          className="flex-1 bg-red-50 text-red-600 font-medium py-1.5 px-3 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
