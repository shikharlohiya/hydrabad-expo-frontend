import React, { useState, useEffect } from 'react';
import { User, Phone, Tag, MessageSquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const CallRemarksForm = ({
    currentNumber,
    currentCallDetails,
    customerData, // New prop for customer data
    onSubmit,
    onCancel,
    isSubmitting,
    isCallEnded,
    submissionError
}) => {
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: currentCallDetails?.phoneNumber || currentNumber || '',
        callType: 'support',
        priority: 'medium',
        category: '',
        description: '',
        resolution: '',
        status: 'closed',
        followUpDate: '',
        customerSatisfaction: '',
        additionalNotes: ''
    });

    const [errors, setErrors] = useState({});

    // Update form data when call details change
    useEffect(() => {
        if (currentNumber) {
            setFormData(prev => ({
                ...prev,
                phoneNumber: currentNumber
            }));
        }
    }, [currentNumber]);

    // Auto-fill customer name when customer data is available
    useEffect(() => {
        if (customerData && customerData.name) {
            setFormData(prev => ({
                ...prev,
                customerName: customerData.name,
                phoneNumber: customerData.phoneNumber || currentNumber || prev.phoneNumber
            }));
        }
    }, [customerData, currentNumber]);

    const callTypes = [
        { value: 'support', label: 'Technical Support', icon: '🔧' },
        { value: 'sales', label: 'Sales Inquiry', icon: '💼' },
        { value: 'complaint', label: 'Complaint', icon: '⚠️' },
        { value: 'information', label: 'Information Request', icon: 'ℹ️' },
        { value: 'billing', label: 'Billing Issue', icon: '💳' },
        { value: 'other', label: 'Other', icon: '📝' }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
        { value: 'urgent', label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50' }
    ];

    const categories = [
        { value: 'technical', label: 'Technical Issue' },
        { value: 'account', label: 'Account Management' },
        { value: 'trading', label: 'Trading Platform' },
        { value: 'payment', label: 'Payment & Billing' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'general', label: 'General Inquiry' }
    ];

    const satisfactionRatings = [
        { value: 'very_satisfied', label: 'Very Satisfied', emoji: '😊', color: 'text-green-600' },
        { value: 'satisfied', label: 'Satisfied', emoji: '🙂', color: 'text-green-500' },
        { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-600' },
        { value: 'dissatisfied', label: 'Dissatisfied', emoji: '🙁', color: 'text-orange-600' },
        { value: 'very_dissatisfied', label: 'Very Dissatisfied', emoji: '😞', color: 'text-red-600' }
    ];

    const statusOptions = [
        { value: 'closed', label: 'Closed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'open', label: 'Open', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear follow-up date if status is changed to closed
        if (name === 'status' && value === 'closed') {
            setFormData(prev => ({
                ...prev,
                followUpDate: ''
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Customer name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Call description is required';
        }

        if (formData.status === 'open' && !formData.followUpDate) {
            newErrors.followUpDate = 'Follow-up date is required for open tickets';
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
            await onSubmit(formData);
        }
    };

    const handleCancel = () => {
        const hasFormData = Object.values(formData).some(value =>
            value !== '' && value !== false && value !== 'support' && value !== 'medium' && value !== 'closed'
        );
        onCancel(hasFormData);
    };

    const selectedPriority = priorities.find(p => p.value === formData.priority);
    const selectedStatus = statusOptions.find(s => s.value === formData.status);

    return (
        <div className="relative">
            {/* Loading overlay */}
            {isSubmitting && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F68A1F] mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600 font-medium">Submitting form...</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Submission Error */}
                {submissionError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800">{submissionError}</p>
                    </div>
                )}

                {/* Customer Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 mr-1" />
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter customer name"
                        />
                        {errors.customerName && (
                            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <Phone className="w-4 h-4 mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            disabled
                        />
                    </div>
                </div>

                {/* Call Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Call Type</label>
                        <select
                            name="callType"
                            value={formData.callType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            {callTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <div className="relative">
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${selectedPriority?.color} ${selectedPriority?.bg}`}
                            >
                                {priorities.map(priority => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${selectedStatus?.color} ${selectedStatus?.bg}`}
                            >
                                {statusOptions.map(status => {
                                    return (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                {selectedStatus && <selectedStatus.icon className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <Tag className="w-4 h-4 mr-1" />
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Call Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Describe the customer's inquiry or issue..."
                    />
                    {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                </div>

                {/* Resolution */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolution / Action Taken
                    </label>
                    <textarea
                        name="resolution"
                        value={formData.resolution}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        placeholder="Describe what was done to resolve the issue..."
                    />
                </div>

                {/* Follow-up Date - Only show if status is open */}
                {formData.status === 'open' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <label className="flex items-center text-sm font-medium text-blue-800 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            Follow-up Date * (Required for open tickets)
                        </label>
                        <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.followUpDate ? 'border-red-500' : 'border-blue-300'
                                }`}
                        />
                        {errors.followUpDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>
                        )}
                    </div>
                )}

                {/* Customer Satisfaction and Additional Notes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Satisfaction</label>
                        <select
                            name="customerSatisfaction"
                            value={formData.customerSatisfaction}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            <option value="">Select satisfaction level</option>
                            {satisfactionRatings.map(rating => (
                                <option key={rating.value} value={rating.value}>
                                    {rating.emoji} {rating.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleInputChange}
                            rows={1}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] resize-none"
                            placeholder="Any additional notes..."
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm bg-[#F68A1F] hover:bg-[#e5791c] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                    >
                        {isSubmitting && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span>
                            {isSubmitting ? 'Submitting...' : (isCallEnded ? 'Save & Return to Dashboard' : 'Save Remarks')}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CallRemarksForm;