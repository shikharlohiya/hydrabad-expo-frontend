import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
