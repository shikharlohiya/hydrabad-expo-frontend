import React, { useState } from 'react';
import {
    PhoneIcon,
    PhoneArrowUpRightIcon,
    PhoneArrowDownLeftIcon,
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import useDialer from '../../../hooks/useDialer';

const DashboardPage = () => {
    const { callHistory, formatDuration } = useDialer();
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for demonstration
    const callStats = {
        totalCalls: 127,
        answeredCalls: 98,
        missedCalls: 29,
        avgCallDuration: '4:32',
        totalTalkTime: '8h 45m',
        pendingFollowUps: 12
    };

    const recentCalls = [
        { id: 1, number: '+91 98765 43210', name: 'Rajesh Kumar', type: 'incoming', status: 'completed', duration: '5:23', time: '2 hours ago', category: 'Technical Support' },
        { id: 2, number: '+91 87654 32109', name: 'Priya Sharma', type: 'outgoing', status: 'completed', duration: '3:45', time: '4 hours ago', category: 'Sales Inquiry' },
        { id: 3, number: '+91 76543 21098', name: 'Unknown', type: 'incoming', status: 'missed', duration: '0:00', time: '6 hours ago', category: 'General' },
        { id: 4, number: '+91 65432 10987', name: 'Amit Patel', type: 'outgoing', status: 'completed', duration: '7:12', time: '1 day ago', category: 'Billing Issue' },
        { id: 5, number: '+91 54321 09876', name: 'Sneha Reddy', type: 'incoming', status: 'completed', duration: '2:34', time: '1 day ago', category: 'Account Management' }
    ];

    const followUps = [
        { id: 1, customerName: 'Rajesh Kumar', number: '+91 98765 43210', followUpDate: '2024-12-20', priority: 'High', issue: 'Trading platform login issue' },
        { id: 2, customerName: 'Priya Sharma', number: '+91 87654 32109', followUpDate: '2024-12-21', priority: 'Medium', issue: 'Account verification documents' },
        { id: 3, customerName: 'Amit Patel', number: '+91 65432 10987', followUpDate: '2024-12-22', priority: 'Low', issue: 'Fee structure inquiry' }
    ];

    const getCallTypeIcon = (type) => {
        return type === 'incoming' ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'missed': return 'text-red-600';
            case 'failed': return 'text-gray-600';
            default: return 'text-gray-600';
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Call Dashboard</h1>
                <p className="text-gray-600 mt-2">Monitor your call activities and customer interactions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PhoneIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Calls</p>
                            <p className="text-2xl font-bold text-gray-900">{callStats.totalCalls}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Answered</p>
                            <p className="text-2xl font-bold text-gray-900">{callStats.answeredCalls}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Missed</p>
                            <p className="text-2xl font-bold text-gray-900">{callStats.missedCalls}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{callStats.avgCallDuration}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Talk Time</p>
                            <p className="text-2xl font-bold text-gray-900">{callStats.totalTalkTime}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <UserGroupIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Follow-ups</p>
                            <p className="text-2xl font-bold text-gray-900">{callStats.pendingFollowUps}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Calls */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Calls</h2>
                                <div className="flex items-center space-x-3">
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                    <button className="p-2 text-gray-400 hover:text-gray-600">
                                        <FunnelIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mt-4 relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search calls by name or number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentCalls.map((call) => {
                                        const CallIcon = getCallTypeIcon(call.type);
                                        return (
                                            <tr key={call.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`p-2 rounded-full ${call.type === 'incoming' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                            <CallIcon className={`w-4 h-4 ${call.type === 'incoming' ? 'text-blue-600' : 'text-green-600'}`} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{call.name}</div>
                                                            <div className="text-sm text-gray-500">{call.number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)} bg-opacity-10`}>
                                                        {call.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {call.duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {call.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {call.time}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Pending Follow-ups */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Pending Follow-ups</h3>
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {followUps.map((followUp) => (
                                <div key={followUp.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">{followUp.customerName}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{followUp.number}</p>
                                            <p className="text-sm text-gray-600 mt-2">{followUp.issue}</p>
                                            <p className="text-xs text-gray-500 mt-2">Due: {followUp.followUpDate}</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(followUp.priority)}`}>
                                            {followUp.priority}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;