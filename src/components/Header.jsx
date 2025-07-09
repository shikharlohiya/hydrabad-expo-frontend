import React from 'react';
import { FaRegBell } from "react-icons/fa";

const Header = ({ collapsed, setCollapsed }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-50">
            <div className="h-full flex items-center justify-between px-6">
                {/* Left side - Logo/Brand */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
                        aria-label="Toggle sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                            IB
                        </div>
                        <h1 className="text-xl font-semibold text-gray-800">Traders Dashboard</h1>
                    </div>
                </div>

                {/* Right side - User menu, notifications, etc. */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative">
                        <FaRegBell className='w-6 h-6' />
                        {/* Notification badge */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">JD</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">John Doe</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;