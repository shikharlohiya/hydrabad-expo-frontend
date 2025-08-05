import React, { useState, useEffect, useContext } from "react";
import useDialer from "../../hooks/useDialer";
import useForm from "../../hooks/useForm";
import { CALL_STATUS } from "../../context/Providers/DialerProvider";
import CallRemarksForm from "./CallRemarksForm";
import CustomerInfoPanel from "./CustomerInfoPanel";
import CustomerCallHistory from "./CustomerCallHistory";
import CustomerSearchBox from "./CustomerSearchBox";
import NewCustomerForm from "./NewCustomerForm";
import { ChevronRight } from "lucide-react";
import UserContext from "../../context/UserContext";
import axiosInstance from "../../library/axios";

// Mock data for testing (remove this in production)
const MOCK_MODE = true; // Set to false when API is ready

const mockCustomerDatabase = {
  9301196473: {
    name: "John Doe",
    email: "john.doe@example.com",
    accountId: "ACC123456",
    phoneNumber: "9301196473",
    joinDate: "2023-01-15",
    lastActivity: "2024-12-20",
    accountType: "Premium",
    totalCalls: 12,
    status: "Active",
  },
  "+1234567890": {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    accountId: "ACC789012",
    phoneNumber: "+1234567890",
    joinDate: "2022-06-10",
    lastActivity: "2024-12-18",
    accountType: "Standard",
    totalCalls: 8,
    status: "Active",
  },
};

const mockCallHistory = {
  ACC123456: [
    {
      id: 1,
      date: "2024-12-18",
      time: "14:30",
      duration: "12:45",
      type: "support",
      category: "technical issue",
      priority: "high",
      resolution: "Issue resolved - password reset completed",
      agent: "Agent Smith",
      status: "closed",
    },
    {
      id: 2,
      date: "2024-12-10",
      time: "10:15",
      duration: "8:22",
      type: "billing",
      category: "payment inquiry",
      priority: "medium",
      resolution: "Payment processed successfully",
      agent: "Agent Johnson",
      status: "closed",
    },
  ],
  ACC789012: [
    {
      id: 3,
      date: "2024-12-15",
      time: "16:45",
      duration: "15:33",
      type: "sales",
      category: "account upgrade",
      priority: "low",
      resolution: "Account upgrade completed to Standard plan",
      agent: "Agent Williams",
      status: "closed",
    },
  ],
};

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

  // New customer form states
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerCreationError, setCustomerCreationError] = useState(null);

  const { userData } = useContext(UserContext);

  const isCallEnded =
    callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED;

  // Create currentCallDetails from available data
  const currentCallDetails = {
    CallId: activeCallId,
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
      setSearchError(null);
      setShowNewCustomerForm(false);
    }
  }, [currentNumber]);

  // API call to search customer with mock mode
  const searchCustomerAPI = async (searchTerm) => {
    if (MOCK_MODE) {
      // Mock API simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          const customer = mockCustomerDatabase[searchTerm];
          const history = customer
            ? mockCallHistory[customer.accountId] || []
            : [];
          resolve({ customer, history });
        }, 1000); // Simulate API delay
      });
    }

    try {
      const response = await axiosInstance.get(`/customers/search`, {
        params: { query: searchTerm },
      });

      if (response.data.success && response.data.data) {
        return {
          customer: response.data.data,
          history: response.data.data.callHistory || [],
        };
      }
      return { customer: null, history: [] };
    } catch (error) {
      console.error("Customer search API error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search customer"
      );
    }
  };

  // API call to create new customer with mock mode
  const createCustomerAPI = async (customerData) => {
    if (MOCK_MODE) {
      // Mock customer creation
      return new Promise((resolve) => {
        setTimeout(() => {
          const newCustomer = {
            ...customerData,
            accountId: `ACC${Date.now()}`,
            joinDate: new Date().toISOString().split("T")[0],
            lastActivity: new Date().toISOString().split("T")[0],
            totalCalls: 0,
            status: "Active",
          };
          resolve(newCustomer);
        }, 1500); // Simulate API delay
      });
    }

    try {
      const response = await axiosInstance.post("/customers", customerData);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create customer");
    } catch (error) {
      console.error("Create customer API error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  };

  const handleCustomerSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchError("Please enter a customer ID or phone number");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setShowNewCustomerForm(false);

    try {
      const { customer, history } = await searchCustomerAPI(searchTerm.trim());

      if (customer) {
        setCustomerData(customer);
        setCallHistory(history);
        setShowCustomerPanel(true);
        setSearchError(null);
        setShowNewCustomerForm(false);
      } else {
        setCustomerData(null);
        setCallHistory([]);
        setShowCustomerPanel(false);
        setShowNewCustomerForm(true);
        setSearchError(
          "Customer not found. You can add them below (optional)."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error.message);
      setCustomerData(null);
      setCallHistory([]);
      setShowCustomerPanel(false);
      setShowNewCustomerForm(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateCustomer = async (newCustomerData) => {
    setIsCreatingCustomer(true);
    setCustomerCreationError(null);

    try {
      const createdCustomer = await createCustomerAPI(newCustomerData);

      // Set the created customer data
      setCustomerData(createdCustomer);
      setCallHistory([]); // New customer won't have call history
      setShowCustomerPanel(true);
      setShowNewCustomerForm(false);
      setSearchError(null);
    } catch (error) {
      console.error("Error creating customer:", error);
      setCustomerCreationError(error.message);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleSkipNewCustomer = () => {
    setShowNewCustomerForm(false);
    setCustomerCreationError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
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
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Call Remarks & Details
                    </h2>
                    {/* Mock Mode Indicator */}
                    {/* {MOCK_MODE && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🧪 Demo Mode
                      </span>
                    )} */}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {isCallEnded
                      ? "Call has ended. Please complete the remarks form to continue."
                      : "Please fill out the call details and remarks."}
                  </p>

                  {/* Mock Mode Info */}
                  {/* {MOCK_MODE && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Testing Mode:</strong> Try searching for
                        "9301196473" or "+1234567890" to see sample data
                      </p>
                    </div>
                  )} */}

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

              {/* New Customer Form - Shows when customer not found */}
              {showNewCustomerForm && (
                <div className="border-b border-gray-200">
                  <NewCustomerForm
                    phoneNumber={currentNumber}
                    onSubmit={handleCreateCustomer}
                    onCancel={handleSkipNewCustomer}
                    isSubmitting={isCreatingCustomer}
                    error={customerCreationError}
                  />
                </div>
              )}

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
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {customerData ? (
              activeTab === "info" ? (
                <CustomerInfoPanel
                  customerData={customerData}
                  phoneNumber={currentNumber}
                />
              ) : (
                <CustomerCallHistory
                  callHistory={callHistory}
                  phoneNumber={currentNumber}
                />
              )
            ) : (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-sm">
                  {hasSearched
                    ? "No customer data found"
                    : "Search for customer information to view details"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallRemarksPage;
