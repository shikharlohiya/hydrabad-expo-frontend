import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Image,
  Video,
  FileText,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Search,
  AlertCircle,
  Download,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import axiosInstance from "../../library/axios";

const WhatsAppMessages = ({ phoneNumber: initialPhoneNumber }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(initialPhoneNumber || "");

  // Update phone number when prop changes
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
      setSearchInput(initialPhoneNumber);
      fetchMessages(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);

  const fetchMessages = async (mobile) => {
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`📱 Fetching WhatsApp messages for: ${mobile}`);

      // Clean mobile number - remove non-digits
      const cleanMobile = mobile.replace(/\D/g, "");

      // Ensure it starts with country code (assuming India +91)
      const formattedMobile = cleanMobile.startsWith("91") ? cleanMobile : `91${cleanMobile}`;

      const response = await axiosInstance.get(`/whatsapp-messages/${formattedMobile}`);

      if (response.data && response.data.success) {
        setMessages(response.data.data || []);
        console.log(`✅ Found ${response.data.data?.length || 0} WhatsApp messages`);
      } else {
        setMessages([]);
        setError(response.data?.message || "No messages found");
      }
    } catch (error) {
      console.error("❌ Error fetching WhatsApp messages:", error);
      setMessages([]);
      if (error.response?.status === 404) {
        setError("No WhatsApp messages found for this number");
      } else {
        setError("Failed to fetch WhatsApp messages");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setPhoneNumber(searchInput);
      fetchMessages(searchInput);
    }
  };

  const handleRefresh = () => {
    if (phoneNumber) {
      fetchMessages(phoneNumber);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      console.log(`🔽 Downloading image: ${filename}`);

      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Set filename - use provided filename or generate one
      const downloadFilename = filename || `whatsapp_image_${Date.now()}.jpg`;
      link.download = downloadFilename;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`✅ Image downloaded successfully: ${downloadFilename}`);
    } catch (error) {
      console.error('❌ Error downloading image:', error);

      // Fallback: open image in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "image":
        return <Image className="w-4 h-4 text-green-600" />;
      case "video":
        return <Video className="w-4 h-4 text-blue-600" />;
      case "text":
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "image":
        return "bg-green-50 border-green-200";
      case "video":
        return "bg-blue-50 border-blue-200";
      case "text":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  const renderMediaContent = (message) => {
    const { message_type, media_url, media_filename, text_body, caption } = message;

    switch (message_type?.toLowerCase()) {
      case "image":
        return (
          <div className="mt-2">
            {media_url && (
              <div className="relative group">
                <img
                  src={media_url}
                  alt={media_filename || "WhatsApp Image"}
                  className="max-w-full max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                  onClick={() => window.open(media_url, "_blank")}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />

                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(media_url, media_filename);
                      }}
                      className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full text-white transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(media_url, "_blank");
                      }}
                      className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full text-white transition-colors"
                      title="Open in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="hidden items-center justify-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="text-center text-gray-500">
                    <Image className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Image not available</p>
                    <div className="flex justify-center space-x-2 mt-2">
                      <a
                        href={media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open link</span>
                      </a>
                      <button
                        onClick={() => downloadImage(media_url, media_filename)}
                        className="text-green-500 text-xs hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {caption && (
              <p className="mt-2 text-sm text-gray-700 italic">"{caption}"</p>
            )}

            {/* Download button below image */}
            {media_url && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(media_url, media_filename)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Image</span>
                </button>
                {media_filename && (
                  <span className="text-xs text-gray-500 truncate max-w-48">
                    {media_filename}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="mt-2">
            {media_url && (
              <div className="relative">
                <video
                  controls
                  className="max-w-full max-h-48 rounded-lg border border-gray-200"
                  preload="metadata"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                >
                  <source src={media_url} type={message.media_mime_type || "video/mp4"} />
                  Your browser does not support video playback.
                </video>
                <div className="hidden items-center justify-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="text-center text-gray-500">
                    <Video className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Video not available</p>
                    <div className="flex justify-center space-x-2 mt-2">
                      <a
                        href={media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open link</span>
                      </a>
                      <button
                        onClick={() => downloadImage(media_url, media_filename)}
                        className="text-green-500 text-xs hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {caption && (
              <p className="mt-2 text-sm text-gray-700 italic">"{caption}"</p>
            )}

            {/* Download button below video */}
            {media_url && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(media_url, media_filename)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Video</span>
                </button>
                {media_filename && (
                  <span className="text-xs text-gray-500 truncate max-w-48">
                    {media_filename}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case "text":
        return (
          <div className="mt-2">
            <p className="text-gray-800 leading-relaxed">{text_body}</p>
          </div>
        );

      default:
        return (
          <div className="mt-2">
            {text_body && <p className="text-gray-800 leading-relaxed">{text_body}</p>}
            {media_url && (
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {media_filename || "Attachment"}
                  </span>
                  <a
                    href={media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900">WhatsApp Messages</h4>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter mobile number..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchInput.trim()}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || !phoneNumber}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Messages Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading WhatsApp messages...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && phoneNumber && (
          <div className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No WhatsApp messages found</p>
            <p className="text-gray-400 text-xs mt-1">
              Try searching with a different number
            </p>
          </div>
        )}

        {!loading && !error && !phoneNumber && (
          <div className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Enter a mobile number to view messages</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Found {messages.length} message{messages.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium">{phoneNumber}</span>
            </div>

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`rounded-lg border p-4 ${getMessageTypeColor(message.message_type)}`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getMessageTypeIcon(message.message_type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-gray-900 text-sm">
                          {message.name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {message.message_type}
                  </div>
                </div>

                {/* Message Content */}
                {renderMediaContent(message)}

                {/* Message Footer */}
                <div className="mt-3 pt-2 border-t border-gray-200 border-opacity-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Mobile: {message.mobile}</span>
                    <span>ID: {message.wam_id?.slice(-8) || message.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppMessages;