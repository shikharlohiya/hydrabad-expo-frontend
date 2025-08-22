import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const DashboardHeader = ({ userData, showFlagBackground }) => {
  return (
    <div className="mb-4">
      <div className="relative bg-[#538FC2]/70 rounded-xl shadow-2xl  p-6 overflow-hidden">
        {/* Enhanced Content with Better Visibility */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              {userData?.EmployeeRole === 2
                ? "Manager Dashboard"
                : "Agent Dashboard"}
            </h1>
            {/* {userData?.EmployeeRole === 2 && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Manager View
              </span>
            )} */}
          </div>
          <div className="text-left   px-5 py-3  ">
            {/* <p className="text-sm text-white font-semibold">Welcome back,</p> */}
            {/* <p className="text-xl font-bold text-white drop-shadow-md">
              {userData?.EmployeeName}
            </p> */}
            <p className="text-sm text-white font-medium mt-1">
              <span className="inline-flex items-center">
                {/* {userData?.EmployeeRole === 2 ? "👨‍💼 Manager" : "👨‍💻 Agent"} • 📍{" "}   */}
                Assigned Regions: {userData?.EmployeeRegion}
              </span>
            </p>
          </div>
        </div>

        {/* Amazing CSS Animations - Only when flag background is enabled */}
        {showFlagBackground && <></>}
      </div>
    </div>
  );
};

export default DashboardHeader;
