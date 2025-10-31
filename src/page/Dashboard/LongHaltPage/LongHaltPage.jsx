import React, { useState, useEffect } from 'react';
import { FaTruck, FaSync, FaClock } from 'react-icons/fa';
import VehicleMap from '../../../components/VehicleMap';
import VehicleTable from '../../../components/VehicleTable';
import axiosInstance from '../../../library/axios';

const LongHaltPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/vehicles/tracking');

      if (response.data.success) {
        // Filter only vehicles that are halted for 1 day (24 hours) or more
        const longHaltVehicles = response.data.data.filter(vehicle => {
          if (vehicle.speed > 0) return false; // Skip moving vehicles

          const haltedHours = parseHaltedDurationToHours(vehicle.haltedSince);
          return haltedHours >= 24; // 1 day or more
        });

        setVehicles(longHaltVehicles);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Failed to fetch vehicle data');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Error loading vehicle data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVehicleClick = (vehicle) => {
    console.log('Vehicle clicked:', vehicle);
  };

  const handleCall = (phoneNumber, vehicleName) => {
    alert(`Calling ${vehicleName} at ${phoneNumber}`);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const haltedOver1Day = vehicles.filter(v => parseHaltedDurationToHours(v.haltedSince) >= 24 && parseHaltedDurationToHours(v.haltedSince) < 48).length;
  const haltedOver2Days = vehicles.filter(v => parseHaltedDurationToHours(v.haltedSince) >= 48 && parseHaltedDurationToHours(v.haltedSince) < 72).length;
  const haltedOver3Days = vehicles.filter(v => parseHaltedDurationToHours(v.haltedSince) >= 72).length;

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading long halt vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-50 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-100 to-rose-100 p-4 rounded-xl">
              <FaClock className="text-red-600 text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Long Halt Vehicles
              </h1>
              <p className="text-gray-600 mt-1">
                Vehicles halted for 1 day or more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-refresh Toggle */}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border-2 border-gray-200">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="autoRefresh" className="text-sm font-medium text-gray-700 cursor-pointer">
                Auto-refresh (30s)
              </label>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md disabled:opacity-50"
            >
              <FaSync className={`${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase">Total Long Halt</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{totalVehicles}</p>
              </div>
              <FaTruck className="text-red-400 text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase">1-2 Days</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">{haltedOver1Day}</p>
              </div>
              <FaClock className="text-orange-400 text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase">2-3 Days</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{haltedOver2Days}</p>
              </div>
              <FaClock className="text-amber-400 text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase">3+ Days</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{haltedOver3Days}</p>
              </div>
              <FaClock className="text-red-400 text-3xl" />
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Last updated: {formatLastUpdated()}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Map Section */}
      <div className="mb-6">
        <VehicleMap vehicles={vehicles} />
      </div>

      {/* Table Section */}
      <VehicleTable
        vehicles={vehicles}
        onVehicleClick={handleVehicleClick}
        onCall={handleCall}
      />
    </div>
  );
};

export default LongHaltPage;
