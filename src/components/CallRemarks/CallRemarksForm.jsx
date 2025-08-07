import React, { useState, useEffect } from "react";
import axiosInstance from "../../library/axios";

const CallRemarksForm = ({
  currentNumber,
  currentCallDetails,
  customerData,
  orderData, // Add this prop for order data
  formData,
  updateFormData,
  errors,
  onSubmit,
  onCancel,
  isSubmitting,
  isCallEnded,
  submissionError,
  // Add these props from your DialerProvider
  callDirection,
  callStartTime,
  callDuration,
  activeCallId,
  userData,
}) => {
  // const [formData, setFormData] = useState({
  //   CallId: "",
  //   EmployeeId: "",
  //   callDateTime: "",
  //   callType: "",
  //   supportTypeId: "",
  //   inquiryNumber: "",
  //   processTypeId: "",
  //   queryTypeId: "",
  //   remarks: "",
  //   attachments: [],
  //   status: "closed",
  //   followUpDate: "",
  // });

  const [dropdownOptions, setDropdownOptions] = useState({
    supportTypes: [],
    processTypes: [],
    queryTypes: [],
  });

  const [loadingOptions, setLoadingOptions] = useState({
    supportTypes: false,
    processTypes: false,
    queryTypes: false,
  });

  // const [errors, setErrors] = useState({});

  // Auto-populate form data with actual call information
  useEffect(() => {
    const populateCallData = () => {
      // Calculate call date and time
      const callDateTime = callStartTime
        ? new Date(callStartTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      // Determine call type from direction
      const callType = callDirection === "incoming" ? "InBound" : "OutBound";

      // Auto-populate inquiry number with phone number
      const inquiryNumber = currentCallDetails?.number || "";

      // Use updateFormData for each field instead of setFormData
      updateFormData(
        "CallId",
        activeCallId || currentCallDetails?.CallId || ""
      );
      updateFormData(
        "EmployeeId",
        userData?.EmployeeId || currentCallDetails?.EmployeeId || ""
      );
      updateFormData("callDateTime", callDateTime);
      updateFormData("callType", callType);
      updateFormData("inquiryNumber", inquiryNumber);
    };

    populateCallData();
  }, [
    // Only include primitive values and IDs to prevent infinite loops
    activeCallId,
    currentCallDetails?.CallId,
    currentCallDetails?.EmployeeId,
    userData?.EmployeeId,
    callStartTime,
    callDirection,
    orderData?.orderId,
    customerData?.accountId,
    // Remove updateFormData from dependencies to prevent infinite loops
  ]);

  // Fetch dropdown options from APIs
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      // Fetch support types
      try {
        setLoadingOptions((prev) => ({ ...prev, supportTypes: true }));
        const supportTypesResponse = await axiosInstance.get("/support-types");
        if (supportTypesResponse.data.success) {
          setDropdownOptions((prev) => ({
            ...prev,
            supportTypes: supportTypesResponse.data.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching support types:", error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, supportTypes: false }));
      }

      // Fetch process types
      try {
        setLoadingOptions((prev) => ({ ...prev, processTypes: true }));
        const processTypesResponse = await axiosInstance.get("/process-types");
        if (processTypesResponse.data.success) {
          setDropdownOptions((prev) => ({
            ...prev,
            processTypes: processTypesResponse.data.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching process types:", error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, processTypes: false }));
      }

      // Fetch query types
      try {
        setLoadingOptions((prev) => ({ ...prev, queryTypes: true }));
        const queryTypesResponse = await axiosInstance.get("/query-types");
        if (queryTypesResponse.data.success) {
          setDropdownOptions((prev) => ({
            ...prev,
            queryTypes: queryTypesResponse.data.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching query types:", error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, queryTypes: false }));
      }
    };

    fetchDropdownOptions();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const callTypes = [
    { value: "InBound", label: "Inbound Call" },
    { value: "OutBound", label: "Outbound Call" },
  ];

  const statusOptions = [
    { value: "closed", label: "Closed" },
    { value: "open", label: "Open" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    updateFormData(name, newValue);

    // Clear follow-up date if status is changed to closed
    if (name === "status" && value === "closed") {
      updateFormData("followUpDate", "");
    }
  };

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    updateFormData("attachments", files);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate auto-populated fields exist
    // if (!formData.CallId) {
    //   newErrors.CallId = "Call ID is required";
    // }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee ID is required";
    }

    if (!formData.callDateTime) {
      newErrors.callDateTime = "Call date and time is required";
    }

    // Validate user input fields
    if (!formData.supportTypeId) {
      newErrors.supportTypeId = "Support type is required";
    }

    if (!formData.processTypeId) {
      newErrors.processTypeId = "Process type is required";
    }

    if (!formData.queryTypeId) {
      newErrors.queryTypeId = "Query type is required";
    }

    if (!formData.remarks.trim()) {
      newErrors.remarks = "Remarks are required";
    }

    if (formData.status === "open" && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required for open tickets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Just call the parent's onSubmit
    await onSubmit();
  };

  const handleCancel = () => {
    // Only check for user-entered data (not auto-populated fields)
    const hasFormData =
      formData.supportTypeId ||
      formData.processTypeId ||
      formData.queryTypeId ||
      formData.remarks.trim() ||
      formData.attachments.length > 0 ||
      formData.status !== "closed" ||
      formData.followUpDate;

    onCancel(hasFormData);
  };

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F68A1F] mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 font-medium">
              Submitting form...
            </p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Submission Error */}
        {submissionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{submissionError}</p>
          </div>
        )}

        {/* Category Selection Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Category Selection
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Support Type *
              </label>
              <select
                name="supportTypeId"
                value={formData.supportTypeId}
                onChange={handleInputChange}
                disabled={loadingOptions.supportTypes}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.supportTypeId ? "border-red-500" : "border-gray-300"
                } ${
                  loadingOptions.supportTypes
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {loadingOptions.supportTypes
                    ? "Loading..."
                    : "Select support type"}
                </option>
                {dropdownOptions.supportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.supportName || type.name}
                  </option>
                ))}
              </select>
              {errors.supportTypeId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.supportTypeId}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Process Type *
              </label>
              <select
                name="processTypeId"
                value={formData.processTypeId}
                onChange={handleInputChange}
                disabled={loadingOptions.processTypes}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.processTypeId ? "border-red-500" : "border-gray-300"
                } ${
                  loadingOptions.processTypes
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {loadingOptions.processTypes
                    ? "Loading..."
                    : "Select process type"}
                </option>
                {dropdownOptions.processTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.processName || type.name}
                  </option>
                ))}
              </select>
              {errors.processTypeId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.processTypeId}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Query Type *
              </label>
              <select
                name="queryTypeId"
                value={formData.queryTypeId}
                onChange={handleInputChange}
                disabled={loadingOptions.queryTypes}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.queryTypeId ? "border-red-500" : "border-gray-300"
                } ${
                  loadingOptions.queryTypes
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {loadingOptions.queryTypes
                    ? "Loading..."
                    : "Select query type"}
                </option>
                {dropdownOptions.queryTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.queryName || type.name}
                  </option>
                ))}
              </select>
              {errors.queryTypeId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.queryTypeId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Call Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Call Details
          </h3>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Remarks *
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors resize-vertical ${
                errors.remarks ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter detailed remarks about the call..."
            />
            {errors.remarks && (
              <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Status & Follow-up
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up Date - Only show if status is open */}
            {formData.status === "open" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-blue-800 mb-2">
                  Follow-up Date *
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.followUpDate ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.followUpDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.followUpDate}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
          {/* <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            Cancel
          </button> */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 text-sm bg-[#F68A1F] hover:bg-[#e5791c] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium order-1 sm:order-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {isSubmitting
                ? "Submitting..."
                : isCallEnded
                ? "Save & Return to Dashboard"
                : "Save Remarks"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallRemarksForm;
