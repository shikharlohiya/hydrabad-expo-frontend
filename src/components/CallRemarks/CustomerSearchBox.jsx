import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';

const CustomerSearchBox = ({
    onSearch,
    isSearching,
    searchError,
    currentNumber,
    hasResults
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Auto-fill with current number when available
    useEffect(() => {
        if (currentNumber && !searchTerm) {
            setSearchTerm(currentNumber);
        }
    }, [currentNumber]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm);
            setShowDropdown(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setShowDropdown(true);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow for quick actions
        setTimeout(() => setShowDropdown(false), 200);
    };

    const getStatusIcon = () => {
        if (isSearching) {
            // return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
        }
        if (hasResults) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        if (searchError) {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
        return <Search className="w-4 h-4 text-gray-400" />;
    };

    const quickSearchOptions = [
        {
            type: 'Current Call',
            value: currentNumber || '', // Add fallback
            icon: '📞',
            disabled: !currentNumber // Add disabled state
        },
        { type: 'Customer ID', placeholder: 'ACC123456', icon: '🆔' },
        { type: 'Phone Number', placeholder: '+1234567890', icon: '📱' }
    ];

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="relative">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Search Customer ID or Phone..."
                            className={`w-64 px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F] transition-colors ${searchError
                                ? 'border-red-300 bg-red-50'
                                : hasResults
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 bg-white'
                                }`}
                            disabled={isSearching}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {getStatusIcon()}
                        </div>
                    </div>

                    {/* Search Dropdown */}
                    {showDropdown && !isSearching && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-2">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Quick Search
                                </div>
                                {quickSearchOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={option.disabled} // Add this
                                        onClick={() => {
                                            if (option.value && !option.disabled) { // Add !option.disabled check
                                                setSearchTerm(option.value);
                                                onSearch(option.value);
                                            } else if (!option.disabled) {
                                                setSearchTerm(option.placeholder);
                                            }
                                            setShowDropdown(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-2 py-2 text-sm text-left rounded transition-colors ${option.disabled
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-lg">{option.icon}</span>
                                        <div>
                                            <div className="font-medium text-gray-700">{option.type}</div>
                                            <div className="text-xs text-gray-500">
                                                {option.value || option.placeholder || 'No current call'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="px-4 py-2 bg-[#F68A1F] hover:bg-[#e5791c] text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Searching...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {searchError && (
                <div className="mt-1 p-2 text-sm text-red-700">
                    {searchError}
                </div>
            )}

            {/* Success Message */}
            {hasResults && !searchError && (
                <div className="mt-1 p-2 text-sm text-green-700 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Customer found and loaded</span>
                </div>
            )}
        </div>
    );
};

export default CustomerSearchBox;