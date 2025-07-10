import React, { useState, useEffect } from 'react';
import useDialer from '../../hooks/useDialer';
import { CALL_STATUS } from '../../context/Providers/DialerProvider';
import CallRemarksForm from './CallRemarksForm';
import CustomerInfoPanel from './CustomerInfoPanel';
import CustomerCallHistory from './CustomerCallHistory';
import CustomerSearchBox from './CustomerSearchBox';
import { ChevronRight } from 'lucide-react';

const CallRemarksPage = () => {
    const {
        callStatus,
        currentNumber,
        handleRemarksSubmit,
        handleRemarksCancel,
        currentCallDetails
    } = useDialer();

    const [showCustomerPanel, setShowCustomerPanel] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    // Customer search states
    const [customerData, setCustomerData] = useState(null);
    const [callHistory, setCallHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const isCallEnded = callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED;

    // Mock customer database - replace with actual API
    const mockCustomerDatabase = {
        'ACC123456': {
            name: 'John Doe',
            email: 'john.doe@example.com',
            accountId: 'ACC123456',
            phoneNumber: '+1234567890',
            joinDate: '2023-01-15',
            lastActivity: '2024-12-20',
            accountType: 'Premium',
            totalCalls: 12,
            status: 'Active'
        },
        '+1234567890': {
            name: 'John Doe',
            email: 'john.doe@example.com',
            accountId: 'ACC123456',
            phoneNumber: '+1234567890',
            joinDate: '2023-01-15',
            lastActivity: '2024-12-20',
            accountType: 'Premium',
            totalCalls: 12,
            status: 'Active'
        },
        'ACC789012': {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            accountId: 'ACC789012',
            phoneNumber: '+1987654321',
            joinDate: '2022-06-10',
            lastActivity: '2024-12-18',
            accountType: 'Standard',
            totalCalls: 8,
            status: 'Active'
        },
        '+1987654321': {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            accountId: 'ACC789012',
            phoneNumber: '+1987654321',
            joinDate: '2022-06-10',
            lastActivity: '2024-12-18',
            accountType: 'Standard',
            totalCalls: 8,
            status: 'Active'
        }
    };

    const mockCallHistoryDatabase = {
        'ACC123456': [
            {
                id: 1,
                date: '2024-12-18',
                time: '14:30',
                duration: '12:45',
                type: 'support',
                category: 'technical',
                priority: 'high',
                resolution: 'Issue resolved - password reset',
                satisfaction: 'satisfied',
                agent: 'Agent Smith'
            },
            {
                id: 2,
                date: '2024-12-10',
                time: '10:15',
                duration: '8:22',
                type: 'billing',
                category: 'payment',
                priority: 'medium',
                resolution: 'Payment processed successfully',
                satisfaction: 'very_satisfied',
                agent: 'Agent Johnson'
            }
        ],
        'ACC789012': [
            {
                id: 3,
                date: '2024-12-15',
                time: '16:45',
                duration: '15:33',
                type: 'sales',
                category: 'account',
                priority: 'low',
                resolution: 'Account upgrade completed',
                satisfaction: 'satisfied',
                agent: 'Agent Williams'
            }
        ]
    };

    // Auto-search when component mounts with current number
    useEffect(() => {
        if (currentNumber && !hasSearched) {
            handleCustomerSearch(currentNumber);
        }
    }, [currentNumber, hasSearched]);

    // API call simulation - replace with actual API
    const searchCustomerAPI = async (searchTerm) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const customer = mockCustomerDatabase[searchTerm];
                const history = customer ? mockCallHistoryDatabase[customer.accountId] || [] : [];
                resolve({ customer, history });
            }, 1000); // Simulate API delay
        });
    };

    const handleCustomerSearch = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSearchError('Please enter a customer ID or phone number');
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setHasSearched(true);

        try {
            const { customer, history } = await searchCustomerAPI(searchTerm.trim());

            if (customer) {
                setCustomerData(customer);
                setCallHistory(history);
                setShowCustomerPanel(true);
                setSearchError(null);
            } else {
                setCustomerData(null);
                setCallHistory([]);
                setSearchError('Customer not found. Please check the ID or phone number.');
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Search failed. Please try again.');
            setCustomerData(null);
            setCallHistory([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (formData) => {
        if (isSubmitted || isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        setSubmissionError(null);
        try {
            // Include customer data in the submission if available
            const submissionData = {
                ...formData,
                customerData: customerData,
                submittedAt: new Date()
            };
            await handleRemarksSubmit(submissionData);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionError('Failed to submit form. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleCancel = (hasFormData) => {
        if (hasFormData) {
            if (window.confirm('Are you sure you want to cancel? All form data will be lost.')) {
                handleRemarksCancel();
            }
        } else {
            handleRemarksCancel();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${showCustomerPanel ? 'mr-[450px]' : ''}`}>
                <div className="p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto h-full">
                        <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800">Call Remarks & Details</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {isSubmitted
                                            ? "Form submitted successfully!"
                                            : isCallEnded
                                                ? "Call has ended. Please complete the remarks form to continue."
                                                : "Please fill out the call details and remarks."
                                        }
                                    </p>
                                    {isCallEnded && !isSubmitted && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                📞 Call disconnected - Form data will be saved once submitted
                                            </p>
                                        </div>
                                    )}
                                    {submissionError && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                ❌ {submissionError}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Customer Search Box */}
                                <div className="ml-4">
                                    <CustomerSearchBox
                                        onSearch={handleCustomerSearch}
                                        isSearching={isSearching}
                                        searchError={searchError}
                                        currentNumber={currentNumber}
                                        hasResults={customerData !== null}
                                    />
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto">
                                {isSubmitted ? (
                                    <div className="p-6 text-center justify-center flex items-center h-full">
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Form Submitted Successfully!</h3>
                                            <p className="text-sm text-gray-600 mb-6">
                                                Your call remarks have been saved. You will be redirected to the dashboard after the call ends.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <CallRemarksForm
                                        currentNumber={currentNumber}
                                        currentCallDetails={currentCallDetails}
                                        customerData={customerData}
                                        onSubmit={handleSubmit}
                                        onCancel={handleCancel}
                                        isSubmitting={isSubmitting}
                                        isCallEnded={isCallEnded}
                                        submissionError={submissionError}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Info Sliding Panel */}
            <div className={`fixed top-16 right-0 bottom-0 w-[450px] bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${showCustomerPanel ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
                            <button
                                onClick={() => setShowCustomerPanel(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'info'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Customer Info
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Call History
                            </button>
                        </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto">
                        {customerData ? (
                            activeTab === 'info' ? (
                                <CustomerInfoPanel
                                    customerData={customerData}
                                    phoneNumber={currentNumber}
                                />
                            ) : (
                                <CustomerCallHistory
                                    callHistory={callHistory}
                                    phoneNumber={currentNumber}
                                />
                            )
                        ) : (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-sm">
                                    {hasSearched ? 'No customer data found' : 'Search for customer information to view details'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallRemarksPage;