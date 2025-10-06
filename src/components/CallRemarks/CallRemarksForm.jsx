import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../library/axios";
import { User, Phone, MapPin } from "lucide-react";
import useForm from "../../hooks/useForm";

const CallRemarksForm = ({
  currentNumber,
  currentCallDetails,
  customerData,
  formData,
  updateFormData,
  errors,
  onSubmit,
  onCancel,
  isSubmitting,
  isCallEnded,
  submissionError,
  callDirection,
  callStartTime,
  callDuration,
  activeCallId,
  userData,
  // New props for customer form
  searchError,
}) => {
  const { traderNotFoundData, setTraderNotFoundData, savedContactData } =
    useForm();

  const [dropdownOptions, setDropdownOptions] = useState({
    supportTypes: [],
    processTypes: [],
    queryTypes: [],
    problemTypes: [],
    subProblemTypes: [],
  });

  const [loadingOptions, setLoadingOptions] = useState({
    supportTypes: false,
    processTypes: false,
    queryTypes: false,
    problemTypes: false,
    subProblemTypes: false,
  });

  // Common regions
 const regions = [


    { value: "AP00", label: "AP00" },


    { value: "AP01", label: "AP01" },


    { value: "AP02", label: "AP02" },


    { value: "AS00", label: "AS00" },


    { value: "AS01", label: "AS01" },


    { value: "BR00", label: "BR00" },


    { value: "BR01", label: "BR01" },


    { value: "BH00", label: "BH00" },


    { value: "CG00", label: "CG00" },


    { value: "HP00", label: "HP00" },


    { value: "GJ00", label: "GJ00" },


    { value: "HR00", label: "HR00" },


    { value: "HR01", label: "HR01" },


    { value: "JK00", label: "JK00" },


    { value: "JH00", label: "JH00" },


    { value: "KA00", label: "KA00" },


    { value: "KR00", label: "KR00" },


    { value: "KR01", label: "KR01" },


    { value: "MP00", label: "MP00" },


    { value: "MP01", label: "MP01" },


    { value: "MH00", label: "MH00" },


    { value: "MH01", label: "MH01" },


    { value: "MH02", label: "MH02" },


    { value: "OD00", label: "OD00" },


    { value: "OR00", label: "OR00" },


    { value: "OR01", label: "OR01" },


    { value: "OR02", label: "OR02" },


    { value: "PB00", label: "PB00" },


    { value: "PB01", label: "PB01" },


    { value: "PN00", label: "PN00" },


    { value: "PN01", label: "PN01" },


    { value: "PB02", label: "PB02" },


    { value: "RJ00", label: "RJ00" },


    { value: "RJ01", label: "RJ01" },


    { value: "TL00", label: "TL00" },


    { value: "TL01", label: "TL01" },


    { value: "TN00", label: "TN00" },


    { value: "TN01", label: "TN01" },


    { value: "TN02", label: "TN02" },


    { value: "UP01", label: "UP01" },


    { value: "UP00", label: "UP00" },


    { value: "UP03", label: "UP03" },


    { value: "UP02", label: "UP02" },


    { value: "UP04", label: "UP04" },


    { value: "UK00", label: "UK00" },


    { value: "WB01", label: "WB01" },


    { value: "WB00", label: "WB00" },


    { value: "WB02", label: "WB02" },


    { value: "WB03", label: "WB03" },

  ];
  const typeOptions = [
    { value: "Trader", label: "Trader" },
    { value: "Non-Trader", label: "Non-Trader" },
  ];

  // Auto-populate form data with actual call information
  useEffect(() => {
    const populateCallData = () => {
      const callDateTime = callStartTime;
      const callType = callDirection === "incoming" ? "InBound" : "OutBound";
      const inquiryNumber = currentNumber || "";

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
    activeCallId,
    currentCallDetails?.CallId,
    currentCallDetails?.EmployeeId,
    userData?.EmployeeId,
    callStartTime,
    callDirection,
    currentNumber,
    updateFormData,
  ]);

  useEffect(() => {
    // When currentNumber changes, it signifies a new call, and we must reset the form state
    // for the new contact, only keeping the new phone number.
    // The subsequent effect for `customerData` will then populate the fields if an existing user is found.
    setTraderNotFoundData((prev) => {
      // If the number is new, reset everything but the phone number.
      if (currentNumber && currentNumber !== prev.phoneNumber) {
        return {
          name: "",
          region: "",
          type: "Trader",
          phoneNumber: currentNumber,
        };
      }

      // If the number is the same, but we got savedContactData (e.g. on refresh), populate from it.
      if (
        savedContactData &&
        savedContactData.Contact_no === prev.phoneNumber
      ) {
        return {
          ...prev,
          name: savedContactData.Trader_Name || prev.name,
          region: savedContactData.Region || prev.region,
          type: savedContactData.Type || prev.type,
        };
      }

      // Otherwise, don't change the state.
      return prev;
    });
  }, [savedContactData, currentNumber, setTraderNotFoundData]);

  // Pre-fill form with fetched customer data, prioritizing contact directory
  useEffect(() => {
    if (customerData) {
      const { contactInfo, traderMaster, phoneNumber } = customerData;

      // Prioritize contactInfo as the source of truth
      if (contactInfo) {
        setTraderNotFoundData((prev) => ({
          ...prev,
          name: contactInfo.Contact_Name || "",
          region: contactInfo.Region || "",
          type: contactInfo.Type || "Trader",
          phoneNumber: phoneNumber || prev.phoneNumber,
        }));
      }
      // Fallback to traderMaster if contactInfo is not available
      else if (traderMaster) {
        setTraderNotFoundData((prev) => ({
          ...prev,
          name: traderMaster.Trader_Name || "",
          region: traderMaster.Region || "",
          type: "Trader", // Master records are always 'Trader'
          phoneNumber: phoneNumber || prev.phoneNumber,
        }));
      }
    }
  }, [customerData, setTraderNotFoundData]);

  // Fetch dropdown options from APIs
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      // Fetch problem types
      try {
        setLoadingOptions((prev) => ({ ...prev, problemTypes: true }));
        const problemTypesResponse = await axiosInstance.get("/problem-types");
        if (problemTypesResponse.data.success) {
          setDropdownOptions((prev) => ({
            ...prev,
            problemTypes: problemTypesResponse.data.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching problem types:", error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, problemTypes: false }));
      }
    };

    fetchDropdownOptions();
  }, []);

  // Fetch sub-problem types when problemId changes
  useEffect(() => {
    const fetchSubProblemTypes = async () => {
      // Reset sub-problem types if no problem is selected
      if (!formData.problemId) {
        setDropdownOptions((prev) => ({ ...prev, subProblemTypes: [] }));
        return;
      }

      try {
        setLoadingOptions((prev) => ({ ...prev, subProblemTypes: true }));
        const response = await axiosInstance.get(
          `/sub-problem-types?problemId=${formData.problemId}`
        );
        if (response.data.success) {
          setDropdownOptions((prev) => ({
            ...prev,
            subProblemTypes: response.data.data,
          }));
        } else {
          setDropdownOptions((prev) => ({ ...prev, subProblemTypes: [] }));
        }
      } catch (error) {
        console.error("Error fetching sub-problem types:", error);
        setDropdownOptions((prev) => ({ ...prev, subProblemTypes: [] }));
      } finally {
        setLoadingOptions((prev) => ({ ...prev, subProblemTypes: false }));
      }
    };

    fetchSubProblemTypes();
  }, [formData.problemId]);

  const statusOptions = [
    { value: "closed", label: "Resolved" },
    { value: "open", label: "Unresolved" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    updateFormData(name, newValue);

    // Clear follow-up date if status is changed to closed
    if (name === "status" && value === "closed") {
      updateFormData("followUpDate", "");
    } else if (name === "status" && value === "open") {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      updateFormData("followUpDate", nextDay);
    }
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setTraderNotFoundData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Small delay to ensure state updates are applied
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Call parent's onSubmit which will handle the actual API call
    await onSubmit();
  };

  const handleCancel = () => {
    const hasFormData =
      formData.supportTypeId ||
      formData.processTypeId ||
      formData.queryTypeId ||
      formData.remarks?.trim() ||
      formData.attachments?.length > 0 ||
      formData.status !== "closed" ||
      formData.followUpDate ||
      traderNotFoundData.name.trim();

    onCancel(hasFormData);
  };

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const maxYear = maxDate.getFullYear();
  const maxMonth = (maxDate.getMonth() + 1).toString().padStart(2, "0");
  const maxDay = maxDate.getDate().toString().padStart(2, "0");
  const maxHours = maxDate.getHours().toString().padStart(2, "0");
  const maxMinutes = maxDate.getMinutes().toString().padStart(2, "0");
  const maxDateTime = `${maxYear}-${maxMonth}-${maxDay}T${maxHours}:${maxMinutes}`;

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

        {/* Customer Form - Only show if showNewCustomerForm is true */}
        {
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                {searchError ? (
                  <p className="text-sm text-blue-600 mt-1">
                    Save or Update Trader Information!
                  </p>
                ) : (
                  <p className="text-sm text-blue-600 mt-1">
                    Enter The Trader Information Below
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={traderNotFoundData.name}
                  onChange={handleCustomerInputChange}
                  className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter customer name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={traderNotFoundData.phoneNumber || ""}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 border border-blue-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="No phone number"
                  />
                </div>
              </div>

              {/* SAP Inquiry Number */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  SAP Inquiry Number
                </label>
                <input
                  type="text"
                  name="sapInquiryNumber"
                  value={formData.sapInquiryNumber || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter SAP inquiry number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Region
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <select
                    name="region"
                    value={traderNotFoundData.region}
                    onChange={handleCustomerInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={traderNotFoundData.type}
                  onChange={handleCustomerInputChange}
                  className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-save indicator */}
            {traderNotFoundData.name.trim() && (
              <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 flex items-center">
                  ✅ Customer details will be saved with call form
                </p>
              </div>
            )}
          </div>
        }

        {/* Problem Description Section */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Traders Inquiry
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Problem Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Problem Type *
                </label>
                <select
                  name="problemId"
                  value={formData.problemId || ""}
                  onChange={handleInputChange}
                  disabled={loadingOptions.problemTypes}
                  className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                    errors.problemId ? "border-red-500" : "border-gray-300"
                  } ${
                    loadingOptions.problemTypes
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">
                    {loadingOptions.problemTypes
                      ? "Loading..."
                      : "Select problem type"}
                  </option>
                  {dropdownOptions.problemTypes.map((type, index) => (
                    <option key={`${type.id}-${index}`} value={type.id}>
                      {type.problemName}
                    </option>
                  ))}
                </select>
                {errors.problemId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.problemId}
                  </p>
                )}
              </div>

              {/* Sub Problem Type */}
              {formData.problemId != 6 && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Related Issue *
                  </label>
                  <select
                    name="subProblemId"
                    value={formData.subProblemId || ""}
                    onChange={handleInputChange}
                    disabled={
                      loadingOptions.subProblemTypes || !formData.problemId
                    }
                    className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${
                      errors.subProblemId ? "border-red-500" : "border-gray-300"
                    } ${
                      loadingOptions.subProblemTypes || !formData.problemId
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="">
                      {loadingOptions.subProblemTypes
                        ? "Loading..."
                        : "Select sub-problem type"}
                    </option>
                    {dropdownOptions.subProblemTypes.map((type, index) => (
                      <option key={`${type.id}-${index}`} value={type.id}>
                        {type.subProblemName}
                      </option>
                    ))}
                  </select>
                  {errors.subProblemId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subProblemId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* Call Details Section */}
        <div className="space-y-4">
          {/* <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Call Details
          </h3> */}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Remarks *
            </label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
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
                  value={formData.status || "closed"}
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
                    type="datetime-local"
                    name="followUpDate"
                    value={formData.followUpDate || ""}
                    onChange={handleInputChange}
                    min={minDateTime}
                    max={maxDateTime}
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
