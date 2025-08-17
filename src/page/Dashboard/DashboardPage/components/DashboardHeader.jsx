import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const DashboardHeader = ({ userData, showFlagBackground }) => {
  return (
    <div className="mb-4">
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
        {/* Animated Indian Flag Background - Toggle with showFlagBackground */}
        {showFlagBackground && (
          <div className="absolute inset-0 opacity-40">
            {/* Saffron stripe with realistic waving */}
            <div className="relative h-1/3 overflow-hidden">
              <div className="flag-saffron-wave absolute inset-0"></div>
              <div className="flag-saffron-glow absolute inset-0"></div>
              <div className="flag-saffron-shimmer absolute inset-0"></div>
            </div>

            {/* White stripe with dynamic effects */}
            <div className="relative h-1/3 bg-white overflow-hidden">
              <div className="flag-white-wave absolute inset-0"></div>
              <div className="flag-white-glow absolute inset-0"></div>

              {/* Enhanced Ashoka Chakra with spokes */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                <div className="chakra-enhanced">
                  <div className="chakra-center"></div>
                  <div className="chakra-spokes"></div>
                </div>
              </div>
            </div>

            {/* Green stripe with realistic waving */}
            <div className="relative h-1/3 overflow-hidden">
              <div className="flag-green-wave absolute inset-0"></div>
              <div className="flag-green-glow absolute inset-0"></div>
              <div className="flag-green-shimmer absolute inset-0"></div>
            </div>

            {/* Patriotic sparkles */}
            <div className="sparkle-container absolute inset-0">
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
              <div className="sparkle sparkle-4"></div>
              <div className="sparkle sparkle-5"></div>
            </div>
          </div>
        )}

        {/* Enhanced Content with Better Visibility */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg tracking-wide">
              {userData?.EmployeeRole === 2
                ? "🏛️ Manager Dashboard"
                : "🎯 Agent Dashboard"}
            </h1>
            {userData?.EmployeeRole === 2 && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Manager View
              </span>
            )}
          </div>
          <div className="text-right bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md rounded-xl px-5 py-3 shadow-xl border border-white/50">
            <p className="text-sm text-gray-600 font-semibold">
              🙏 Welcome back,
            </p>
            <p className="text-xl font-bold text-gray-900 drop-shadow-md">
              {userData?.EmployeeName}
            </p>
            <p className="text-sm text-gray-700 font-medium mt-1">
              <span className="inline-flex items-center">
                {userData?.EmployeeRole === 2 ? "👨‍💼 Manager" : "👨‍💻 Agent"} • 📍{" "}
                {userData?.EmployeeRegion}
              </span>
            </p>
          </div>
        </div>

        {/* Amazing CSS Animations - Only when flag background is enabled */}
        {showFlagBackground && (
         <></>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
