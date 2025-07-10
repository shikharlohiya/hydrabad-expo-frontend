import React from 'react';
import { User, Mail, Calendar, Activity, Shield, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const CustomerInfoPanel = ({ customerData, phoneNumber }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'text-green-600 bg-green-50';
            case 'Inactive':
                return 'text-red-600 bg-red-50';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getAccountTypeColor = (type) => {
        switch (type) {
            case 'Premium':
                return 'text-purple-600 bg-purple-50';
            case 'Standard':
                return 'text-blue-600 bg-blue-50';
            case 'Basic':
                return 'text-gray-600 bg-gray-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-4 space-y-6">
            {/* Customer Basic Info */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{customerData.name}</h4>
                        <p className="text-sm text-gray-500">Customer ID: {customerData.accountId}</p>
                    </div>
                </div>

                {/* Status and Account Type */}
                <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customerData.status)}`}>
                        {customerData.status === 'Active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {customerData.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(customerData.accountType)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {customerData.accountType}
                    </span>
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
                <h5 className="font-medium text-gray-900 text-sm">Contact Information</h5>
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{customerData.email}</span>
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="space-y-3">
                <h5 className="font-medium text-gray-900 text-sm">Account Information</h5>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Join Date</span>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{formatDate(customerData.joinDate)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Last Activity</span>
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{formatDate(customerData.lastActivity)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Calls</span>
                        <span className="text-sm font-medium text-gray-900">{customerData.totalCalls}</span>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
                <h5 className="font-medium text-gray-900 text-sm">Additional Information</h5>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                        Customer has been with us for {Math.floor((new Date() - new Date(customerData.joinDate)) / (1000 * 60 * 60 * 24 * 365))} years.
                        Recent activity shows regular platform usage.
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h5 className="font-medium text-gray-900 text-sm">Quick Actions</h5>
                <div className="space-y-2">
                    <button className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        View Full Profile
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        Send Email
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                        Schedule Follow-up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerInfoPanel;