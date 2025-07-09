import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    PhoneArrowUpRightIcon,
    PhoneArrowDownLeftIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useDialer from '../../../hooks/useDialer';

const CallHistoryPage = () => {
    const { callHistory, formatDuration, initiateCall } = useDialer();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [selectedCall, setSelectedCall] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Mock call history data (replace with real data from your system)
    const mockCallHistory = [
        {
            id: 1,
            number: '+91 98765 43210',
            contactName: 'Rajesh Kumar',
            type: 'outgoing',
            status: 'completed',
            duration: 323, // seconds
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            category: 'Technical Support',
            priority: 'High',
            satisfaction: 'satisfied',
            remarks: {
                customerName: 'Rajesh Kumar',
                description: 'Customer facing login issues with trading platform',
                resolution: 'Reset password and cleared browser cache. Issue resolved.',
                followUpRequired: true,
                followUpDate: '2024-12-22',
                additionalNotes: 'Customer very satisfied with quick resolution'
            },
            tags: ['Resolved', 'Follow-up Needed']
        },
        {
            id: 2,
            number: '+91 87654 32109',
            contactName: 'Priya Sharma',
            type: 'incoming',
            status: 'completed',
            duration: 267,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            category: 'Sales Inquiry',
            priority: 'Medium',
            satisfaction: 'very_satisfied',
            remarks: {
                customerName: 'Priya Sharma',
                description: 'Interested in premium trading account features',
                resolution: 'Explained premium features and sent brochure via email',
                followUpRequired: true,
                followUpDate: '2024-12-23',
                additionalNotes: 'Potential upgrade to premium account'
            },
            tags: ['Sales Lead', 'Premium Interest']
        },
        {
            id: 3,
            number: '+91 76543 21098',
            contactName: 'Unknown',
            type: 'incoming',
            status: 'missed',
            duration: 0,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            category: 'General',
            priority: 'Low',
            satisfaction: null,
            remarks: null,
            tags: ['Missed Call']
        },
        {
            id: 4,
            number: '+91 65432 10987',
            contactName: 'Amit Patel',
            type: 'outgoing',
            status: 'failed',
            duration: 0,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            category: 'Follow-up',
            priority: 'Medium',
            satisfaction: null,
            remarks: null,
            tags: ['Failed Call', 'Retry Needed']
        },
        {
            id: 5,
            number: '+91 54321 09876',
            contactName: 'Sneha Reddy',
            type: 'incoming',
            status: 'completed',
            duration: 156,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            category: 'Account Management',
            priority: 'High',
            satisfaction: 'satisfied',
            remarks: {
                customerName: 'Sneha Reddy',
                description: 'Query about recent transaction charges',
                resolution: 'Explained fee structure and provided detailed breakdown',
                followUpRequired: false,
                additionalNotes: 'Customer understood the charges'
            },
            tags: ['Billing Query', 'Resolved']
        }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status', count: mockCallHistory.length },
        { value: 'completed', label: 'Completed', count: mockCallHistory.filter(c => c.status === 'completed').length },
        { value: 'missed', label: 'Missed', count: mockCallHistory.filter(c => c.status === 'missed').length },
        { value: 'failed', label: 'Failed', count: mockCallHistory.filter(c => c.status === 'failed').length }
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'incoming', label: 'Incoming' },
        { value: 'outgoing', label: 'Outgoing' }
    ];

    const dateOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' }
    ];

    const filteredCalls = mockCallHistory.filter(call => {
        const matchesSearch = call.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.number.includes(searchTerm) ||
            call.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
        const matchesType = selectedType === 'all' || call.type === selectedType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return CheckCircleIcon;
            case 'missed': return ExclamationTriangleIcon;
            case 'failed': return XCircleIcon;
            default: return ClockIcon;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'missed': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeIcon = (type) => {
        return type === 'incoming' ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;
    };

    const getTypeColor = (type) => {
        return type === 'incoming' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return 'Less than an hour ago';
        }
    };

    const handleCallBack = (call) => {
        initiateCall(call.number, {
            name: call.contactName,
            company: call.remarks?.customerName
        });
    };

    const CallDetailsModal = ({ call, onClose }) => {
        if (!call) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Call Details</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Call Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <p className="text-lg font-semibold text-gray-900">{call.contactName || 'Unknown'}</p>
                                <p className="text-sm text-gray-600">{call.number}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Call Details</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(call.type)}`}>
                                        {call.type}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                        {call.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Duration: {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Timestamp and Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <p className="text-sm text-gray-900">{call.timestamp.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{formatTimestamp(call.timestamp)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category & Priority</label>
                                <p className="text-sm text-gray-900">{call.category}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(call.priority)} mt-1`}>
                                    {call.priority} Priority
                                </span>
                            </div>
                        </div>

                        {/* Tags */}
                        {call.tags && call.tags.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {call.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                            <TagIcon className="w-3 h-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Call Remarks */}
                        {call.remarks && (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Remarks</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <p className="text-sm text-gray-900 mt-1">{call.remarks.description}</p>
                                    </div>

                                    {call.remarks.resolution && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Resolution</label>
                                            <p className="text-sm text-gray-900 mt-1">{call.remarks.resolution}</p>
                                        </div>
                                    )}

                                    {call.remarks.followUpRequired && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Follow-up Required</label>
                                            <p className="text-sm text-red-600 mt-1">
                                                Yes - Due: {call.remarks.followUpDate}
                                            </p>
                                        </div>
                                    )}

                                    {call.satisfaction && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Satisfaction</label>
                                            <p className="text-sm text-gray-900 mt-1 capitalize">{call.satisfaction.replace('_', ' ')}</p>
                                        </div>
                                    )}

                                    {call.remarks.additionalNotes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                            <p className="text-sm text-gray-900 mt-1">{call.remarks.additionalNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleCallBack(call)}
                                className="flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                            >
                                <PhoneIcon className="w-4 h-4 mr-2" />
                                Call Back
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                Add Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
                        <p className="text-gray-600 mt-2">Review and analyze your call activities</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Export
                        </button>
                        <button className="flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors">
                            <ChartBarIcon className="w-5 h-5 mr-2" />
                            Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Calls</p>
                            <p className="text-2xl font-bold text-gray-900">{mockCallHistory.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockCallHistory.filter(c => c.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Missed</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockCallHistory.filter(c => c.status === 'missed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold text-gray-900">4:32</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search calls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label} {option.count && `(${option.count})`}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            {dateOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-sm text-gray-600">
                    Showing {filteredCalls.length} of {mockCallHistory.length} calls
                </p>
            </div>

            {/* Call History Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCalls.map((call) => {
                            const StatusIcon = getStatusIcon(call.status);
                            const TypeIcon = getTypeIcon(call.type);

                            return (
                                <tr key={call.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full ${getTypeColor(call.type)}`}>
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {call.contactName || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">{call.number}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {call.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">{call.category}</div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(call.priority)}`}>
                                                {call.priority}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{call.timestamp.toLocaleDateString()}</div>
                                        <div>{formatTimestamp(call.timestamp)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCall(call);
                                                    setShowDetails(true);
                                                }}
                                                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                            {call.status !== 'failed' && (
                                                <button
                                                    onClick={() => handleCallBack(call)}
                                                    className="inline-flex items-center px-3 py-1 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                                                >
                                                    <PhoneIcon className="w-4 h-4 mr-1" />
                                                    Call
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {filteredCalls.length === 0 && (
                <div className="text-center py-12">
                    <ClockIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Your call history will appear here once you start making calls'
                        }
                    </p>
                </div>
            )}

            {/* Call Details Modal */}
            {showDetails && selectedCall && (
                <CallDetailsModal
                    call={selectedCall}
                    onClose={() => {
                        setShowDetails(false);
                        setSelectedCall(null);
                    }}
                />
            )}
        </div>
    );
};

export default CallHistoryPage;