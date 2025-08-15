// Constants
export const ADMIN_ROLE_ID = 3;
export const TRADER_ROLE_ID = 1;
export const MANAGER_ROLE_ID = 2;

export const INITIAL_EMPLOYEE_STATE = {
  EmployeeId: "",
  EmployeePhone: "",
  EmployeeName: "",
  EmployeeRoleID: "",
  EmployeeRegion: "",
};

export const ROLE_CONFIG = {
  [TRADER_ROLE_ID]: {
    name: "Trader",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: "FaChartBar",
  },
  [MANAGER_ROLE_ID]: {
    name: "Manager",
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    badgeColor: "bg-purple-100 text-purple-800",
    icon: "FaUserTie",
  },
  [ADMIN_ROLE_ID]: {
    name: "Admin",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    badgeColor: "bg-green-100 text-green-800",
    icon: "FaUser",
  },
};
