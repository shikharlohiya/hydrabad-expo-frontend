import React, { useState } from "react";
import { MessageCircle, Search, RefreshCw, Phone } from "lucide-react";
import WhatsAppMessages from "../../../components/CallRemarks/WhatsAppMessages";

const WhatsAppPage = () => {
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = () => {
    if (searchInput.trim()) {
      setCurrentPhoneNumber(searchInput.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h1>
                  <p className="text-gray-600 mt-1">
                    View and manage customer WhatsApp communications
                  </p>
                </div>
              </div>

              {/* Search Section */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter mobile number..."
                      className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Search Info */}
            {currentPhoneNumber && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Viewing messages for: {currentPhoneNumber}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Messages Content */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="h-[calc(100vh-200px)]">
            {currentPhoneNumber ? (
              <WhatsAppMessages phoneNumber={currentPhoneNumber} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No WhatsApp Messages Selected
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Enter a mobile number in the search box above to view WhatsApp messages
                    for that customer.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Search by mobile number (e.g., 9876543210)</p>
                    <p>• View text, image, and video messages</p>
                    <p>• Refresh to get latest messages</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        {!currentPhoneNumber && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-500 mt-0.5">
                💡
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter the mobile number with or without country code</li>
                  <li>• Messages are sorted by latest first</li>
                  <li>• Click on images to view in full size</li>
                  <li>• Videos have built-in player controls</li>
                  <li>• Use the refresh button to get latest messages</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppPage;