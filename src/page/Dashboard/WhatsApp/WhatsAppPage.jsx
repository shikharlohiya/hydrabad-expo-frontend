import React, { useState } from "react";
import { MessageCircle, Search, RefreshCw, Phone, Send, FileText, CheckCircle, AlertCircle } from "lucide-react";
import WhatsAppMessages from "../../../components/CallRemarks/WhatsAppMessages";
import axiosInstance from "../../../library/axios";

const WhatsAppPage = () => {
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [templateResult, setTemplateResult] = useState(null);

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

  const sendTemplate = async () => {
    if (!currentPhoneNumber) {
      setTemplateResult({
        success: false,
        message: "Please search for a mobile number first"
      });
      return;
    }

    setSendingTemplate(true);
    setTemplateResult(null);

    try {
      // Clean the mobile number (remove non-digits)
      const cleanMobile = currentPhoneNumber.replace(/\D/g, "");

      // Remove country code if present (assuming +91 for India)
      const mobileWithoutCountryCode = cleanMobile.startsWith("91") && cleanMobile.length > 10
        ? cleanMobile.substring(2)
        : cleanMobile;

      console.log(`📤 Sending WhatsApp template to: ${mobileWithoutCountryCode}`);

      const response = await axiosInstance.post(`/send-template/${mobileWithoutCountryCode}`);

      if (response.data && response.data.success) {
        setTemplateResult({
          success: true,
          message: "Template sent successfully!",
          data: response.data.data
        });
        console.log("✅ Template sent successfully:", response.data);
      } else {
        setTemplateResult({
          success: false,
          message: response.data?.message || "Failed to send template"
        });
      }
    } catch (error) {
      console.error("❌ Error sending template:", error);
      setTemplateResult({
        success: false,
        message: error.response?.data?.message || "Failed to send template"
      });
    } finally {
      setSendingTemplate(false);

      // Clear result after 5 seconds
      setTimeout(() => {
        setTemplateResult(null);
      }, 5000);
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
        <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          <div className="flex-1 h-[calc(100vh-320px)]">
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
                    <p>• Send WhatsApp templates to customers</p>
                    <p>• Refresh to get latest messages</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Send Chat</h4>
              </div>
              <div className="text-sm text-gray-500">
                {currentPhoneNumber ? `To: ${currentPhoneNumber}` : "No recipient selected"}
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">Chat Preview</div>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                    <p>Namaste, you’re connected with IB Group’s Whatsapp support agent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button and Status */}
            <div className="flex items-center justify-between">
              <button
                onClick={sendTemplate}
                disabled={sendingTemplate || !currentPhoneNumber}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className={`w-4 h-4 ${sendingTemplate ? "animate-pulse" : ""}`} />
                <span>{sendingTemplate ? "Sending..." : "Send Chat"}</span>
              </button>

              {/* Result Message */}
              {templateResult && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  templateResult.success
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {templateResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{templateResult.message}</span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-3 text-xs text-gray-500">
              <p>💡 Search for a customer's mobile number above, then click "Send Template" to send a WhatsApp message.</p>
            </div>
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
                  <li>• Send WhatsApp templates using the chat interface below</li>
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