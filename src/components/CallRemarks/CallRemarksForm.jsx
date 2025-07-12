import React, { useState, useEffect } from "react";
import axiosInstance from "../../library/axios"; // Adjust path as needed

const CallRemarksForm = ({
  currentNumber,
  currentCallDetails,
  customerData,
  onSubmit,
  onCancel,
  isSubmitting,
  isCallEnded,
  submissionError,
}) => {
  const [formData, setFormData] = useState({
    CallId: currentCallDetails?.CallId || "",
    EmployeeId: currentCallDetails?.EmployeeId || "",
    callDateTime: new Date().toISOString().slice(0, 16), // Default to current datetime
    callType: "InBound",
    supportTypeId: "",
    inquiryNumber: "",
    processTypeId: "",
    queryTypeId: "",
    remarks: "",
    attachments: [],
    status: "closed",
    followUpDate: "",
  });

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

  const [errors, setErrors] = useState({});

  // Fetch dropdown options from APIs
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch support types
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

      try {
        // Fetch process types
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

      try {
        // Fetch query types
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

  // Update form data when call details change
  useEffect(() => {
    if (currentCallDetails) {
      setFormData((prev) => ({
        ...prev,
        CallId: currentCallDetails.CallId || prev.CallId,
        EmployeeId: currentCallDetails.EmployeeId || prev.EmployeeId,
      }));
    }
  }, [currentCallDetails]);

  const callTypes = [
    { value: "InBound", label: "Inbound Call" },
    { value: "OutBound", label: "Outbound Call" },
  ];

  const statusOptions = [
    {
      value: "closed",
      label: "Closed",
    },
    {
      value: "open",
      label: "Open",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear follow-up date if status is changed to closed
    if (name === "status" && value === "closed") {
      setFormData((prev) => ({
        ...prev,
        followUpDate: "",
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: files,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CallId) {
      newErrors.CallId = "Call ID is required";
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee ID is required";
    }

    if (!formData.callDateTime) {
      newErrors.callDateTime = "Call date and time is required";
    }

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

    if (isSubmitting) {
      return;
    }

    if (validateForm()) {
      try {
        // Create FormData for multipart/form-data submission
        const formDataToSubmit = new FormData();

        // Append all form fields
        formDataToSubmit.append("CallId", formData.CallId);
        formDataToSubmit.append("EmployeeId", formData.EmployeeId);
        formDataToSubmit.append("callDateTime", formData.callDateTime);
        formDataToSubmit.append("callType", formData.callType);
        formDataToSubmit.append("supportTypeId", formData.supportTypeId);
        formDataToSubmit.append("inquiryNumber", formData.inquiryNumber);
        formDataToSubmit.append("processTypeId", formData.processTypeId);
        formDataToSubmit.append("queryTypeId", formData.queryTypeId);
        formDataToSubmit.append("remarks", formData.remarks);
        formDataToSubmit.append("status", formData.status);

        if (formData.followUpDate) {
          formDataToSubmit.append("followUpDate", formData.followUpDate);
        }

        // Append files
        if (formData.attachments.length > 0) {
          formData.attachments.forEach((file) => {
            formDataToSubmit.append("attachments", file);
          });
        }

        // Submit the form using axiosInstance
        const response = await axiosInstance.post(
          "/form-details",
          formDataToSubmit,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          // Call the onSubmit callback with success
          await onSubmit(response.data);
        } else {
          throw new Error(response.data.message || "Submission failed");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        // Handle the error appropriately
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred while submitting the form";
        throw new Error(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    const hasFormData = Object.values(formData).some(
      (value) =>
        value !== "" &&
        value !== false &&
        value !== "InBound" &&
        value !== "closed" &&
        !Array.isArray(value)
    );
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

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Submission Error */}
        {submissionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{submissionError}</p>
          </div>
        )}

        {/* Call Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Call Information
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Call ID *
              </label>
              <input
                type="text"
                name="CallId"
                value={formData.CallId}
                onChange={handleInputChange}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.CallId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter call ID"
              />
              {errors.CallId && (
                <p className="text-red-500 text-xs mt-1">{errors.CallId}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="EmployeeId"
                value={formData.EmployeeId}
                onChange={handleInputChange}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.EmployeeId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter employee ID"
              />
              {errors.EmployeeId && (
                <p className="text-red-500 text-xs mt-1">{errors.EmployeeId}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Call Date & Time *
              </label>
              <input
                type="datetime-local"
                name="callDateTime"
                value={formData.callDateTime}
                onChange={handleInputChange}
                className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                  errors.callDateTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.callDateTime && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.callDateTime}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Call Type
              </label>
              <select
                name="callType"
                value={formData.callType}
                onChange={handleInputChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors"
              >
                {callTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Inquiry Number
              </label>
              <input
                type="text"
                name="inquiryNumber"
                value={formData.inquiryNumber}
                onChange={handleInputChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors"
                placeholder="Enter inquiry number"
              />
            </div>
          </div>
        </div>

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

        {/* Details Section */}
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

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <input
              type="file"
              name="attachments"
              onChange={handleFileChange}
              multiple
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#F68A1F] file:text-white hover:file:bg-[#e5791c] file:cursor-pointer"
            />
            {formData.attachments.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {formData.attachments.length} file(s) selected
              </p>
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

          {/* Follow-up Notice */}
          {formData.status === "open" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This ticket is marked as open and
                requires a follow-up date.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
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
      </form>
    </div>
  );
};

export default CallRemarksForm;
