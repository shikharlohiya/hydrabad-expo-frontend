import React, { useState, useEffect } from 'react';
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

const ViewOnlyDashboard = () => {
  const [callStats, setCallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch live call statistics from API
  const fetchCallStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/live-call-stats`);

      if (response.data.success) {
        setCallStats(response.data.data);
        setLastUpdated(new Date().toLocaleString());
        setError(null);
      } else {
        setError('Failed to fetch call statistics');
      }
    } catch (err) {
      console.error('Error fetching call stats:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Polling effect - fetch data every 5 seconds
  useEffect(() => {
    // Initial fetch
    fetchCallStats();

    // Set up polling interval
    const interval = setInterval(fetchCallStats, 5000); // 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading && !callStats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl text-gray-600">Loading Live Call Statistics...</span>
      </div>
    );
  }

  if (error && !callStats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          📞 Trader Help Desk - Live Call Statistics
        </h1>
        <div className="flex justify-center items-center space-x-6 text-lg">
          <span className="text-gray-600 font-medium">
            📅 Period: {callStats?.dateRange?.display}
          </span>
          <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-700 font-medium">
              Last Updated: {callStats?.lastUpdated || lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Total Calls */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
          <PhoneIcon className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Total Calls</h3>
          <p className="text-5xl font-bold">{callStats?.totalCalls || 0}</p>
        </div>

        {/* Inbound Calls */}
        <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
          <PhoneArrowDownLeftIcon className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Inbound Total</h3>
          <p className="text-5xl font-bold mb-2">{callStats?.inbound?.total || 0}</p>
          {/* <p className="text-sm opacity-90">
            Connected: {callStats?.inbound?.connected || 0} |
            Missed: {callStats?.inbound?.missed || 0}
          </p> */}
        </div>

        {/* Outbound Calls */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
          <PhoneArrowUpRightIcon className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Outbound Total</h3>
          <p className="text-5xl font-bold mb-2">{callStats?.outbound?.total || 0}</p>
          {/* <p className="text-sm opacity-90">
            Connected: {callStats?.outbound?.connected || 0} |
            Failed: {callStats?.outbound?.notConnected || 0}
          </p> */}
        </div>

        {/* Callbacks Status */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
          <ClockIcon className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Callbacks Made</h3>
          <p className="text-5xl font-bold mb-2">{callStats?.callbacks?.uniqueCallbacks || 0}</p>
          <p className="text-sm opacity-90">
            Rate: {callStats?.callbacks?.callbackRate || '0.0'}%
          </p>
        </div>
      </div>

      {/* Performance and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
        {/* Connection Rates - Commented Out */}
        {/* <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <CheckCircleIcon className="h-8 w-8 mr-3 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-800">Connection Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Inbound Connection Rate</h4>
              <p className="text-4xl font-bold text-green-600">
                {callStats?.performance?.inboundConnectionRate || '0.0'}%
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Outbound Connection Rate</h4>
              <p className="text-4xl font-bold text-blue-600">
                {callStats?.performance?.outboundConnectionRate || '0.0'}%
              </p>
            </div>
          </div>
        </div> */}

        {/* Callback Details */}
        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 shadow-xl mx-auto max-w-2xl">
          <div className="flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-800">Callback Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Pending Callbacks</h4>
              <p className="text-4xl font-bold text-red-600">
                {callStats?.callbacks?.notCallbackCount || 0}
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Completed Callbacks</h4>
              <p className="text-4xl font-bold text-green-600">
                {callStats?.callbacks?.uniqueCallbacks || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <div className="inline-block bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-green-700 font-semibold text-lg">Live • Auto-refresh every 5 seconds</span>
            </div>
            {error && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-red-700 font-semibold text-lg">Connection Issue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyDashboard;