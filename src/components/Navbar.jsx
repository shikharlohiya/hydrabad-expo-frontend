import React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { SlCallIn, SlCallOut } from "react-icons/sl";
import { GiHamburgerMenu } from "react-icons/gi";
import { LuContactRound } from "react-icons/lu";
import { RiHistoryLine } from "react-icons/ri";
import { GrUserSettings } from "react-icons/gr";
import { MdOutlinePersonSearch } from "react-icons/md";
import { FaUpload } from "react-icons/fa6";
import { FaDownload } from "react-icons/fa6";
import { MdPhoneMissed } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineAccessTime } from "react-icons/md";

// navItems with role restrictions
const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <IoHomeOutline className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/long-halt",
    label: "Long Halt Vehicles",
    icon: <MdOutlineAccessTime className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/user-settings",
    label: "User Settings",
    icon: <GrUserSettings className="w-5 h-5" />,
    roles: [3],
  },
  {
    to: "/dashboard/phone-book",
    label: "Phone Book",
    icon: <MdOutlinePersonSearch className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/whatsapp",
    label: "WhatsApp",
    icon: <FaWhatsapp className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/contacts",
    label: "Contacts",
    icon: <LuContactRound className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  // {
  //   to: "/dashboard/call-history",
  //   label: "Call History",
  //   icon: <RiHistoryLine className="w-5 h-5" />,
  //   roles: [1, 2, 3],
  // },
  {
    to: "/dashboard/incoming-call",
    label: "Incoming Calls",
    icon: <SlCallIn className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/outgoing-call",
    label: "Outgoing Calls",
    icon: <SlCallOut className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/missed-call",
    label: "Missed Calls",
    icon: <MdPhoneMissed className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
  {
    to: "/dashboard/bulk-upload",
    label: "Bulk Upload",
    icon: <FaUpload className="w-5 h-5" />,
    roles: [3],
  },
  {
    to: "/dashboard/download-report",
    label: "Download Report",
    icon: <FaDownload className="w-5 h-5" />,
    roles: [1, 2, 3],
  },
];

const Navbar = ({ collapsed, setCollapsed, EmployeeRoleId }) => {
  // Filter items based on role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(EmployeeRoleId)
  );

  return (
    <nav
      className={`bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative
                ${collapsed ? "w-16" : "w-64"}
                h-full
                lg:h-[calc(100vh-4rem)]
            `}
    >
      {/* Navigation Section Header with Collapse Button */}
      <div
        className={`px-4 pt-4 pb-3 transition-all duration-300 flex-shrink-0 border-b border-gray-700/50 ${
          collapsed ? "px-3" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-300 ${
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            }`}
          >
            Navigation
          </div>

          {/* Collapse/Expand Button */}
          <button
            className={`flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 group ${
              collapsed ? "w-full" : ""
            }`}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <GiHamburgerMenu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-2 py-4 overflow-y-auto scrollbar-hide min-h-0">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center transition-all duration-200 rounded-lg mx-1 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                } ${collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-3"}`
              }
              end={item.to === "/dashboard"}
            >
              {/* Icon */}
              <div className="flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </div>

              {/* Label */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                }`}
              >
                <span className="font-semibold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
