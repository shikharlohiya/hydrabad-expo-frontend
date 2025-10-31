import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../../context/UserContext";
import { getVehicleData, parseVehicleData } from "../../../services/vehicleApi";
import VehicleMap from "../../../components/VehicleMap";
import VehicleTable from "../../../components/VehicleTable";
import { FaTruck, FaSync } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const DashboardPage = () => {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();

  // State for vehicle data
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to parse halted duration to hours
  const parseHaltedDurationToHours = (haltedSince) => {
    if (!haltedSince) return 0;

    const daysMatch = haltedSince.match(/(\d+)\s*day/i);
    const hrsMatch = haltedSince.match(/(\d+)\s*hr/i);
    const minsMatch = haltedSince.match(/(\d+)\s*min/i);

    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours = hrsMatch ? parseInt(hrsMatch[1]) : 0;
    const minutes = minsMatch ? parseInt(minsMatch[1]) : 0;

    return (days * 24) + hours + (minutes / 60);
  };

  // Fetch vehicle data from API
  const fetchVehicles = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const rawData = await getVehicleData();
      const parsedVehicles = parseVehicleData(rawData);

      // Filter out vehicles halted for 1 day (24 hours) or more
      const shortHaltVehicles = parsedVehicles.filter(vehicle => {
        if (vehicle.speed > 0) return true; // Include all moving vehicles

        const haltedHours = parseHaltedDurationToHours(vehicle.haltedSince);
        return haltedHours < 24; // Less than 1 day
      });

      setVehicles(shortHaltVehicles);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to fetch vehicle data. Please try again.');
      setIsLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchVehicles();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchVehicles();
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Handle call to driver
  const handleCall = (phoneNumber, vehicleName) => {
    console.log('Calling driver:', phoneNumber, vehicleName);
    // TODO: Integrate with your calling system
    alert(`Calling ${vehicleName} at ${phoneNumber}`);
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';

    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // difference in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-700">Loading Vehicle Data...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the latest vehicle information</p>
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md border-2 border-red-200">
          <div className="text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-red-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md"
            >
              <div className="flex items-center gap-2">
                <MdRefresh className="text-xl" />
                Retry
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <FaTruck className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Chicks Vehicle Tracking</h1>
              <p className="text-purple-100 mt-1">Real-time monitoring and fleet management system</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-refresh toggle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-white text-sm font-medium">Auto-refresh</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <MdRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-purple-100 text-sm font-medium">Total Vehicles</div>
            <div className="text-white text-3xl font-bold mt-1">{vehicles.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-purple-100 text-sm font-medium">Moving</div>
            <div className="text-green-300 text-3xl font-bold mt-1">
              {vehicles.filter(v => v.speed > 0).length}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-purple-100 text-sm font-medium">Halted</div>
            <div className="text-red-300 text-3xl font-bold mt-1">
              {vehicles.filter(v => v.speed === 0).length}
            </div>
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-4 text-purple-100 text-sm">
          Last updated: <span className="font-semibold">{formatLastUpdated()}</span>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-6">
        <VehicleMap
          vehicles={vehicles}
          onVehicleSelect={handleVehicleSelect}
          onCall={handleCall}
        />
      </div>

      {/* Table Section */}
      <div>
        <VehicleTable
          vehicles={vehicles}
          onVehicleClick={handleVehicleSelect}
          onCall={handleCall}
        />
      </div>

      {/* Error message if refresh fails but we have cached data */}
      {error && vehicles.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">Refresh Warning</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-yellow-500 hover:text-yellow-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
