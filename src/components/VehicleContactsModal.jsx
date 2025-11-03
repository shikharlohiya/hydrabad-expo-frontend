import React, { useState, useEffect, useRef } from 'react';
import { FaPhoneAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { useCall } from '../hooks/useCall';
import axios from 'axios';

const VehicleContactsModal = ({ isOpen, onClose, vehicleNumber, buttonRef }) => {
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { initiateCall, isInitiatingCall } = useCall();
  const [callingNumber, setCallingNumber] = useState(null);
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && vehicleNumber) {
      fetchVehicleDetails();
    }
  }, [isOpen, vehicleNumber]);

  // Position popover near the button
  useEffect(() => {
    if (isOpen && buttonRef?.current && popoverRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      // Calculate position (to the right of the button, or left if no space)
      let left = buttonRect.right + 10;
      let top = buttonRect.top;

      // If popover goes off-screen to the right, show it on the left
      if (left + popoverRect.width > window.innerWidth) {
        left = buttonRect.left - popoverRect.width - 10;
      }

      // If popover goes off-screen at bottom, adjust upward
      if (top + popoverRect.height > window.innerHeight) {
        top = window.innerHeight - popoverRect.height - 10;
      }

      // If still goes off top, pin to top
      if (top < 10) {
        top = 10;
      }

      setPosition({ top, left });
    }
  }, [isOpen, buttonRef, vehicleDetails]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) &&
          buttonRef?.current && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5800/api/hatchery/vehicle/${vehicleNumber}`);
      if (response.data.success) {
        setVehicleDetails(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch vehicle details');
      }
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError(err.response?.data?.message || 'Failed to fetch vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (phoneNumber, name) => {
    if (!phoneNumber) {
      alert('No phone number available for this contact');
      return;
    }

    setCallingNumber(phoneNumber);
    try {
      await initiateCall(phoneNumber);
      console.log(`Initiating call to ${name} at ${phoneNumber}`);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      alert('Failed to initiate call. Please try again.');
    } finally {
      setCallingNumber(null);
    }
  };

  if (!isOpen) return null;

  const contacts = vehicleDetails ? [
    {
      name: vehicleDetails.driverName || 'N/A',
      phone: vehicleDetails.driverContactNumber,
      role: 'Driver',
      iconColor: 'text-blue-600'
    },
    {
      name: vehicleDetails.transportarName || 'N/A',
      phone: vehicleDetails.transportarContactNumber,
      role: 'Transporter',
      iconColor: 'text-green-600'
    },
    {
      name: vehicleDetails.coordinatorName || 'N/A',
      phone: vehicleDetails.coordinatorContactNumber,
      role: 'Coordinator',
      iconColor: 'text-purple-600'
    }
  ] : [];

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white rounded-lg shadow-2xl border-2 border-purple-200 z-[9999] w-80"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: 'calc(100vh - 20px)',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-3 py-2 flex items-center justify-between rounded-t-lg">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">Contacts</h3>
          <p className="text-purple-100 text-xs truncate">{vehicleNumber}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-1 rounded-full transition-all duration-200 ml-2"
          title="Close"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-6">
            <FaSpinner className="text-2xl text-purple-600 animate-spin mb-2" />
            <p className="text-gray-600 text-xs">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-red-700 text-xs mb-2">{error}</p>
            <button
              onClick={fetchVehicleDetails}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && vehicleDetails && (
          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${contact.iconColor} uppercase mb-0.5`}>
                      {contact.role}
                    </p>
                    <p className="font-semibold text-gray-900 text-sm truncate">{contact.name}</p>
                    <p className="text-gray-600 text-xs font-mono">
                      {contact.phone || 'No phone'}
                    </p>
                  </div>

                  {/* Call Button */}
                  {contact.phone && (
                    <button
                      onClick={() => handleCall(contact.phone, contact.name)}
                      disabled={isInitiatingCall || callingNumber === contact.phone}
                      className={`
                        px-2 py-1.5 rounded-full font-semibold transition-all duration-200 shadow-sm
                        flex items-center gap-1 text-xs flex-shrink-0
                        ${isInitiatingCall && callingNumber === contact.phone
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                        }
                        text-white
                      `}
                      title={`Call ${contact.name}`}
                    >
                      {isInitiatingCall && callingNumber === contact.phone ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaPhoneAlt className="text-xs" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleContactsModal;
