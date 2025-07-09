import { useContext, useState, useRef, useEffect } from 'react';
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdDialpad } from "react-icons/md";
import { PhoneXMarkIcon, MicrophoneIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import AuthContext from '../context/AuthContext';
import useDialer from '../hooks/useDialer';
import { CALL_STATUS } from '../context/Providers/DialerProvider';
import DialerPanel from '../components/Dialer/DialerPanel';

const Header = ({ collapsed, setCollapsed }) => {
    const { userData, clearUser } = useContext(UserContext);
    const { logout } = useContext(AuthContext);
    const {
        callStatus,
        currentNumber,
        callDuration,
        isCallActive,
        formatDuration,
        getStatusColor,
        getStatusBgColor,
        endCall,
        toggleMute,
        toggleHold,
        isMuted,
        isOnHold
    } = useDialer();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDialerOpen, setIsDialerOpen] = useState(false);
    const menuRef = useRef(null);
    const dialerContainerRef = useRef(null);

    const navigate = useNavigate();

    // Simplified click outside detection - only for user menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Separate click outside detection for dialer
    useEffect(() => {
        const handleDialerClickOutside = (event) => {
            if (dialerContainerRef.current && !dialerContainerRef.current.contains(event.target)) {
                setIsDialerOpen(false);
            }
        };

        if (isDialerOpen) {
            // Small delay to prevent immediate closing
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleDialerClickOutside);
            }, 100);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleDialerClickOutside);
            };
        }
    }, [isDialerOpen]);

    // Auto-open dialer for incoming calls
    useEffect(() => {
        if (callStatus === CALL_STATUS.RINGING) {
            setIsDialerOpen(true);
        }
    }, [callStatus]);

    // Function to get initials from name
    const getInitials = (name) => {
        if (!name) return 'JD';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Function to get role name
    const getRoleName = (roleId) => {
        const roles = {
            1: 'ABIS Trader',
        };
        return roles[roleId] || 'User';
    };

    const handleMenuItemClick = (action) => {
        setIsMenuOpen(false);
        switch (action) {
            case 'profile':
                navigate('/dashboard/profile');
                break;
            case 'logout':
                clearUser();
                logout();
                navigate('/');
                break;
            default:
                break;
        }
    };

    const toggleDialer = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDialerOpen(!isDialerOpen);
    };

    const closeDialer = () => {
        setIsDialerOpen(false);
    };

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
                        <div className="w-8 h-8 bg-[#F68A1F] rounded-lg flex items-center justify-center text-white font-bold">
                            IB
                        </div>
                        <h1 className="text-xl font-semibold text-gray-800">Trader Help Desk</h1>
                    </div>
                </div>

                {/* Right side - Call Status, Dialer, User menu */}
                <div className="flex items-center space-x-4">
                    {/* Call Status Display - Shows when call is active */}
                    {isCallActive() && (
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className={`w-2 h-2 rounded-full ${getStatusBgColor()}`}></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800">
                                        {currentNumber}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-medium capitalize ${getStatusColor()}`}>
                                            {callStatus}
                                        </span>
                                        {callStatus === CALL_STATUS.CONNECTED && (
                                            <span className="text-xs text-gray-500">
                                                {formatDuration(callDuration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Call Controls */}
                            {!isDialerOpen && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={toggleMute}
                                        className={`p-2 rounded-full transition-colors ${isMuted
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        title={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        <MicrophoneIcon className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={toggleHold}
                                        className={`p-2 rounded-full transition-colors ${isOnHold
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        title={isOnHold ? 'Resume' : 'Hold'}
                                    >
                                        {isOnHold ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={endCall}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
                                        title="End Call"
                                    >
                                        <PhoneXMarkIcon className="w-4 h-4" />
                                        <span>End Call</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dialer Button */}
                    <div className="relative" ref={dialerContainerRef}>
                        <button
                            onClick={toggleDialer}
                            className={`
                                relative p-2 rounded-full transition-all duration-200
                                ${isCallActive()
                                    ? `${getStatusBgColor().replace('bg-', 'bg-')} text-white shadow-md`
                                    : 'bg-[#F68A1F] hover:bg-[#e5791c] text-white shadow-md'
                                }
                            `}
                            title={isCallActive() ? `Call ${callStatus}` : 'Open Dialer'}
                        >
                            <MdDialpad className="w-5 h-5" />

                            {/* Active call indicator dot */}
                            {isCallActive() && (
                                <div className="absolute -top-1 -right-1">
                                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                                </div>
                            )}
                        </button>

                        {/* Dialer Panel - Positioned to align with right edge of screen */}
                        {isDialerOpen && (
                            <div className="absolute top-full -right-56 mt-2 z-50">
                                <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
                                    <DialerPanel onClose={closeDialer} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-sm font-semibold text-white">
                                    {getInitials(userData?.EmployeeName)}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <span className="text-sm font-medium text-gray-700">
                                    {userData?.EmployeeName}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5 block">
                                    {getRoleName(userData?.EmployeeRole)}
                                </span>
                            </div>

                            <IoIosArrowDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                {/* User Info Section */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-sm font-semibold text-white">
                                                {getInitials(userData?.EmployeeName)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {userData?.EmployeeName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {userData?.EmployeeMailId}
                                            </p>
                                            <p className="text-xs text-gray-800 font-medium">
                                                ID: {userData?.EmployeeId}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => handleMenuItemClick('profile')}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaUserCircle className="w-4 h-4 text-gray-500" />
                                        <span>View Profile</span>
                                    </button>
                                </div>

                                {/* Logout Section */}
                                <div className="border-t border-gray-100 pt-2">
                                    <button
                                        onClick={() => handleMenuItemClick('logout')}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaSignOutAlt className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;