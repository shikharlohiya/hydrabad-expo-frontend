import React, { useState, useEffect } from 'react';
import { FaTimes, FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaCommentAlt, FaTachometerAlt } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import axiosInstance from '../library/axios';

const VehicleRemarksViewModal = ({ isOpen, onClose, vehicleNumber }) => {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && vehicleNumber) {
      fetchRemarks();
    }
  }, [isOpen, vehicleNumber]);

  const fetchRemarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/vehicles/remarks/${vehicleNumber}`);

      if (response.data.success) {
        setRemarks(response.data.data);
      } else {
        setError('Failed to fetch remarks');
      }
    } catch (err) {
      console.error('Error fetching remarks:', err);
      setError('Error loading remarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isRecent = (dateString) => {
    const remarkDate = new Date(dateString);
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return remarkDate >= twentyFourHoursAgo;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FaCommentAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vehicle Remarks History</h2>
              <p className="text-blue-100 text-sm">
                {vehicleNumber ? vehicleNumber.toUpperCase() : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading remarks...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && remarks.length === 0 && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-12 text-center">
              <FaCommentAlt className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No remarks found</p>
              <p className="text-gray-500 text-sm mt-2">There are no remarks recorded for this vehicle yet.</p>
            </div>
          )}

          {!loading && !error && remarks.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase">Total Remarks</p>
                    <p className="text-3xl font-bold text-blue-700">{remarks.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase">Last 24 Hours</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {remarks.filter(r => isRecent(r.createdAt)).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks List */}
              {remarks.map((remark, index) => (
                <div
                  key={remark.id}
                  className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    isRecent(remark.createdAt)
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Remark Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        #{remarks.length - index}
                      </span>
                      {isRecent(remark.createdAt) && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          Recent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock className="text-gray-400" />
                      {formatDate(remark.createdAt)}
                    </div>
                  </div>

                  {/* Remark Reason */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <FaCommentAlt className="text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Remark</p>
                        <p className="text-gray-800 font-medium">{remark.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remark Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Driver Name */}
                    {remark.driverName && (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Driver</p>
                          <p className="text-sm text-gray-800">{remark.driverName}</p>
                        </div>
                      </div>
                    )}

                    {/* Contact Number */}
                    {remark.contactNumber && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Contact</p>
                          <p className="text-sm text-gray-800">{remark.contactNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Status */}
                    {remark.vehicleStatus && (
                      <div className="flex items-center gap-2">
                        <FaTruck className={`flex-shrink-0 ${remark.vehicleStatus === 'Moving' ? 'text-green-500' : 'text-red-500'}`} />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Status</p>
                          <p className={`text-sm font-semibold ${remark.vehicleStatus === 'Moving' ? 'text-green-600' : 'text-red-600'}`}>
                            {remark.vehicleStatus}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Speed */}
                    {remark.speed !== null && remark.speed !== undefined && (
                      <div className="flex items-center gap-2">
                        <MdSpeed className="text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Speed</p>
                          <p className="text-sm text-gray-800">{remark.speed} km/h</p>
                        </div>
                      </div>
                    )}

                    {/* Halted Since */}
                    {remark.haltedSince && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Halted Duration</p>
                          <p className="text-sm text-gray-800">{remark.haltedSince}</p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {remark.location && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Location</p>
                          <p className="text-sm text-gray-800">{remark.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Created By */}
                  {remark.creator && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Submitted by: <span className="font-semibold text-gray-700">{remark.creator.EmployeeName}</span>
                        {remark.creator.EmployeePhone && ` (${remark.creator.EmployeePhone})`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleRemarksViewModal;
