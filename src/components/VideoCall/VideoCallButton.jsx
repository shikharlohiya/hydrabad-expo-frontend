import React, { useState } from "react";
import { Video, Copy, ExternalLink, X, Phone, MessageCircle, Search, Send, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../library/axios";

const VideoCallButton = ({
  onStartVideoCall,
  onCloseVideoCall,
  videoCallLink,
  isVideoCallActive,
  customerData,
  phoneNumber
}) => {
  // WhatsApp sending state
  const [whatsappSearchInput, setWhatsappSearchInput] = useState(phoneNumber || "");
  const [currentMobileNumber, setCurrentMobileNumber] = useState(phoneNumber || "");
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState(null);

  // Update search input when phoneNumber prop changes
  React.useEffect(() => {
    if (phoneNumber) {
      setWhatsappSearchInput(phoneNumber);
      setCurrentMobileNumber(phoneNumber);
    }
  }, [phoneNumber]);
  const handleCopyLink = async () => {
    if (!videoCallLink) return;

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = videoCallLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const result = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (result) {
            toast.success("Video call link copied to clipboard!");
          } else {
            throw new Error('execCommand failed');
          }
        } catch (fallbackError) {
          document.body.removeChild(textArea);
          throw fallbackError;
        }
        return;
      }

      // Add timeout to prevent hanging
      const copyPromise = navigator.clipboard.writeText(videoCallLink);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Copy timeout')), 3000)
      );

      await Promise.race([copyPromise, timeoutPromise]);
      toast.success("Video call link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);

      // Show different error messages based on error type
      if (error.message === 'Copy timeout') {
        toast.error("Copy operation timed out. Please try again.");
      } else if (error.name === 'NotAllowedError') {
        toast.error("Clipboard access denied. Please allow clipboard permissions.");
      } else {
        toast.error("Failed to copy link. Please copy manually.");
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (!videoCallLink) return;
    window.open(videoCallLink, '_blank');
  };

  // Handle mobile number search
  const handleMobileSearch = () => {
    if (whatsappSearchInput.trim()) {
      setCurrentMobileNumber(whatsappSearchInput.trim());
    }
  };

  // Send video call link via WhatsApp
  const sendVideoCallWhatsApp = async () => {
    if (!videoCallLink || !currentMobileNumber) {
      setWhatsappResult({
        success: false,
        message: "Please create a video call link and enter a mobile number first"
      });
      return;
    }

    setSendingWhatsApp(true);
    setWhatsappResult(null);

    try {
      // Clean the mobile number (remove non-digits)
      const cleanMobile = currentMobileNumber.replace(/\D/g, "");

      // Remove country code if present (assuming +91 for India)
      const mobileWithoutCountryCode = cleanMobile.startsWith("91") && cleanMobile.length > 10
        ? cleanMobile.substring(2)
        : cleanMobile;

      // Extract just the room identifier from the full URL
      const roomMatch = videoCallLink.match(/meet\.jit\.si\/([^?]+)/);
      const roomIdentifier = roomMatch ? roomMatch[1] : '';

      if (!roomIdentifier) {
        throw new Error("Invalid video call link format");
      }

      console.log(`📤 Sending video call WhatsApp to: ${mobileWithoutCountryCode}`);
      console.log(`📹 Room identifier: ${roomIdentifier}`);

      const response = await axiosInstance.post(`/send-dynamic-url`, {
        mobile_number: mobileWithoutCountryCode,
        dynamic_url: roomIdentifier
      });

      if (response.data && response.data.success) {
        setWhatsappResult({
          success: true,
          message: "Video call link sent via WhatsApp!",
          data: response.data.data
        });
        console.log("✅ Video call WhatsApp sent successfully:", response.data);
      } else {
        setWhatsappResult({
          success: false,
          message: response.data?.message || "Failed to send WhatsApp"
        });
      }
    } catch (error) {
      console.error("❌ Error sending video call WhatsApp:", error);
      setWhatsappResult({
        success: false,
        message: error.response?.data?.message || "Failed to send WhatsApp"
      });
    } finally {
      setSendingWhatsApp(false);

      // Clear result after 5 seconds
      setTimeout(() => {
        setWhatsappResult(null);
      }, 5000);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Video className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">Video Call</h4>
      </div>

      {/* WhatsApp Mobile Number Search */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-medium text-gray-900">WhatsApp Number</h5>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={whatsappSearchInput}
              onChange={(e) => setWhatsappSearchInput(e.target.value)}
              placeholder="Enter mobile number..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => e.key === "Enter" && handleMobileSearch()}
            />
          </div>
          <button
            onClick={handleMobileSearch}
            disabled={!whatsappSearchInput.trim()}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Set</span>
          </button>
        </div>

        {/* Current Number Info */}
        {currentMobileNumber && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp will be sent to: {currentMobileNumber}</span>
            </div>
          </div>
        )}
      </div>

      {!isVideoCallActive ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h5 className="text-lg font-medium text-gray-900 mb-2">
                Start Video Call
              </h5>
              <p className="text-sm text-gray-600 mb-4">
                Generate a video call link to share with the customer
              </p>
            </div>

            {/* Customer Info */}
            {(customerData || phoneNumber) && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Customer Details:</div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>{customerData?.name || "Customer"}</span>
                </div>
                {phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{phoneNumber}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onStartVideoCall}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Create Video Call Link</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {/* Video Call Status */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Video call room created
                </span>
              </div>
              <button
                onClick={onCloseVideoCall}
                className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="End video call"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Meeting room is ready for {customerData?.name || phoneNumber || 'Customer'}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h6 className="text-sm font-medium text-blue-900 mb-2">How to use:</h6>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Copy the link below and share it with the customer</li>
              <li>• Customer can join directly by clicking the link</li>
              <li>• Click "Join Call" to enter the video meeting</li>
            </ul>
          </div>

          {/* Video Call Link */}
          {videoCallLink && (
            <div className="space-y-3">
              <div className="text-sm text-gray-500 font-medium">Share this link with customer:</div>

              {/* Link Display */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-mono text-gray-700 break-all">
                  {videoCallLink}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={sendVideoCallWhatsApp}
                  disabled={sendingWhatsApp || !currentMobileNumber}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className={`w-3 h-3 ${sendingWhatsApp ? "animate-pulse" : ""}`} />
                  <span>{sendingWhatsApp ? "Sending..." : "WhatsApp"}</span>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Join</span>
                </button>
              </div>

              {/* WhatsApp Result Message */}
              {whatsappResult && (
                <div className="mt-3">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                    whatsappResult.success
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                    {whatsappResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{whatsappResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>💡 No installation required - works in any modern web browser</p>
            <p>📱 Customer can join from mobile or desktop</p>
            <p>📲 Send link directly to customer via WhatsApp</p>
            <p>🔒 Secure Jitsi Meet platform with end-to-end encryption</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallButton;