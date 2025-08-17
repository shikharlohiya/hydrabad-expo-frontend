import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="animate-pulse">
        {/* Compact Stats Skeleton */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border-r border-gray-200 pr-4 last:border-r-0 last:pr-0"
                >
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[...Array(5)].map((_, j) => (
                      <div key={j}>
                        <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-1 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-10 mx-auto relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton with Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 rounded relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom shimmer animation */}
    </div>
  );
};

export default LoadingSkeleton;
