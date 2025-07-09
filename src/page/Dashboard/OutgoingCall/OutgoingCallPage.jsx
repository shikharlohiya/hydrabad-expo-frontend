import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    PhoneArrowUpRightIcon,
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
    ArrowTrendingDownIcon,
    PlusIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useDialer from '../../../hooks/useDialer';

const OutgoingCallPage = () => {
    const { formatDuration, initiateCall } = useDialer();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPurpose, setSelectedPurpose] = useState('all');
    const [dateRange, setDateRange] = useState('today');
    const [selectedCall, setSelectedCall] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Mock outgoing calls data
    const outgoingCalls = [
        {
            id: 1,
            number: '+91 98765 43210',
            contactName: 'Rajesh Kumar',
            status: 'completed',
            duration: 456, // 7.6 minutes
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            connectionTime: 15, // seconds to connect
            purpose: 'Follow-up',
            priority: 'High',
            outcome: 'Successful',
            location: 'Mumbai, Maharashtra',
            attempts: 1,
            isScheduled: false,
            satisfaction: 'satisfied',
            isKnownContact: true,
            tags: ['Follow-up Call', 'Issue Resolved'],
            remarks: {
                description: 'Follow-up call regarding trading platform login issue reported yesterday',
                resolution: 'Confirmed issue is resolved. Customer satisfied with solution.',
                nextAction: 'Monitor account for any further issues',
                followUpRequired: false
            }
        },
        {
            id: 2,
            number: '+91 87654 32109',
            contactName: 'Priya Sharma',
            status: 'completed',
            duration: 289,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            connectionTime: 8,
            purpose: 'Sales Call',
            priority: 'Medium',
            outcome: 'Interested',
            location: 'Delhi, Delhi',
            attempts: 1,
            isScheduled: true,
            satisfaction: 'very_satisfied',
            isKnownContact: true,
            tags: ['Sales Lead', 'Premium Interest', 'Scheduled'],
            remarks: {
                description: 'Scheduled sales call to discuss premium account features',
                resolution: 'Customer showed strong interest in premium features',
                nextAction: 'Send premium account brochure and schedule demo',
                followUpRequired: true,
                followUpDate: '2024-12-23'
            }
        },
        {
            id: 3,
            number: '+91 76543 21098',
            contactName: 'Unknown Number',
            status: 'no_answer',
            duration: 0,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            connectionTime: null,
            purpose: 'Cold Call',
            priority: 'Low',
            outcome: 'No Response',
            location: 'Pune, Maharashtra',
            attempts: 2,
            isScheduled: false,
            satisfaction: null,
            isKnownContact: false,
            tags: ['Cold Call', 'No Answer', 'Retry Needed'],
            remarks: null
        },
        {
            id: 4,
            number: '+91 65432 10987',
            contactName: 'Amit Patel',
            status: 'busy',
            duration: 0,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            connectionTime: null,
            purpose: 'Customer Service',
            priority: 'High',
            outcome: 'Busy',
            location: 'Ahmedabad, Gujarat',
            attempts: 1,
            isScheduled: false,
            satisfaction: null,
            isKnownContact: true,
            tags: ['Customer Service', 'Busy', 'Callback Needed'],
            remarks: {
                description: 'Calling to address billing inquiry raised by customer',
                nextAction: 'Schedule callback at convenient time'
            }
        },
        {
            id: 5,
            number: '+91 54321 09876',
            contactName: 'Sneha Reddy',
            status: 'failed',
            duration: 0,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            connectionTime: null,
            purpose: 'Follow-up',
            priority: 'Medium',
            outcome: 'Failed',
            location: 'Bangalore, Karnataka',
            attempts: 3,
            isScheduled: false,
            satisfaction: null,
            isKnownContact: true,
            tags: ['Multiple Attempts', 'Network Issue'],
            remarks: {
                description: 'Follow-up call regarding account verification documents',
                nextAction: 'Try alternative contact method or schedule different time'
            }
        },
        {
            id: 6,
            number: '+91 43210 98765',
            contactName: 'Vikram Singh',
            status: 'completed',
            duration: 672, // 11.2 minutes
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            connectionTime: 12,
            purpose: 'Account Review',
            priority: 'Medium',
            outcome: 'Successful',
            location: 'Jaipur, Rajasthan',
            attempts: 1,
            isScheduled: true,
            satisfaction: 'very_satisfied',
            isKnownContact: true,
            tags: ['Account Review', 'Partnership', 'Scheduled'],
            remarks: {
                description: 'Scheduled quarterly account review with business partner',
                resolution: 'Reviewed portfolio performance and discussed expansion opportunities',
                nextAction: 'Prepare proposal for new investment products',
                followUpRequired: true,
                followUpDate: '2024-12-28'
            }
        }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status', count: outgoingCalls.length },
        { value: 'completed', label: 'Completed', count: outgoingCalls.filter(c => c.status === 'completed').length },
        { value: 'no_answer', label: 'No Answer', count: outgoingCalls.filter(c => c.status === 'no_answer').length },
        { value: 'busy', label: 'Busy', count: outgoingCalls.filter(c => c.status === 'busy').length },
        { value: 'failed', label: 'Failed', count: outgoingCalls.filter(c => c.status === 'failed').length }
    ];

    const purposeOptions = [
        { value: 'all', label: 'All Purposes' },
        { value: 'Sales Call', label: 'Sales Call' },
        { value: 'Follow-up', label: 'Follow-up' },
        { value: 'Customer Service', label: 'Customer Service' },
        { value: 'Account Review', label: 'Account Review' },
        { value: 'Cold Call', label: 'Cold Call' }
    ];

    const dateOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' }
    ];

    const filteredCalls = outgoingCalls.filter(call => {
        const matchesSearch = call.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.number.includes(searchTerm) ||
            call.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
        const matchesPurpose = selectedPurpose === 'all' || call.purpose === selectedPurpose;
        return matchesSearch && matchesStatus && matchesPurpose;
    });

    // Calculate statistics
    const stats = {
        totalOutgoing: outgoingCalls.length,
        completed: outgoingCalls.filter(c => c.status === 'completed').length,
        noAnswer: outgoingCalls.filter(c => c.status === 'no_answer').length,
        busy: outgoingCalls.filter(c => c.status === 'busy').length,
        failed: outgoingCalls.filter(c => c.status === 'failed').length,
        avgConnectionTime: Math.round(
            outgoingCalls
                .filter(c => c.connectionTime !== null)
                .reduce((sum, c) => sum + c.connectionTime, 0) /
            outgoingCalls.filter(c => c.connectionTime !== null).length
        ),
        successRate: Math.round((outgoingCalls.filter(c => c.status === 'completed').length / outgoingCalls.length) * 100),
        avgCallDuration: Math.round(
            outgoingCalls
                .filter(c => c.duration > 0)
                .reduce((sum, c) => sum + c.duration, 0) /
            outgoingCalls.filter(c => c.duration > 0).length
        ),
        scheduledCalls: outgoingCalls.filter(c => c.isScheduled).length,
        totalAttempts: outgoingCalls.reduce((sum, c) => sum + c.attempts, 0)
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return CheckCircleIcon;
            case 'no_answer': return ExclamationTriangleIcon;
            case 'busy': return ClockIcon;
            case 'failed': return XCircleIcon;
            default: return ClockIcon;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'no_answer': return 'text-yellow-600 bg-yellow-100';
            case 'busy': return 'text-orange-600 bg-orange-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getOutcomeColor = (outcome) => {
        switch (outcome) {
            case 'Successful': return 'bg-green-100 text-green-800';
            case 'Interested': return 'bg-blue-100 text-blue-800';
            case 'No Response': return 'bg-yellow-100 text-yellow-800';
            case 'Busy': return 'bg-orange-100 text-orange-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const handleCallAgain = (call) => {
        initiateCall(call.number, {
            name: call.contactName,
            purpose: call.purpose
        });
    };

    const CallDetailsModal = ({ call, onClose }) => {
        if (!call) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Outgoing Call Details</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Call Info Header */}
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <PhoneArrowUpRightIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{call.contactName}</h3>
                                <p className="text-gray-600">{call.number}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                        {call.status.replace('_', ' ')}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(call.outcome)}`}>
                                        {call.outcome}
                                    </span>
                                    {call.isScheduled && (
                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                            <CalendarIcon className="w-3 h-3 mr-1" />
                                            Scheduled
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Call Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
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
                                        <p className="text-sm text-gray-600">Connection Time</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {call.connectionTime ? `${call.connectionTime}s` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Attempts</p>
                                        <p className="text-lg font-semibold text-gray-900">{call.attempts}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time Called</label>
                                <p className="text-sm text-gray-900">{call.timestamp.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{formatTimestamp(call.timestamp)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <p className="text-sm text-gray-900">{call.location}</p>
                            </div>
                        </div>

                        {/* Purpose and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Call Purpose</label>
                                <p className="text-sm text-gray-900">{call.purpose}</p>
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
                                    {call.remarks.nextAction && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Next Action</label>
                                            <p className="text-sm text-gray-900 mt-1">{call.remarks.nextAction}</p>
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

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleCallAgain(call)}
                                className="flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                            >
                                <PhoneIcon className="w-4 h-4 mr-2" />
                                Call Again
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                Add Note
                            </button>
                            {call.status !== 'completed' && (
                                <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Schedule Retry
                                </button>
                            )}
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
                        <h1 className="text-3xl font-bold text-gray-900">Outgoing Calls</h1>
                        <p className="text-gray-600 mt-2">Track and analyze your outbound call activities</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Export
                        </button>
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Call
                        </button>
                        <button className="flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors">
                            <ChartBarIcon className="w-5 h-5 mr-2" />
                            Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-4 mb-8">
                <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <PhoneArrowUpRightIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Total Outgoing</p>
                            <p className="text-lg font-bold text-gray-900">{stats.totalOutgoing}</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Completed</p>
                            <p className="text-lg font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Success Rate</p>
                            <p className="text-lg font-bold text-gray-900">{stats.successRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Avg Connection</p>
                            <p className="text-lg font-bold text-gray-900">{stats.avgConnectionTime}s</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
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
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search outgoing calls..."
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
                            value={selectedPurpose}
                            onChange={(e) => setSelectedPurpose(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        >
                            {purposeOptions.map(option => (
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
                    Showing {filteredCalls.length} of {outgoingCalls.length} outgoing calls
                </p>
            </div>

            {/* Outgoing Calls Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Outcome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection</th>
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
                                            <div className="p-2 rounded-full bg-green-100">
                                                <PhoneArrowUpRightIcon className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {call.contactName}
                                                    </span>
                                                    {call.isKnownContact && (
                                                        <UserIcon className="w-4 h-4 text-blue-500 ml-2" title="Known Contact" />
                                                    )}
                                                    {call.isScheduled && (
                                                        <CalendarIcon className="w-4 h-4 text-purple-500 ml-2" title="Scheduled Call" />
                                                    )}
                                                    {call.attempts > 1 && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                                            {call.attempts} attempts
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{call.number}</div>
                                                <div className="text-xs text-gray-400">{call.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {call.status.replace('_', ' ')}
                                            </span>
                                            <div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(call.outcome)}`}>
                                                    {call.outcome}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                                        {call.satisfaction && (
                                            <div className="text-xs text-gray-500 mt-1 capitalize">
                                                {call.satisfaction.replace('_', ' ')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">{call.purpose}</div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(call.priority)}`}>
                                                {call.priority}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {call.connectionTime ? `${call.connectionTime}s` : 'N/A'}
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
                                            <button
                                                onClick={() => handleCallAgain(call)}
                                                className="inline-flex items-center px-3 py-1 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                                            >
                                                <PhoneIcon className="w-4 h-4 mr-1" />
                                                {call.status === 'completed' ? 'Call Again' : 'Retry'}
                                            </button>
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
                    <PhoneArrowUpRightIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No outgoing calls found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedStatus !== 'all' || selectedPurpose !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Your outbound calls will appear here'
                        }
                    </p>
                    <button className="inline-flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Make New Call
                    </button>
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

export default OutgoingCallPage;