import React, { useState } from "react";
import { User, Mail, Phone, X, Save, Loader2 } from "lucide-react";

const NewCustomerForm = ({
  phoneNumber,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: phoneNumber || "",
    accountType: "Standard",
  });

  const [errors, setErrors] = useState({});

  const accountTypes = [
    { value: "Basic", label: "Basic" },
    { value: "Standard", label: "Standard" },
    { value: "Premium", label: "Premium" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    onSubmit(formData);
  };

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Customer Not Found
            </h3>
            <p className="text-sm text-blue-700">
              Add customer information (optional)
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          title="Skip adding customer"
        >
          <X className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form Fields in Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name
                  ? "border-red-500 bg-red-50"
                  : "border-blue-200 bg-white"
              }`}
              placeholder="Enter customer name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-blue-200 bg-white"
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phoneNumber
                    ? "border-red-500 bg-red-50"
                    : "border-blue-200 bg-white"
                }`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Account Type
            </label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4 mt-6 border-t border-blue-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Skip & Continue
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCustomerForm;
