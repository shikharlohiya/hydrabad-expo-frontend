import React from "react";
import { Truck, Users, User } from "lucide-react";

const DashboardHeader = ({ userData, showFlagBackground }) => {
  const getRoleIcon = () => {
    if (userData?.EmployeeRole === 3) {
      return <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />;
    } else if (userData?.EmployeeRole === 2) {
      return <Users className="w-6 h-6 text-white" strokeWidth={2.5} />;
    } else {
      return <User className="w-6 h-6 text-white" strokeWidth={2.5} />;
    }
  };

  const getRoleTitle = () => {
    if (userData?.EmployeeRole === 3) {
      return "Admin Dashboard";
    } else if (userData?.EmployeeRole === 2) {
      return "Manager Dashboard";
    } else {
      return "Agent Dashboard";
    }
  };

  const getRoleSubtitle = () => {
    if (userData?.EmployeeRole === 3) {
      return "Complete system overview and vehicle management";
    } else if (userData?.EmployeeRole === 2) {
      return "Team performance and placement tracking";
    } else {
      return "Your placement activities and performance";
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md">
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {getRoleTitle()}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {getRoleSubtitle()}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-3">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Welcome back,</p>
              <p className="text-sm font-semibold text-gray-900">{userData?.EmployeeName || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
