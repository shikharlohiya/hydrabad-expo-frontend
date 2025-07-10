import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
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
    UserIcon,
    BellIcon,
    StarIcon,
    TagIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useDialer from '../../../hooks/useDialer';

const IncomingCallPage = () => {
    const { formatDuration, initiateCall } = useDialer();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState('today');
    const [selectedCall, setSelectedCall] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Mock incoming calls data
    const incomingCalls = [
        {
            id: 1,
            number: '+91 98765 43210',
            contactName: 'Rajesh Kumar',
            status: 'answered',
            duration: 420, // 7 minutes
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            answerTime: 8, // seconds to answer
            category: 'Support Request',
            priority: 'High',
            location: 'Mumbai, Maharashtra',
            deviceInfo: 'Mobile',
            satisfaction: 'very_satisfied',
            isKnownContact: true,
            callbackRequested: false,
            tags: ['VIP Customer', 'Urgent'],
            remarks: {
                description: 'Customer reporting trading platform glitch during market hours',
                resolution: 'Identified server issue, escalated to tech team, provided temporary workaround',
                followUpRequired: true,
                followUpDate: '2024-12-21'
            }
        },
        {
            id: 2,
            number: '+91 87654 32109',
            contactName: 'Priya Sharma',
            status: 'answered',
            duration: 185, // 3 minutes
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            answerTime: 12,
            category: 'General Inquiry',
            priority: 'Medium',
            location: 'Delhi, Delhi',
            deviceInfo: 'Landline',
            satisfaction: 'satisfied',
            isKnownContact: true,
            callbackRequested: false,
            tags: ['Regular Customer'],
            remarks: {
                description: 'Inquiry about new investment options and portfolio review',
                resolution: 'Explained available options, scheduled appointment with advisor',
                followUpRequired: true,
                followUpDate: '2024-12-23'
            }
        },
        {
            id: 3,
            number: '+91 76543 21098',
            contactName: 'Unknown Caller',
            status: 'missed',
            duration: 0,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            answerTime: null,
            category: 'Unknown',
            priority: 'Low',
            location: 'Pune, Maharashtra',
            deviceInfo: 'Mobile',
            satisfaction: null,
            isKnownContact: false,
            callbackRequested: true,
            tags: ['Callback Required', 'Unknown Number'],
            remarks: null
        },
        {
            id: 4,
            number: '+91 65432 10987',
            contactName: 'Amit Patel',
            status: 'answered',
            duration: 95,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            answerTime: 5,
            category: 'Complaint',
            priority: 'High',
            location: 'Ahmedabad, Gujarat',
            deviceInfo: 'Mobile',
            satisfaction: 'neutral',
            isKnownContact: true,
            callbackRequested: false,
            tags: ['Complaint', 'Billing Issue'],
            remarks: {
                description: 'Complaint about unexpected charges in account statement',
                resolution: 'Reviewed charges, found legitimate transaction fees, explained fee structure',
                followUpRequired: false
            }
        },
        {
            id: 5,
            number: '+91 54321 09876',
            contactName: 'Sneha Reddy',
            status: 'declined',
            duration: 0,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            answerTime: null,
            category: 'Unknown',
            priority: 'Low',
            location: 'Bangalore, Karnataka',
            deviceInfo: 'Mobile',
            satisfaction: null,
            isKnownContact: true,
            callbackRequested: false,
            tags: ['Declined'],
            remarks: null
        },
        {
            id: 6,
            number: '+91 43210 98765',
            contactName: 'Vikram Singh',
            status: 'answered',
            duration: 312,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            answerTime: 15,
            category: 'Sales Inquiry',
            priority: 'Medium',
            location: 'Jaipur, Rajasthan',
            deviceInfo: 'Landline',
            satisfaction: 'satisfied',
            isKnownContact: true,
            callbackRequested: false,
            tags: ['Sales Lead', 'Premium Interest'],
            remarks: {
                description: 'Interested in premium trading account and advanced features',
                resolution: 'Explained premium benefits, sent information packet, scheduled demo',
                followUpRequired: true,
                followUpDate: '2024-12-22'
            }
        }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status', count: incomingCalls.length },
        { value: 'answered', label: 'Answered', count: incomingCalls.filter(c => c.status === 'answered').length },
        { value: 'missed', label: 'Missed', count: incomingCalls.filter(c => c.status === 'missed').length },
        { value: 'declined', label: 'Declined', count: incomingCalls.filter(c => c.status === 'declined').length }
    ];

    const dateOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' }
    ];

    const filteredCalls = incomingCalls.filter(call => {
        const matchesSearch = call.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.number.includes(searchTerm) ||
            call.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const stats = {
        totalIncoming: incomingCalls.length,
        answered: incomingCalls.filter(c => c.status === 'answered').length,
        missed: incomingCalls.filter(c => c.status === 'missed').length,
        avgAnswerTime: Math.round(
            incomingCalls
                .filter(c => c.answerTime !== null)
                .reduce((sum, c) => sum + c.answerTime, 0) /
            incomingCalls.filter(c => c.answerTime !== null).length
        ),
        answerRate: Math.round((incomingCalls.filter(c => c.status === 'answered').length / incomingCalls.length) * 100),
        avgCallDuration: Math.round(
            incomingCalls
                .filter(c => c.duration > 0)
                .reduce((sum, c) => sum + c.duration, 0) /
            incomingCalls.filter(c => c.duration > 0).length
        ),
        callbacksRequired: incomingCalls.filter(c => c.callbackRequested).length,
        knownContacts: incomingCalls.filter(c => c.isKnownContact).length
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'answered': return CheckCircleIcon;
            case 'missed': return ExclamationTriangleIcon;
            case 'declined': return XCircleIcon;
            default: return ClockIcon;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'answered': return 'text-green-600 bg-green-100';
            case 'missed': return 'text-yellow-600 bg-yellow-100';
            case 'declined': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
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
            isCallBack: true
        });
    };

    const CallDetailsModal = ({ call, onClose }) => {
        if (!call) return null;

        return (
            <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Incoming Call Details</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Caller Info */}
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <PhoneArrowDownLeftIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{call.contactName}</h3>
                                <p className="text-gray-600">{call.number}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                        {call.status}
                                    </span>
                                    {call.isKnownContact ? (
                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            Known Contact
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                            Unknown Number
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Call Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Call Duration</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <BellIcon className="w-5 h-5 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Answer Time</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {call.answerTime ? `${call.answerTime}s` : 'Not answered'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time Received</label>
                                <p className="text-sm text-gray-900">{call.timestamp.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{formatTimestamp(call.timestamp)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <p className="text-sm text-gray-900">{call.location}</p>
                                <p className="text-xs text-gray-500">{call.deviceInfo}</p>
                            </div>
                        </div>

                        {/* Category and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <p className="text-sm text-gray-900">{call.category}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(call.priority)}`}>
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

                        {/* Customer Satisfaction */}
                        {call.satisfaction && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Satisfaction</label>
                                <p className="text-sm text-gray-900 mt-1 capitalize">{call.satisfaction.replace('_', ' ')}</p>
                            </div>
                        )}

                        {/* Call Remarks */}
                        {call.remarks && (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Call Summary</h4>
                                <div className="space-y-3">
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
                                            <label className="block text-sm font-medium text-gray-700">Follow-up</label>
                                            <p className="text-sm text-orange-600 mt-1">
                                                Required - Due: {call.remarks.followUpDate}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Callback Request */}
                        {call.callbackRequested && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BellIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                    <p className="text-sm text-yellow-800 font-medium">Callback Requested</p>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">This caller has requested a callback</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Incoming Calls</h1>
                        <p className="text-gray-600 mt-2">Monitor and analyze your incoming call activities</p>
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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PhoneArrowDownLeftIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Total Incoming</p>
                            <p className="text-lg font-bold text-gray-900">{stats.totalIncoming}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Answered</p>
                            <p className="text-lg font-bold text-gray-900">{stats.answered}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Missed</p>
                            <p className="text-lg font-bold text-gray-900">{stats.missed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Answer Rate</p>
                            <p className="text-lg font-bold text-gray-900">{stats.answerRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Avg Answer</p>
                            <p className="text-lg font-bold text-gray-900">{stats.avgAnswerTime}s</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Avg Duration</p>
                            <p className="text-lg font-bold text-gray-900">{Math.floor(stats.avgCallDuration / 60)}:{(stats.avgCallDuration % 60).toString().padStart(2, '0')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <BellIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Callbacks</p>
                            <p className="text-lg font-bold text-gray-900">{stats.callbacksRequired}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <UserIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Known</p>
                            <p className="text-lg font-bold text-gray-900">{stats.knownContacts}</p>
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
                            placeholder="Search incoming calls..."
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
                                    {option.label} ({option.count})
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
                    Showing {filteredCalls.length} of {incomingCalls.length} incoming calls
                </p>
            </div>

            {/* Incoming Calls Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCalls.map((call) => {
                            const StatusIcon = getStatusIcon(call.status);

                            return (
                                <tr key={call.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-blue-100">
                                                <PhoneArrowDownLeftIcon className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {call.contactName}
                                                    </span>
                                                    {call.isKnownContact && (
                                                        <UserIcon className="w-4 h-4 text-blue-500 ml-2" title="Known Contact" />
                                                    )}
                                                    {call.callbackRequested && (
                                                        <BellIcon className="w-4 h-4 text-orange-500 ml-2" title="Callback Requested" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{call.number}</div>
                                                <div className="text-xs text-gray-400">{call.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {call.status}
                                        </span>
                                        {call.satisfaction && (
                                            <div className="text-xs text-gray-500 mt-1 capitalize">
                                                {call.satisfaction.replace('_', ' ')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {call.answerTime ? `${call.answerTime}s` : 'N/A'}
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
                                        <div className="text-xs">{call.timestamp.toLocaleTimeString()}</div>
                                        <div className="text-xs text-gray-400">{formatTimestamp(call.timestamp)}</div>
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
                                            {(call.status === 'missed' || call.callbackRequested) && (
                                                <button
                                                    onClick={() => handleCallBack(call)}
                                                    className="inline-flex items-center px-3 py-1 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                                                >
                                                    <PhoneIcon className="w-4 h-4 mr-1" />
                                                    Call Back
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
                    <PhoneArrowDownLeftIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No incoming calls found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Incoming calls will appear here as they come in'
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

export default IncomingCallPage;