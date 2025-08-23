import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const DashboardHeader = ({ userData, showFlagBackground }) => {
  return (
    <div className="mb-4">
      <div className="overflow-hidden">
        {/* Enhanced Content with Better Visibility */}
        <div className="relative z-20  items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-black tracking-wide">
              {userData?.EmployeeRole === 3
                ? "Admin Dashboard"
                : userData?.EmployeeRole === 2
                ? "Manager Dashboard"
                : "Agent Dashboard"}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
