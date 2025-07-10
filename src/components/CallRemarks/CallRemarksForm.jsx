import React, { useState, useEffect } from 'react';

const CallRemarksForm = ({
    currentNumber,
    currentCallDetails,
    onSubmit,
    onCancel,
    isSubmitting,
    isCallEnded
}) => {
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: currentCallDetails?.phoneNumber || currentNumber || '',
        callType: 'support',
        priority: 'medium',
        category: '',
        subCategory: '',
        description: '',
        resolution: '',
        followUpRequired: false,
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

    const callTypes = [
        { value: 'support', label: 'Technical Support' },
        { value: 'sales', label: 'Sales Inquiry' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'information', label: 'Information Request' },
        { value: 'billing', label: 'Billing Issue' },
        { value: 'other', label: 'Other' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
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
        { value: 'very_satisfied', label: 'Very Satisfied' },
        { value: 'satisfied', label: 'Satisfied' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'dissatisfied', label: 'Dissatisfied' },
        { value: 'very_dissatisfied', label: 'Very Dissatisfied' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

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

        if (formData.followUpRequired && !formData.followUpDate) {
            newErrors.followUpDate = 'Follow-up date is required when follow-up is needed';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await onSubmit(formData);
        }
    };

    const handleCancel = () => {
        const hasFormData = Object.values(formData).some(value =>
            value !== '' && value !== false && value !== 'support' && value !== 'medium'
        );
        onCancel(hasFormData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Call Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                    </label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter customer name"
                    />
                    {errors.customerName && (
                        <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Phone number"
                        disabled
                    />
                </div>
            </div>

            {/* Call Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Call Type
                    </label>
                    <select
                        name="callType"
                        value={formData.callType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    >
                        {callTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    >
                        {priorities.map(priority => (
                            <option key={priority.value} value={priority.value}>
                                {priority.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                </label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.category ? 'border-red-500' : 'border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Description *
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Describe the customer's inquiry or issue..."
                />
                {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
            </div>

            {/* Resolution */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution / Action Taken
                </label>
                <textarea
                    name="resolution"
                    value={formData.resolution}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    placeholder="Describe what was done to resolve the issue..."
                />
            </div>

            {/* Follow-up */}
            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="followUpRequired"
                        checked={formData.followUpRequired}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#F68A1F] focus:ring-[#F68A1F] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                        Follow-up required
                    </label>
                </div>

                {formData.followUpRequired && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Follow-up Date *
                        </label>
                        <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] ${errors.followUpDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.followUpDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Customer Satisfaction */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Satisfaction
                </label>
                <select
                    name="customerSatisfaction"
                    value={formData.customerSatisfaction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                >
                    <option value="">Select satisfaction level</option>
                    {satisfactionRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>
                            {rating.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Additional Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                </label>
                <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                    placeholder="Any additional notes or observations..."
                />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#F68A1F] hover:bg-[#e5791c] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : (isCallEnded ? 'Save Remarks & Return to Dashboard' : 'Save Remarks')}
                </button>
            </div>
        </form>
    );
};

export default CallRemarksForm;