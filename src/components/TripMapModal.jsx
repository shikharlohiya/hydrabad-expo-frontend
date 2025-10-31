import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTimes, FaTruck, FaMapMarkerAlt, FaFlag, FaFlagCheckered, FaPhone, FaBox } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import axiosInstance from '../library/axios';

// Custom marker icons
const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-start-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        border: 3px solid white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const createCurrentIcon = () => {
  return L.divIcon({
    className: 'custom-current-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
        border: 3px solid white;
        animation: pulse 2s infinite;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-destination-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        border: 3px solid white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Map bounds adjuster
const MapBoundsAdjuster = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
};

const TripMapModal = ({ isOpen, onClose, vehicle, currentLocation }) => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && vehicle) {
      fetchTrips();
    }
  }, [isOpen, vehicle]);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/vehicles/trips/${vehicle.regNo}`);

      if (response.data.success && response.data.data) {
        setTrips(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedTrip(response.data.data[0]); // Select first trip by default
        }
      } else {
        setError('No trips found for this vehicle');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trip data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTrips([]);
    setSelectedTrip(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Prepare map data
  const getMapData = () => {
    if (!selectedTrip || !currentLocation) return null;

    const loadingPoint = selectedTrip.unloadingPoints[0]?.loadingPointLatLong;
    const unloadingPoint = selectedTrip.unloadingPoints[0];
    const current = { lat: currentLocation.latitude, lng: currentLocation.longitude };

    if (!loadingPoint || !unloadingPoint) return null;

    // Handle both 'latitude' and 'lattitude' (API inconsistency)
    const startLat = loadingPoint.lattitude || loadingPoint.latitude;
    const startLng = loadingPoint.longitude;
    const endLat = parseFloat(unloadingPoint.lattitude || unloadingPoint.latitude);
    const endLng = parseFloat(unloadingPoint.longitude);

    const start = [startLat, startLng];
    const end = [endLat, endLng];
    const currentPos = [current.lat, current.lng];

    // Route polyline points
    const routePoints = [start, currentPos, end];

    return {
      start,
      currentPos,
      end,
      routePoints,
      loadingPoint: selectedTrip.loadingPoint,
      unloadingPoint: unloadingPoint.unloadingPoint,
      unloadingAddress: unloadingPoint.address
    };
  };

  const mapData = getMapData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FaTruck className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Trip Route - {vehicle?.regNo}</h2>
              <p className="text-purple-100 text-sm">Real-time trip tracking and route visualization</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading trip data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTruck className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Trip Data</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : selectedTrip && mapData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Trip Details Sidebar */}
              <div className="lg:col-span-1 bg-gray-50 p-6 border-r-2 border-purple-200 overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Trip Details</h3>

                <div className="space-y-4">
                  {/* Shipment Info */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-100">
                    <div className="text-xs text-gray-600 font-semibold mb-2">SHIPMENT</div>
                    <div className="text-lg font-bold text-purple-600">{selectedTrip.shipmentNumber}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedTrip.biddingNumber}</div>
                  </div>

                  {/* Status */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-100">
                    <div className="text-xs text-gray-600 font-semibold mb-2">STATUS</div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      {selectedTrip.status}
                    </span>
                  </div>

                  {/* Material & Quantity */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-100">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FaBox />
                      <span className="text-xs font-semibold">MATERIAL</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{selectedTrip.materialType}</div>
                    <div className="text-xs text-gray-600 mt-1">{selectedTrip.totalQuantity}</div>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-100">
                    <div className="text-xs text-gray-600 font-semibold mb-2">DRIVER</div>
                    <div className="text-sm font-semibold text-gray-800">{selectedTrip.driverName}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FaPhone className="text-xs" />
                      {selectedTrip.driverPhone}
                    </div>
                  </div>

                  {/* Loading Point */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FaFlag />
                      <span className="text-xs font-semibold">LOADING POINT</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{mapData.loadingPoint}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(selectedTrip.loadingDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Unloading Point */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-red-100">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <FaFlagCheckered />
                      <span className="text-xs font-semibold">UNLOADING POINT</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{mapData.unloadingPoint}</div>
                    <div className="text-xs text-gray-600 mt-1">{mapData.unloadingAddress}</div>
                    <div className="text-xs text-gray-600 mt-1">{selectedTrip.unloadingPoints[0].receivingPerson}</div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="lg:col-span-2 h-[600px]">
                <MapContainer
                  center={mapData.currentPos}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapBoundsAdjuster points={mapData.routePoints} />

                  {/* Route Line */}
                  <Polyline
                    positions={mapData.routePoints}
                    color="#9333ea"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />

                  {/* Loading Point Marker */}
                  <Marker position={mapData.start} icon={createStartIcon()}>
                    <Popup>
                      <div className="p-2">
                        <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                          <FaFlag />
                          Loading Point
                        </div>
                        <div className="text-sm font-semibold">{mapData.loadingPoint}</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Current Position Marker */}
                  <Marker position={mapData.currentPos} icon={createCurrentIcon()}>
                    <Popup>
                      <div className="p-2">
                        <div className="flex items-center gap-2 text-green-600 font-bold mb-1">
                          <FaTruck />
                          Current Location
                        </div>
                        <div className="text-sm font-semibold">{vehicle.regNo}</div>
                        <div className="text-xs text-gray-600 mt-1">{currentLocation.location}</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination Marker */}
                  <Marker position={mapData.end} icon={createDestinationIcon()}>
                    <Popup>
                      <div className="p-2">
                        <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                          <FaFlagCheckered />
                          Destination
                        </div>
                        <div className="text-sm font-semibold">{mapData.unloadingPoint}</div>
                        <div className="text-xs text-gray-600 mt-1">{mapData.unloadingAddress}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">No trip data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMapModal;
