import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        to: '/dashboard/incoming-call',
        label: 'Incoming Calls',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        )
    },
    {
        to: '/dashboard/analytics',
        label: 'Analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        to: '/dashboard/settings',
        label: 'Settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
];

const Navbar = ({ collapsed, setCollapsed }) => {
    return (
        <nav
            className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative border-r border-slate-700/50
                ${collapsed ? 'w-16' : 'w-64'}
                h-full
                lg:h-[calc(100vh-4rem)]
            `}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center justify-center">
                    <div className={`flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                            </svg>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <span className="text-white font-bold text-lg whitespace-nowrap">
                                Traders
                            </span>
                            <div className="text-blue-300 text-xs font-medium">
                                Dashboard
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Section Header */}
            <div className={`px-4 pt-4 pb-2 transition-all duration-300 flex-shrink-0 ${collapsed ? 'opacity-0 h-0 py-0' : 'opacity-100 h-auto'}`}>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Menu
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-2 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent min-h-0">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `group flex items-center transition-all duration-200 rounded-xl mx-1 relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                } ${collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}`
                            }
                            end={item.to === '/dashboard'}
                        >
                            {/* Active indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-400 transition-all duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`} />

                            {/* Icon */}
                            <div className="flex-shrink-0 flex items-center justify-center">
                                {item.icon}
                            </div>

                            {/* Label */}
                            <div className={`overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
                                <span className="font-medium text-sm whitespace-nowrap">
                                    {item.label}
                                </span>
                            </div>

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-600">
                                    <div className="font-medium">{item.label}</div>
                                    {/* Tooltip arrow */}
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                                </div>
                            )}

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Collapse Toggle Button */}
            <div className="p-3 border-t border-slate-700/50 flex-shrink-0">
                <button
                    className={`w-full flex items-center justify-center p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group ${collapsed ? '' : 'hover:bg-slate-800/30'}`}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>

                    {/* Expand/Collapse text */}
                    <span className={`ml-2 text-sm font-medium transition-all duration-300 ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                        Collapse
                    </span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;