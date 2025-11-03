import React, { useState, useMemo, useRef } from 'react';
import { FaTruck, FaMapMarkerAlt, FaTachometerAlt, FaClock, FaCompass, FaPhoneAlt, FaFilter, FaSearch, FaCommentAlt, FaRoute, FaEye } from 'react-icons/fa';
import { MdLocationOn, MdSpeed } from 'react-icons/md';
import VehicleRemarkModal from './VehicleRemarkModal';
import VehicleRemarksViewModal from './VehicleRemarksViewModal';
import TripMapModal from './TripMapModal';
import VehicleContactsModal from './VehicleContactsModal';

const VehicleTable = ({ vehicles, onVehicleClick, onCall }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // all, moving, halted
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState('all'); // all, 10min, 20min, 30min, more30min

  // Remark modal state
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedVehicleForRemark, setSelectedVehicleForRemark] = useState(null);

  // Trip modal state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [selectedVehicleForTrip, setSelectedVehicleForTrip] = useState(null);

  // Remarks view modal state
  const [isRemarksViewModalOpen, setIsRemarksViewModalOpen] = useState(false);
  const [selectedVehicleForRemarksView, setSelectedVehicleForRemarksView] = useState(null);

  // Contacts modal state
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [selectedVehicleForContacts, setSelectedVehicleForContacts] = useState(null);
  const callButtonRefs = useRef({});

  const getStatusBadge = (speed) => {
    if (speed > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-md">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Moving
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold rounded-full shadow-md">
        <span className="w-2 h-2 bg-white rounded-full"></span>
        Halted
      </span>
    );
  };

  const getSpeedColor = (speed) => {
    if (speed === 0) return 'text-red-600';
    if (speed < 20) return 'text-yellow-600';
    if (speed < 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const handleRowClick = (vehicle) => {
    setSelectedVehicle(vehicle.regNo);
    if (onVehicleClick) {
      onVehicleClick(vehicle);
    }
  };

  const handleCall = (e, vehicleNumber) => {
    e.stopPropagation(); // Prevent row click
    setSelectedVehicleForContacts(vehicleNumber);
    setIsContactsModalOpen(true);
  };

  const handleAddRemark = (e, vehicle) => {
    e.stopPropagation(); // Prevent row click
    setSelectedVehicleForRemark(vehicle);
    setIsRemarkModalOpen(true);
  };

  const handleRemarkSuccess = (remark) => {
    console.log('Remark saved successfully:', remark);
    // You can add a toast notification here
    alert(`Remark saved successfully for vehicle ${remark.vehicleNumber}`);
  };

  const handleViewTrip = (e, vehicle) => {
    e.stopPropagation(); // Prevent row click
    setSelectedVehicleForTrip(vehicle);
    setIsTripModalOpen(true);
  };

  const handleViewRemarks = (e, vehicleNumber) => {
    e.stopPropagation(); // Prevent row click
    setSelectedVehicleForRemarksView(vehicleNumber);
    setIsRemarksViewModalOpen(true);
  };

  // Parse halted duration from string like "2 hrs 15 mins" or "45 mins" to minutes
  const parseHaltedDuration = (haltedSince) => {
    if (!haltedSince) return 0;

    const hrsMatch = haltedSince.match(/(\d+)\s*hr/i);
    const minsMatch = haltedSince.match(/(\d+)\s*min/i);

    const hours = hrsMatch ? parseInt(hrsMatch[1]) : 0;
    const minutes = minsMatch ? parseInt(minsMatch[1]) : 0;

    return (hours * 60) + minutes;
  };

  // Filter vehicles based on all filter criteria
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Status filter
      if (statusFilter === 'moving' && vehicle.speed === 0) return false;
      if (statusFilter === 'halted' && vehicle.speed > 0) return false;

      // Search filter
      if (searchQuery && !vehicle.regNo.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Duration filter (only for halted vehicles)
      if (durationFilter !== 'all' && vehicle.speed === 0) {
        const haltedMinutes = parseHaltedDuration(vehicle.haltedSince);

        if (durationFilter === '10min' && haltedMinutes > 10) return false;
        if (durationFilter === '20min' && (haltedMinutes <= 10 || haltedMinutes > 20)) return false;
        if (durationFilter === '30min' && (haltedMinutes <= 20 || haltedMinutes > 30)) return false;
        if (durationFilter === 'more30min' && haltedMinutes <= 30) return false;
      }

      return true;
    });
  }, [vehicles, statusFilter, searchQuery, durationFilter]);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-purple-100">
        <div className="bg-gradient-to-br from-purple-100 to-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTruck className="text-purple-600 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Vehicle Data Available</h3>
        <p className="text-gray-500">Waiting for vehicle tracking data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <FaTruck className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Vehicle Tracking Details</h2>
            <p className="text-purple-100 text-sm">Real-time monitoring of {filteredVehicles.length} / {vehicles.length} vehicles</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 border-b-2 border-purple-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
              <FaFilter className="inline mr-1" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700 font-medium"
            >
              <option value="all">All Vehicles</option>
              <option value="moving">Moving Only</option>
              <option value="halted">Halted Only</option>
            </select>
          </div>

          {/* Search by Vehicle Number */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
              <FaSearch className="inline mr-1" /> Search Vehicle
            </label>
            <input
              type="text"
              placeholder="Enter vehicle number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700"
            />
          </div>

          {/* Halted Duration Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
              <FaClock className="inline mr-1" /> Halted Duration
            </label>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700 font-medium"
            >
              <option value="all">All Durations</option>
              <option value="10min">0-10 Minutes</option>
              <option value="20min">10-20 Minutes</option>
              <option value="30min">20-30 Minutes</option>
              <option value="more30min">More than 30 Min</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || searchQuery || durationFilter !== 'all') && (
            <div className="flex-shrink-0 self-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                  setDurationFilter('all');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-purple-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Vehicle Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Speed
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaFilter className="mx-auto text-4xl mb-3 text-gray-400" />
                    <p className="text-lg font-semibold">No vehicles match the selected filters</p>
                    <p className="text-sm mt-2">Try adjusting your filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle, index) => (
              <tr
                key={`${vehicle.regNo}-${index}`}
                onClick={() => handleRowClick(vehicle)}
                className={`
                  transition-all duration-200 cursor-pointer
                  ${selectedVehicle === vehicle.regNo
                    ? 'bg-purple-50 border-l-4 border-purple-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }
                `}
              >
                {/* Vehicle Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${vehicle.speed > 0
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                        : 'bg-gradient-to-br from-red-100 to-rose-100'
                      }
                    `}>
                      <FaTruck className={`
                        text-xl
                        ${vehicle.speed > 0 ? 'text-green-600' : 'text-red-600'}
                      `} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{vehicle.regNo}</div>
                      <div className="text-xs text-gray-600">{vehicle.virtualName}</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {getStatusBadge(vehicle.speed)}
                </td>

                {/* Speed */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MdSpeed className={`text-xl ${getSpeedColor(vehicle.speed)}`} />
                    <div>
                      <div className={`font-bold text-lg ${getSpeedColor(vehicle.speed)}`}>
                        {vehicle.speed}
                      </div>
                      <div className="text-xs text-gray-500">km/h</div>
                    </div>
                  </div>
                </td>

                {/* Duration */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-800 font-medium">
                        {vehicle.speed > 0 ? vehicle.movingSince : vehicle.haltedSince}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicle.speed > 0 ? 'Moving' : 'Halted'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 max-w-xs">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-purple-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {vehicle.location}
                    </div>
                  </div>
                </td>

                {/* Last Update */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-800 font-medium">{vehicle.noDataSince}</div>
                    <div className="text-xs text-gray-500">ago</div>
                  </div>
                </td>

                {/* Actions - Call, Remark, View Remarks & Trip Buttons */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <button
                      ref={(el) => (callButtonRefs.current[vehicle.regNo] = el)}
                      onClick={(e) => handleCall(e, vehicle.regNo)}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md flex items-center gap-2"
                      title="View Contacts & Call"
                    >
                      <FaPhoneAlt className="text-sm" />
                      Call
                    </button>
                    <button
                      onClick={(e) => handleAddRemark(e, vehicle)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md flex items-center gap-2"
                      title="Add Remark"
                    >
                      <FaCommentAlt className="text-sm" />
                      Remark
                    </button>
                    <button
                      onClick={(e) => handleViewRemarks(e, vehicle.regNo)}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md flex items-center gap-2"
                      title="View All Remarks"
                    >
                      <FaEye className="text-sm" />
                      View
                    </button>
                    <button
                      onClick={(e) => handleViewTrip(e, vehicle)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md flex items-center gap-2"
                      title="View Trip Route"
                    >
                      <FaRoute className="text-sm" />
                      Trip
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-t-2 border-purple-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700 font-medium">
                Moving: <span className="font-bold text-green-600">
                  {filteredVehicles.filter(v => v.speed > 0).length}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-700 font-medium">
                Halted: <span className="font-bold text-red-600">
                  {filteredVehicles.filter(v => v.speed === 0).length}
                </span>
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing: <span className="font-bold text-purple-600">{filteredVehicles.length}</span> / {vehicles.length} vehicles
          </div>
        </div>
      </div>

      {/* Vehicle Remark Modal */}
      <VehicleRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setIsRemarkModalOpen(false)}
        vehicle={selectedVehicleForRemark}
        onSuccess={handleRemarkSuccess}
      />

      {/* Trip Map Modal */}
      <TripMapModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        vehicle={selectedVehicleForTrip}
        currentLocation={selectedVehicleForTrip ? {
          latitude: selectedVehicleForTrip.latitude,
          longitude: selectedVehicleForTrip.longitude,
          location: selectedVehicleForTrip.location
        } : null}
      />

      {/* Vehicle Remarks View Modal */}
      <VehicleRemarksViewModal
        isOpen={isRemarksViewModalOpen}
        onClose={() => setIsRemarksViewModalOpen(false)}
        vehicleNumber={selectedVehicleForRemarksView}
      />

      {/* Vehicle Contacts Modal */}
      <VehicleContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        vehicleNumber={selectedVehicleForContacts}
        buttonRef={{ current: callButtonRefs.current[selectedVehicleForContacts] }}
      />
    </div>
  );
};

export default VehicleTable;
