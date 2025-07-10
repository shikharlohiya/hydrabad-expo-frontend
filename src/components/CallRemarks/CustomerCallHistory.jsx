import React, { useState } from 'react';
import { Clock, User, Tag, AlertCircle, CheckCircle, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const CustomerCallHistory = ({ callHistory, phoneNumber }) => {
    const [expandedCall, setExpandedCall] = useState(null);

    const getCallTypeColor = (type) => {
        switch (type) {
            case 'support':
                return 'text-blue-600 bg-blue-50';
            case 'sales':
                return 'text-green-600 bg-green-50';
            case 'complaint':
                return 'text-red-600 bg-red-50';
            case 'billing':
                return 'text-purple-600 bg-purple-50';
            case 'information':
                return 'text-gray-600 bg-gray-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getSatisfactionIcon = (satisfaction) => {
        switch (satisfaction) {
            case 'very_satisfied':
                return <span className="text-green-500">😊</span>;
            case 'satisfied':
                return <span className="text-green-400">🙂</span>;
            case 'neutral':
                return <span className="text-yellow-500">😐</span>;
            case 'dissatisfied':
                return <span className="text-orange-500">🙁</span>;
            case 'very_dissatisfied':
                return <span className="text-red-500">😞</span>;
            default:
                return <span className="text-gray-400">❓</span>;
        }
    };

    const formatCallType = (type) => {
        const types = {
            'support': 'Technical Support',
            'sales': 'Sales Inquiry',
            'complaint': 'Complaint',
            'information': 'Information',
            'billing': 'Billing Issue',
            'other': 'Other'
        };
        return types[type] || type;
    };

    const formatCategory = (category) => {
        const categories = {
            'technical': 'Technical Issue',
            'account': 'Account Management',
            'trading': 'Trading Platform',
            'payment': 'Payment & Billing',
            'documentation': 'Documentation',
            'general': 'General Inquiry'
        };
        return categories[category] || category;
    };

    const formatSatisfaction = (satisfaction) => {
        const satisfactions = {
            'very_satisfied': 'Very Satisfied',
            'satisfied': 'Satisfied',
            'neutral': 'Neutral',
            'dissatisfied': 'Dissatisfied',
            'very_dissatisfied': 'Very Dissatisfied'
        };
        return satisfactions[satisfaction] || 'Not Rated';
    };

    const toggleExpanded = (callId) => {
        setExpandedCall(expandedCall === callId ? null : callId);
    };

    if (!callHistory || callHistory.length === 0) {
        return (
            <div className="p-4">
                <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No call history found for this customer</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900">Call History</h4>
                <p className="text-xs text-gray-500 mt-1">{callHistory.length} previous calls</p>
            </div>

            <div className="space-y-3">
                {callHistory.map((call) => (
                    <div
                        key={call.id}
                        className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                    >
                        {/* Call Summary */}
                        <div
                            className="p-3 cursor-pointer"
                            onClick={() => toggleExpanded(call.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    {/* Date and Time */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {call.date}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            at {call.time}
                                        </span>
                                    </div>

                                    {/* Call Type and Duration */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallTypeColor(call.type)}`}>
                                            {formatCallType(call.type)}
                                        </span>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{call.duration}</span>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${getPriorityColor(call.priority)}`}>
                                            {call.priority.charAt(0).toUpperCase() + call.priority.slice(1)} Priority
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            {getSatisfactionIcon(call.satisfaction)}
                                            <span className="text-xs text-gray-500">
                                                {formatSatisfaction(call.satisfaction)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                <div className="ml-2">
                                    {expandedCall === call.id ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedCall === call.id && (
                            <div className="px-3 pb-3 border-t border-gray-100">
                                <div className="pt-3 space-y-3">
                                    {/* Category */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Category
                                        </label>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <Tag className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                                {formatCategory(call.category)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Resolution */}
                                    {call.resolution && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Resolution
                                            </label>
                                            <div className="mt-1 flex items-start space-x-2">
                                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-900">
                                                    {call.resolution}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Agent */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Handled By
                                        </label>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <User className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                                {call.agent}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex space-x-2 pt-2">
                                        <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                                            View Details
                                        </button>
                                        <button className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                                            Add Note
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {callHistory.length >= 3 && (
                <div className="mt-4 text-center">
                    <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Load More Calls
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerCallHistory;