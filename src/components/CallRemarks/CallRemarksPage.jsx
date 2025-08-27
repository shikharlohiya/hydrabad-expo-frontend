import React, { useState, useEffect, useContext } from "react";
import useDialer from "../../hooks/useDialer";
import useForm from "../../hooks/useForm";
import { CALL_STATUS } from "../../context/Providers/DialerProvider";
import CallRemarksForm from "./CallRemarksForm";
import CustomerInfoPanel from "./CustomerInfoPanel";
import CustomerCallHistory from "./CustomerCallHistory";
import CustomerSearchBox from "./CustomerSearchBox";
import PhoneBook from "./PhoneBook"; // Import PhoneBook
import { ChevronRight, ChevronLeft } from "lucide-react";
import UserContext from "../../context/UserContext";
import axiosInstance from "../../library/axios";

const CallRemarksPage = () => {
  const {
    callStatus,
    currentNumber,
    handleRemarksSubmit,
    callDirection,
    callStartTime,
    callDuration,
    activeCallId,
  } = useDialer();

  const {
    isFormOpen,
    closeForm,
    formData,
    updateFormData,
    submitForm,
    errors,
    formStatus,
    savedContactData,
  } = useForm();

  // UI state
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Customer search states
  const [customerData, setCustomerData] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // New customer form states - modified to store contact data
  const [newContactData, setNewContactData] = useState(null);

  const { userData } = useContext(UserContext);

  const isCallEnded =
    callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED;

  // Use formData.CallId (which is preserved) instead of activeCallId (which gets reset)
  const currentCallDetails = {
    CallId: formData?.CallId || activeCallId, // Prioritize preserved CallId from formData
    EmployeeId: userData?.EmployeeId,
    startTime: callStartTime,
    number: currentNumber,
    contactName: null,
    callType: callDirection,
    callDuration: callDuration,
  };

  // Auto-search when component mounts with current number
  useEffect(() => {
    if (currentNumber && !hasSearched) {
      handleCustomerSearch(currentNumber);
    }
  }, [currentNumber, hasSearched]);

  // Reset search state when current number changes
  useEffect(() => {
    if (currentNumber) {
      setHasSearched(false);
      setCustomerData(null);
      setCallHistory([]);
      setNewContactData(null); // Reset new contact data
    }
  }, [currentNumber]);

  // API call to get history (includes trader info and call records)
  const searchCustomerAPI = async (searchTerm) => {
    try {
      const response = await axiosInstance.get(
        `/history/${searchTerm}?page=1&limit=20`
      );

      if (response.data.success && response.data.data) {
        const historyData = response.data.data;

        // Extract trader info - use trader_master or contact data
        const traderMaster = historyData.TraderInfo?.trader_master;
        const contactInfo = historyData.TraderInfo?.contact;

        let transformedCustomer = null;

        // Prioritize trader_master, fallback to contact
        if (traderMaster || contactInfo) {
          const primaryData = traderMaster || contactInfo;
          const secondaryData = traderMaster ? contactInfo : null;

          transformedCustomer = {
            id: primaryData.id,
            name: primaryData.Trader_Name || primaryData.Contact_Name,
            email: primaryData.email || null,
            accountId: primaryData.Code || null,
            phoneNumber: primaryData.Contact_no,
            joinDate: primaryData.createdAt,
            lastActivity: primaryData.updatedAt,
            accountType: contactInfo?.Type || "Trader",
            totalCalls: historyData.call_records?.length || 0,
            status: primaryData.status || "active",
            businessName: primaryData.Trader_business_Name || null,
            region: primaryData.Region,
            zone: primaryData.Zone,
            lastActionDate: primaryData.last_action_date,
            followUpDate: primaryData.follow_up_date,
            completedOn: primaryData.completed_on,
            agentId: primaryData.AgentId,
            // Include both data sources for display
            traderMaster: traderMaster,
            contactInfo: contactInfo,
          };
        }

        // Transform call records
        const transformedHistory =
          historyData.call_records?.map((record) => ({
            id: record.CallId,
            date: record.startTime,
            time: record.startTime,
            duration: record.duration,
            type: record.type, // inbound/outbound
            callType: record.type,
            status: record.status,
            agent: record.agent?.EmployeeName || "Unknown",
            agentId: record.agent?.EmployeeId,
            agentPhone: record.agent?.EmployeePhone,
            voiceRecording: record.voiceRecording,
            formDetail: record.formDetail,
            customerNumber: record.customerNumber,
            agentNumber: record.agentNumber,
            startTime: record.startTime,
            endTime: record.endTime,
          })) || [];

        return {
          customer: transformedCustomer,
          history: transformedHistory,
        };
      }
      return { customer: null, history: [] };
    } catch (error) {
      console.error("History API error:", error);

      // Handle 404 - customer not found (this is expected behavior)
      if (error.response?.status === 404) {
        console.log(
          "📝 Customer not found (404) - this is normal, showing add customer form"
        );
        return { customer: null, history: [] };
      }

      // Handle other API errors that indicate the API response contains error info
      if (error.response?.data?.message) {
        console.log(
          "📝 API returned error message:",
          error.response.data.message
        );
        return { customer: null, history: [] };
      }

      // Only throw for actual network/server errors
      throw new Error("Network error - please check your connection");
    }
  };

  const handleCustomerSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchError("Please enter a trader ID or phone number");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setShowCustomerPanel(true); // Always show panel on search
    setNewContactData(null); // Reset new contact data

    try {
      const { customer, history } = await searchCustomerAPI(searchTerm.trim());

      if (customer) {
        setCustomerData(customer);
        setCallHistory(history);
        setSearchError(null);
        setNewContactData(null); // Clear new contact data if existing customer found
      } else if (history && history.length > 0) {
        setCustomerData(null);
        setCallHistory(history);
        setActiveTab("history");
        setSearchError("Note: You can update the trader information below");
      } else {
        setCustomerData(null);
        setCallHistory([]);
        setSearchError("Note: You can update the trader information below");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error.message);
      setCustomerData(null);
      setCallHistory([]);
      setNewContactData(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Modified submit handler to include contact data
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      // If we have new contact data, include it in the form submission
      if (newContactData) {
        // Add contact fields to formData
        updateFormData("Contact_Name", newContactData.Contact_Name);
        updateFormData("Region", newContactData.Region);
        updateFormData("Type", newContactData.Type);
      } else if (customerData && customerData.name) {
        // If we have existing customer data, include it
        updateFormData("Contact_Name", customerData.name);
        updateFormData("Region", customerData.region || "");
        updateFormData("Type", "Trader");
      }

      await submitForm();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionError(
        error.message || "Failed to submit form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (hasFormData) => {
    if (hasFormData) {
      if (
        window.confirm(
          "Are you sure you want to cancel? All form data will be lost."
        )
      ) {
        closeForm();
      }
    } else {
      closeForm();
    }
  };

  if (!isFormOpen) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Floating button to open panel */}
      {!showCustomerPanel && (
        <button
          onClick={() => setShowCustomerPanel(true)}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-l-md shadow-lg hover:bg-gray-100 transition-colors z-50 border-t border-l border-b border-gray-200"
          aria-label="Open trader panel"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showCustomerPanel ? "mr-[450px]" : ""
        }`}
      >
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto h-full">
            <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Call Remarks & Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isCallEnded
                      ? "Call has ended. Please complete the remarks form to continue."
                      : "Please fill out the call details and remarks."}
                  </p>

                  {/* Call Status Indicator */}
                  {isCallEnded && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        📞 Call disconnected - Form data will be saved once
                        submitted
                      </p>
                    </div>
                  )}

                  {/* Error Display */}
                  {submissionError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        ❌ {submissionError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Search Box */}
                <div className="ml-4">
                  <CustomerSearchBox
                    onSearch={handleCustomerSearch}
                    isSearching={isSearching}
                    searchError={searchError}
                    currentNumber={currentNumber}
                    hasResults={customerData !== null}
                  />
                </div>
              </div>
              {/* {savedContactData && (
                <div className="mt-6 mx-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                  <h1> Saved Trader-</h1>
                  <div>
                    <strong>Contact No:</strong> {savedContactData.Contact_no}
                  </div>
                  <div>
                    <strong>Name:</strong> {savedContactData.Contact_Name}
                  </div>
                  <div>
                    <strong>Type:</strong> {savedContactData.Type}
                  </div>
                  <div>
                    <strong>Region:</strong> {savedContactData.Region}
                  </div>
                </div>
              )} */}

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                {isSubmitted ? (
                  <div className="p-6 text-center justify-center flex items-center h-full">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Form Submitted Successfully!
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Your call remarks have been saved.{" "}
                        {isCallEnded
                          ? "You can now return to the dashboard."
                          : "The call is still active."}
                      </p>
                      {isCallEnded && (
                        <button
                          onClick={() => closeForm()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Return to Dashboard
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <CallRemarksForm
                    currentNumber={currentNumber}
                    currentCallDetails={currentCallDetails}
                    customerData={customerData}
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    isCallEnded={isCallEnded}
                    submissionError={submissionError}
                    callDirection={callDirection}
                    callStartTime={callStartTime}
                    callDuration={callDuration}
                    activeCallId={activeCallId}
                    userData={userData}
                    searchError={searchError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trader Info Sliding Panel */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-[450px] bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
          showCustomerPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Trader Information
              </h3>
              <button
                onClick={() => setShowCustomerPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close trader panel"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "info"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Trader Info
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Call History
              </button>
              <button
                onClick={() => setActiveTab("phonebook")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "phonebook"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Phone Book
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "info" && (
              <>
                {customerData ? (
                  <CustomerInfoPanel
                    customerData={customerData}
                    phoneNumber={currentNumber}
                  />
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 text-sm">
                      {hasSearched
                        ? "No trader information found for this number."
                        : "Search for trader information to view details"}
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === "history" && (
              <>
                {callHistory.length > 0 ? (
                  <CustomerCallHistory
                    callHistory={callHistory}
                    phoneNumber={currentNumber}
                  />
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 text-sm">
                      No call history available.
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === "phonebook" && <PhoneBook isCompact={true} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallRemarksPage;
