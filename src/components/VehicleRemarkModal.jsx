import React, { useState } from 'react';
import { FaTimes, FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaCommentAlt, FaClock, FaTachometerAlt } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import axiosInstance from '../library/axios';

const VehicleRemarkModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: vehicle?.regNo || '',
    reason: '',
    driverName: '',
    contactNumber: '',
    location: vehicle?.location || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Update form when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: vehicle.regNo || '',
        location: vehicle.location || '',
      }));
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.vehicleNumber || !formData.reason) {
      setError('Vehicle number and reason are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/vehicles/remarks', {
        vehicleNumber: formData.vehicleNumber,
        reason: formData.reason,
        driverName: formData.driverName || null,
        contactNumber: formData.contactNumber || null,
        location: formData.location || null,
        haltedSince: vehicle?.haltedSince || null,
        speed: vehicle?.speed || null,
        vehicleStatus: vehicle?.speed > 0 ? 'Moving' : 'Halted',
      });

      if (response.data.success) {
        // Reset form
        setFormData({
          vehicleNumber: '',
          reason: '',
          driverName: '',
          contactNumber: '',
          location: '',
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.data);
        }

        // Close modal
        onClose();
      }
    } catch (err) {
      console.error('Error saving remark:', err);
      setError(err.response?.data?.message || 'Failed to save remark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        vehicleNumber: '',
        reason: '',
        driverName: '',
        contactNumber: '',
        location: '',
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FaCommentAlt className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Vehicle Remark</h2>
              <p className="text-purple-100 text-sm">Record important information about the vehicle</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Vehicle Status Info Card */}
        {vehicle && (
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-purple-200 px-6 py-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Current Vehicle Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Vehicle Number */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <FaTruck className="text-purple-600" />
                  <span className="font-semibold">Vehicle</span>
                </div>
                <div className="text-gray-800 font-bold">{vehicle.regNo}</div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-gray-600 text-xs font-semibold mb-1">Status</div>
                {vehicle.speed > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Moving
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Halted
                  </span>
                )}
              </div>

              {/* Speed */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <MdSpeed className="text-purple-600" />
                  <span className="font-semibold">Speed</span>
                </div>
                <div className={`text-lg font-bold ${vehicle.speed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {vehicle.speed} km/h
                </div>
              </div>

              {/* Halted Since */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <FaClock className="text-purple-600" />
                  <span className="font-semibold">{vehicle.speed > 0 ? 'Moving Since' : 'Halted Since'}</span>
                </div>
                <div className="text-gray-800 font-bold text-sm">
                  {vehicle.speed > 0 ? vehicle.movingSince : vehicle.haltedSince}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaTruck className="inline mr-2 text-purple-600" />
                Vehicle Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                readOnly={!!vehicle}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-gray-50 text-gray-700 font-semibold uppercase"
                placeholder="e.g., BR06GG1916"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaCommentAlt className="inline mr-2 text-purple-600" />
                Reason / Remark <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700 resize-none"
                placeholder="Enter reason or remark about the vehicle..."
                required
              />
            </div>

            {/* Two columns for Driver and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-purple-600" />
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700"
                  placeholder="Enter driver name"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-purple-600" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 text-purple-600" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-700"
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Vehicle status, speed, and halt time will be automatically saved with this remark for future reference.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Remark'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRemarkModal;
