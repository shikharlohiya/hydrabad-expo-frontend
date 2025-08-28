import React, { useState, useEffect, useContext } from "react";
import useForm from "../../hooks/useForm";
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
    // Form state
    isFormOpen,
    activeCallState,
    formData,
    updateFormData,
    submitForm,
    closeForm,
    errors,
    formStatus,
    savedContactData,
  } = useForm();

  // Customer search state (moved from FormProvider to this component)
  const [customerData, setCustomerData] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // New customer form states
  const [newContactData, setNewContactData] = useState(null);

  const { userData } = useContext(UserContext);

  // Check if call has ended
  const isCallEnded = !activeCallState?.isActive;

  // Current call details from activeCallState
  const currentCallDetails = {
    CallId: activeCallState?.callId || formData?.CallId,
    EmployeeId: userData?.EmployeeId,
    startTime: activeCallState?.startTime,
    number: activeCallState?.customerNumber || activeCallState?.callerNumber,
    contactName: customerData?.name || null,
    callType: activeCallState?.callDirection,
    callDirection: activeCallState?.callDirection,
    callDuration: activeCallState?.duration,
    recordingUrl: activeCallState?.recordingUrl,
    hangupCause: activeCallState?.hangupCause,
  };

  // Auto-search when component mounts with current number
  useEffect(() => {
    const phoneNumber =
      activeCallState?.customerNumber || activeCallState?.callerNumber;
    if (phoneNumber && !hasSearched) {
      handleCustomerSearch(phoneNumber);
    }
  }, [
    activeCallState?.customerNumber,
    activeCallState?.callerNumber,
    hasSearched,
  ]);

  // Reset search state when current number changes
  useEffect(() => {
    const phoneNumber =
      activeCallState?.customerNumber || activeCallState?.callerNumber;
    if (phoneNumber) {
      setHasSearched(false);
      setCustomerData(null);
      setCallHistory([]);
      setNewContactData(null);
      setSearchError(null);
    }
  }, [activeCallState?.customerNumber, activeCallState?.callerNumber]);

  // Auto-show customer panel when search results are available
  useEffect(() => {
    if (customerData || callHistory.length > 0) {
      setShowCustomerPanel(true);
    }
  }, [customerData, callHistory]);

  // API call to get customer history and information
  const searchCustomerAPI = async (searchTerm) => {
    try {
      const response = await axiosInstance.get(
        `/history/${searchTerm}?page=1&limit=20`
      );

      if (response.data.success && response.data.data) {
        const historyData = response.data.data;

        // Extract trader info
        const traderMaster = historyData.TraderInfo?.trader_master;
        const contactInfo = historyData.TraderInfo?.contact;

        let transformedCustomer = null;

        if (traderMaster || contactInfo) {
          const primaryData = traderMaster || contactInfo;

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
            type: record.type,
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

      if (error.response?.status === 404) {
        console.log(
          "Customer not found (404) - this is normal for new customers"
        );
        return { customer: null, history: [] };
      }

      if (error.response?.data?.message) {
        console.log("API returned error message:", error.response.data.message);
        return { customer: null, history: [] };
      }

      throw new Error("Network error - please check your connection");
    }
  };

  // Handle customer search
  const handleCustomerSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchError("Please enter a customer ID or phone number");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setCustomerData(null);
    setCallHistory([]);

    try {
      console.log("Searching for customer:", searchTerm);

      const result = await searchCustomerAPI(searchTerm);

      if (result.customer) {
        setCustomerData(result.customer);
        console.log("Customer found:", result.customer);
      } else {
        setCustomerData(null);
        console.log("No customer found for:", searchTerm);
      }

      if (result.history && result.history.length > 0) {
        setCallHistory(result.history);
        console.log("Call history found:", result.history.length, "records");
      } else {
        setCallHistory([]);
      }

      setHasSearched(true);

      // Show customer panel if we have any results
      if (result.customer || result.history.length > 0) {
        setShowCustomerPanel(true);
      }
    } catch (error) {
      console.error("Customer search error:", error);
      setSearchError(error.message);
      setCustomerData(null);
      setCallHistory([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Modified submit handler
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      // Include contact data if available
      let contactDataToSubmit = null;
      if (newContactData) {
        contactDataToSubmit = {
          name: newContactData.Contact_Name,
          region: newContactData.Region,
          type: newContactData.Type,
        };
      } else if (customerData && customerData.name) {
        contactDataToSubmit = {
          name: customerData.name,
          region: customerData.region || "",
          type: customerData.accountType || "Trader",
        };
      }

      await submitForm(contactDataToSubmit);
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

  // If form is not open, show a simple message
  if (!isFormOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Active Call Form
          </h2>
          <p className="text-gray-600">
            Forms will open automatically when calls are connected through
            Acefone.
          </p>
          {activeCallState?.callId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Call ID: {activeCallState.callId}
                {activeCallState.isActive ? " (Active)" : " (Ended)"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
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
                      : "Call is active. Please fill out the call details and remarks."}
                  </p>

                  {/* Call Info Display */}
                  {activeCallState?.callId && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div>
                          <strong>Call ID:</strong> {activeCallState.callId}
                        </div>
                        <div>
                          <strong>Direction:</strong>{" "}
                          {activeCallState.callDirection}
                        </div>
                        <div>
                          <strong>Customer:</strong>{" "}
                          {activeCallState.customerNumber ||
                            activeCallState.callerNumber}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          {activeCallState.isActive ? "Active" : "Ended"}
                        </div>
                        {activeCallState.duration && (
                          <div>
                            <strong>Duration:</strong>{" "}
                            {activeCallState.duration}s
                          </div>
                        )}
                        {customerData && (
                          <div>
                            <strong>Customer Name:</strong> {customerData.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {submissionError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        Error: {submissionError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Search Box */}
                <div className="ml-4 flex items-center gap-2">
                  <CustomerSearchBox
                    onSearch={handleCustomerSearch}
                    isSearching={isSearching}
                    searchError={searchError}
                    currentNumber={
                      activeCallState?.customerNumber ||
                      activeCallState?.callerNumber
                    }
                    hasResults={customerData !== null}
                  />

                  {/* Toggle Panel Button */}
                  {(customerData || callHistory.length > 0) && (
                    <button
                      onClick={() => setShowCustomerPanel(!showCustomerPanel)}
                      className={`p-2 rounded-lg transition-colors ${
                        showCustomerPanel
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        showCustomerPanel
                          ? "Hide customer panel"
                          : "Show customer panel"
                      }
                    >
                      <ChevronRight
                        size={20}
                        className={`transform transition-transform ${
                          showCustomerPanel ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

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
                        Your call remarks have been saved.
                      </p>
                      <button
                        onClick={() => closeForm()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Close Form
                      </button>
                    </div>
                  </div>
                ) : (
                  <CallRemarksForm
                    currentNumber={
                      activeCallState?.customerNumber ||
                      activeCallState?.callerNumber
                    }
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
                    callDirection={activeCallState?.callDirection}
                    callStartTime={activeCallState?.startTime}
                    callDuration={activeCallState?.duration}
                    activeCallId={activeCallState?.callId}
                    userData={userData}
                    searchError={searchError}
                    onNewContactData={setNewContactData}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info Sliding Panel */}
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
                Customer Information
              </h3>
              <button
                onClick={() => setShowCustomerPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close customer panel"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Search Status */}
            {isSearching && (
              <div className="mt-2 text-sm text-blue-600">
                Searching customer information...
              </div>
            )}

            {searchError && (
              <div className="mt-2 text-sm text-red-600">
                Search Error: {searchError}
              </div>
            )}

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
                Customer Info
                {customerData && (
                  <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                )}
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
                {callHistory.length > 0 && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    {callHistory.length}
                  </span>
                )}
                {callHistory.length > 0 && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    {callHistory.length}
                  </span>
                )}
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
            {activeTab === "info" ? (
              <>
                {customerData ? (
                <CustomerInfoPanel
                  customerData={customerData}
                  phoneNumber={
                    activeCallState?.customerNumber ||
                    activeCallState?.callerNumber
                  }
                />
              ) : hasSearched ? (
                <div className="p-4 text-center">
                  <div className="text-gray-500 text-sm">
                    No customer information found for this number.
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    This might be a new customer or the number is not
                    registered.
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <div className="text-gray-500 text-sm">
                    Search for customer information to view details
                  </div>
                </div>
              )
            ) : callHistory.length > 0 ? (
              <CustomerCallHistory
                callHistory={callHistory}
                phoneNumber={
                  activeCallState?.customerNumber ||
                  activeCallState?.callerNumber
                }
              />
            ) : hasSearched ? (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-sm">
                  No call history found for this customer.
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-sm">
                  Search for customer to view call history
                </div>
              </div>
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
