import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTruck, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon - smaller size
const createVehicleIcon = (isMoving) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        background: ${isMoving ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Component to adjust map bounds - focuses on India
const MapBoundsAdjuster = ({ vehicles }) => {
  const map = useMap();

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const bounds = L.latLngBounds(
        vehicles.map(v => [v.latitude, v.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [vehicles, map]);

  return null;
};

const VehicleMap = ({ vehicles, onVehicleSelect, onCall }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Default center (India - better centered)
  const defaultCenter = [22.5937, 78.9629];

  const handleMarkerClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };

  const handleCall = (phoneNumber, vehicleName) => {
    if (onCall) {
      onCall(phoneNumber, vehicleName);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getSpeedColor = (speed) => {
    if (speed === 0) return 'text-red-500';
    if (speed < 20) return 'text-yellow-500';
    if (speed < 40) return 'text-blue-500';
    return 'text-green-500';
  };

  // India bounds - restricts map to India only
  const indiaBounds = [
    [6.5, 68.0],  // Southwest coordinates (bottom-left)
    [35.5, 97.5]  // Northeast coordinates (top-right)
  ];

  return (
    <div className="w-full h-[650px] rounded-xl overflow-hidden shadow-lg border-2 border-purple-200">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        minZoom={5}
        maxZoom={18}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          bounds={indiaBounds}
        />

        {vehicles && vehicles.length > 0 && (
          <>
            <MapBoundsAdjuster vehicles={vehicles} />
            {vehicles.map((vehicle, index) => (
              <Marker
                key={`${vehicle.regNo}-${index}`}
                position={[vehicle.latitude, vehicle.longitude]}
                icon={createVehicleIcon(vehicle.speed > 0)}
                eventHandlers={{
                  click: () => handleMarkerClick(vehicle)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false}>
                  <div className="text-center">
                    <div className="font-bold text-sm">{vehicle.regNo}</div>
                    <div className="text-xs text-gray-600">{vehicle.speed > 0 ? 'Moving' : 'Halted'}</div>
                  </div>
                </Tooltip>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[280px]">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-200">
                      <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-2 rounded-lg">
                        <FaTruck className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{vehicle.regNo}</h3>
                        <p className="text-xs text-gray-600">{vehicle.virtualName}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Speed:</span>
                        <span className={`font-bold ${getSpeedColor(vehicle.speed)}`}>
                          {vehicle.speed} km/h
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className={`font-semibold ${vehicle.speed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vehicle.speed > 0 ? 'Moving' : 'Halted'}
                        </span>
                      </div>

                      {vehicle.speed > 0 ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Moving Since:</span>
                          <span className="text-gray-800 font-semibold">{vehicle.movingSince}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Halted Since:</span>
                          <span className="text-gray-800 font-semibold">{vehicle.haltedSince}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-purple-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-xs">{vehicle.location}</span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600 font-medium">Last Update:</span>
                        <span className="text-gray-800 text-xs">{vehicle.noDataSince}</span>
                      </div>

                      {/* Call Button */}
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <button
                          onClick={() => handleCall(vehicle.phoneNumber || '1234567890', vehicle.virtualName)}
                          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                        >
                          <FaPhoneAlt className="text-sm" />
                          Call Driver
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
