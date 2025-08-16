import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Dashboard
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
