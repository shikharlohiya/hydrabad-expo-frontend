import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Dashboard features are currently under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
