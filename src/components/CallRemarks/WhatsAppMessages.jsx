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
  Send,
  CheckCircle,
  Share2,
  X,
} from "lucide-react";
import axiosInstance from "../../library/axios";

const WhatsAppMessages = ({ phoneNumber: initialPhoneNumber, showSendTemplate = false }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(initialPhoneNumber || "");
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [templateResult, setTemplateResult] = useState(null);

  // Share functionality state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMediaUrl, setShareMediaUrl] = useState("");
  const [shareMediaType, setShareMediaType] = useState("");
  const [shareMobileNumber, setShareMobileNumber] = useState("");
  const [sharingMedia, setSharingMedia] = useState(false);
  const [shareResult, setShareResult] = useState(null);

  // Phonebook search state

  
  const [phonebookSearch, setPhonebookSearch] = useState("");
  const [phonebookContacts, setPhonebookContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showPhonebookDropdown, setShowPhonebookDropdown] = useState(false);

  // Phonebook filter state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [showNumberWarning, setShowNumberWarning] = useState(false);

  // Update phone number when prop changes
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
      setSearchInput(initialPhoneNumber);
      fetchMessages(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);

  // Load filter options when modal opens
  useEffect(() => {
    if (showShareModal) {
      loadFilterOptions();
    }
  }, [showShareModal]);

  // Update branches when region changes
  useEffect(() => {
    if (selectedRegion) {
      loadBranches(selectedRegion);
    } else {
      setBranches([]);
      setSelectedBranch("");
    }
  }, [selectedRegion]);

  // Search phonebook when filters change
  useEffect(() => {
    if (selectedRegion || selectedBranch || selectedRole || phonebookSearch) {
      searchPhonebook(phonebookSearch);
    }
  }, [selectedRegion, selectedBranch, selectedRole]);

  // Phonebook search with debounce
  useEffect(() => {
    if (!phonebookSearch || phonebookSearch.length < 2) {
      // If there are filters selected, still search
      if (selectedRegion || selectedBranch || selectedRole) {
        searchPhonebook("");
      } else {
        setPhonebookContacts([]);
        setShowPhonebookDropdown(false);
      }
      return;
    }

    const debounceTimer = setTimeout(() => {
      searchPhonebook(phonebookSearch);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [phonebookSearch]);

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

  const sendTemplate = async () => {
    if (!phoneNumber) {
      setTemplateResult({
        success: false,
        message: "No phone number available"
      });
      return;
    }

    setSendingTemplate(true);
    setTemplateResult(null);

    try {
      // Clean the mobile number (remove non-digits)
      const cleanMobile = phoneNumber.replace(/\D/g, "");

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

        // Refresh messages after successful send
        setTimeout(() => {
          handleRefresh();
        }, 2000);
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

  // Open share modal
  const handleOpenShareModal = (mediaUrl, mediaType) => {
    setShareMediaUrl(mediaUrl);
    setShareMediaType(mediaType);
    setShowShareModal(true);
    setShareMobileNumber("");
    setShareResult(null);
  };

  // Close share modal
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setShareMediaUrl("");
    setShareMediaType("");
    setShareMobileNumber("");
    setShareResult(null);
  };

  // Share media via WhatsApp
  const handleShareMedia = async () => {
    if (!shareMobileNumber || shareMobileNumber.trim().length < 10) {
      setShareResult({
        success: false,
        message: "Please enter a valid mobile number"
      });
      return;
    }

    setSharingMedia(true);
    setShareResult(null);

    try {
      console.log(`📤 Sharing ${shareMediaType} to: ${shareMobileNumber}`);
      console.log(`📷 Original Media URL: ${shareMediaUrl}`);

      // Clean the media URL - WhatsApp API adds base URL automatically, so send only relative path
      let cleanMediaUrl = shareMediaUrl;
      const s3BaseUrl = 'https://aiwebi.s3.ap-southeast-2.amazonaws.com/';

      // Remove all occurrences of the base URL
      while (cleanMediaUrl.includes(s3BaseUrl)) {
        cleanMediaUrl = cleanMediaUrl.replace(s3BaseUrl, '');
      }

      // If after cleaning, the URL still starts with http/https, extract just the path
      if (cleanMediaUrl.startsWith('http://') || cleanMediaUrl.startsWith('https://')) {
        try {
          const urlObj = new URL(cleanMediaUrl);
          cleanMediaUrl = urlObj.pathname.substring(1); // Remove leading slash
        } catch (e) {
          console.warn('⚠️ Could not parse URL, using as-is:', e);
        }
      }

      // Final check: ensure it's just the relative path (images/FILE...)
      if (cleanMediaUrl.startsWith('/')) {
        cleanMediaUrl = cleanMediaUrl.substring(1); // Remove leading slash if any
      }

      console.log(`🔧 Cleaned Media URL (relative path only): ${cleanMediaUrl}`);
      console.log(`✅ Sending to WhatsApp API (will add base URL automatically): ${cleanMediaUrl}`);

      const response = await axiosInstance.post('/send-photo-video-url', {
        mobile_number: shareMobileNumber.trim(),
        media_url: cleanMediaUrl
      });

      if (response.data && response.data.success) {
        const mediaTypeLabel = shareMediaType === 'image' ? 'Image' :
                                shareMediaType === 'video' ? 'Video' :
                                shareMediaType === 'document' ? 'Document' : 'File';
        setShareResult({
          success: true,
          message: `${mediaTypeLabel} shared successfully!`
        });
        console.log("✅ Media shared successfully:", response.data);

        // Close modal after 2 seconds
        setTimeout(() => {
          handleCloseShareModal();
        }, 2000);
      } else {
        setShareResult({
          success: false,
          message: response.data?.message || "Failed to share media"
        });
      }
    } catch (error) {
      console.error("❌ Error sharing media:", error);
      setShareResult({
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || "Failed to share media"
      });
    } finally {
      setSharingMedia(false);
    }
  };

  // Search phonebook contacts
  const searchPhonebook = async (searchTerm) => {
    setLoadingContacts(true);
    try {
      const params = {
        limit: 10,
        page: 1
      };

      // Add search term if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add filters if selected
      if (selectedRegion) params.region = selectedRegion;
      if (selectedBranch) params.branch = selectedBranch;
      if (selectedRole) params.role = selectedRole;

      const response = await axiosInstance.get('/phonebook/record', { params });

      if (response.data && response.data.success) {
        setPhonebookContacts(response.data.data || []);
        setShowPhonebookDropdown(true);
        console.log(`📚 Found ${response.data.data?.length || 0} contacts`);
      } else {
        setPhonebookContacts([]);
        setShowPhonebookDropdown(false);
      }
    } catch (error) {
      console.error("❌ Error searching phonebook:", error);
      setPhonebookContacts([]);
      setShowPhonebookDropdown(false);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Handle contact selection from phonebook
  const handleSelectContact = (contact) => {
    const mobileNumber = contact.Contact1 || contact.Contact2 || "";
    setShareMobileNumber(mobileNumber);
    setPhonebookSearch("");
    setPhonebookContacts([]);
    setShowPhonebookDropdown(false);
  };

  // Load filter options (regions and roles)
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      // Load regions
      const regionsResponse = await axiosInstance.get('/phonebook/region');
      if (regionsResponse.data && regionsResponse.data.success) {
        setRegions(regionsResponse.data.data || []);
      }

      // Load roles
      const rolesResponse = await axiosInstance.get('/phonebook/roles');
      if (rolesResponse.data && rolesResponse.data.success) {
        setRoles(rolesResponse.data.data || []);
      }
    } catch (error) {
      console.error("❌ Error loading filter options:", error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load branches based on selected region
  const loadBranches = async (region) => {
    try {
      const response = await axiosInstance.get('/phonebook/branches', {
        params: { region }
      });
      if (response.data && response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (error) {
      console.error("❌ Error loading branches:", error);
      setBranches([]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedRegion("");
    setSelectedBranch("");
    setSelectedRole("");
    setPhonebookSearch("");
    setPhonebookContacts([]);
    setShowPhonebookDropdown(false);
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
    const { message_type, media_url, media_filename, text_body, caption, media_mime_type } = message;

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

            {/* Download and Share buttons below image */}
            {media_url && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(media_url, media_filename)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleOpenShareModal(media_url, 'image')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
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

            {/* Download and Share buttons below video */}
            {media_url && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(media_url, media_filename)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleOpenShareModal(media_url, 'video')}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
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

      case "document":
        return (
          <div className="mt-2">
            {media_url && (
              <div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {media_filename || "Document"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {media_mime_type || "Document file"}
                      </p>
                    </div>
                    <a
                      href={media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors"
                      title="Open Document"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-700" />
                    </a>
                  </div>
                </div>

                {/* Download and Share buttons below document */}
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => downloadImage(media_url, media_filename)}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleOpenShareModal(media_url, 'document')}
                    className="flex items-center space-x-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs rounded-full transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                  {media_filename && (
                    <span className="text-xs text-gray-500 truncate max-w-48">
                      {media_filename}
                    </span>
                  )}
                </div>
              </div>
            )}
            {caption && (
              <p className="mt-2 text-sm text-gray-700 italic">"{caption}"</p>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-2">
            {text_body && <p className="text-gray-800 leading-relaxed">{text_body}</p>}
            {media_url && (
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {media_filename || "Attachment"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleOpenShareModal(media_url, 'file')}
                      className="p-1 text-purple-500 hover:text-purple-700"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Send Template Interface - Only show if showSendTemplate prop is true */}
      {showSendTemplate && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-green-600" />
              <h5 className="text-sm font-medium text-gray-900">Send Template</h5>
            </div>
            <div className="text-xs text-gray-500">
              {phoneNumber ? `To: ${phoneNumber}` : "No recipient"}
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-900 mb-1">Chat Preview</div>
                <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                  <p>Namaste, you’re connected with IB Group’s Whatsapp support agent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Send Button and Status */}
          <div className="flex items-center justify-between">
            <button
              onClick={sendTemplate}
              disabled={sendingTemplate || !phoneNumber}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Send className={`w-3 h-3 ${sendingTemplate ? "animate-pulse" : ""}`} />
              <span>{sendingTemplate ? "Sending..." : "Send Chat"}</span>
            </button>

            {/* Result Message */}
            {templateResult && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                templateResult.success
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {templateResult.success ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{templateResult.message}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-2 text-xs text-gray-500">
            💡 Click "Send Template" to send a WhatsApp message to this customer.
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Share {shareMediaType === 'image' ? 'Image' : shareMediaType === 'video' ? 'Video' : shareMediaType === 'document' ? 'Document' : 'File'}
                </h3>
              </div>
              <button
                onClick={handleCloseShareModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Media Preview */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Media URL:</p>
                <p className="text-xs text-gray-700 break-all">{shareMediaUrl}</p>
              </div>

              {/* Filter Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Filters</h4>
                  {(selectedRegion || selectedBranch || selectedRole) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Region Filter */}
                  <div>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={sharingMedia || loadingFilters}
                    >
                      <option value="">All Regions</option>
                      {regions.map((region, index) => (
                        <option key={index} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Filter */}
                  <div>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!selectedRegion || sharingMedia || loadingFilters}
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch, index) => (
                        <option key={index} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={sharingMedia || loadingFilters}
                    >
                      <option value="">All Roles</option>
                      {roles.map((role, index) => (
                        <option key={index} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Phonebook Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Contact from Phonebook
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phonebookSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Block if input contains only numbers
                      if (/^\d+$/.test(value)) {
                        // Show warning
                        setShowNumberWarning(true);
                        setTimeout(() => setShowNumberWarning(false), 3000);
                        return;
                      }
                      // Hide warning and allow input if it contains letters
                      setShowNumberWarning(false);
                      setPhonebookSearch(value);
                    }}
                    onKeyDown={(e) => {
                      // Block number keys (0-9) when field is empty or contains only numbers
                      if (/^[0-9]$/.test(e.key) && (!phonebookSearch || /^\d*$/.test(phonebookSearch))) {
                        e.preventDefault();
                        setShowNumberWarning(true);
                        setTimeout(() => setShowNumberWarning(false), 3000);
                      }
                    }}
                    placeholder="Search by name, role, branch.."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sharingMedia}
                  />
                  {loadingContacts && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* Phonebook Dropdown */}
                  {showPhonebookDropdown && phonebookContacts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {phonebookContacts.map((contact, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectContact(contact)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {contact.EmployeeName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {contact.Role} • {contact.BranchName}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-sm text-blue-600 font-medium">
                                {contact.Contact1}
                              </p>
                              {contact.Contact2 && (
                                <p className="text-xs text-gray-500">
                                  {contact.Contact2}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning Message */}
                {showNumberWarning && (
                  <div className="mt-2 flex items-center space-x-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please search by name, role, or branch only. Use filters to narrow results.</span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {(selectedRegion || selectedBranch || selectedRole)
                    ? "Search with filters applied or type to refine results"
                    : "Type at least 2 characters to search contacts"}
                </p>
              </div>

              {/* Selected Contact Display */}
              {shareMobileNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Selected Number:</p>
                      <p className="text-sm font-medium text-green-700">{shareMobileNumber}</p>
                    </div>
                    <button
                      onClick={() => setShareMobileNumber("")}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* COMMENTED OUT: Manual Number Entry */}
              {/*
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Mobile Number Manually
                </label>
                <input
                  type="text"
                  value={shareMobileNumber}
                  onChange={(e) => setShareMobileNumber(e.target.value)}
                  placeholder="Enter mobile number (e.g., 8839699199)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={sharingMedia}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10-digit mobile number (with or without country code)
                </p>
              </div>
              */}

              {/* Share Result */}
              {shareResult && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
                  shareResult.success
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {shareResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{shareResult.message}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={handleCloseShareModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={sharingMedia}
              >
                Cancel
              </button>
              <button
                onClick={handleShareMedia}
                disabled={sharingMedia || !shareMobileNumber.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sharingMedia ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share via WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMessages;