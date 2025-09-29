import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({
  isAuthenticated,
  children,
  allowedRoles = null, // Optional: array of allowed roles
  requiredRole = null, // Optional: specific required role
}) => {
  const location = useLocation();

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }


  // If no role restrictions, allow access
  if (!allowedRoles && !requiredRole) {
    return children;
  }

  // Get user role from stored user data
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userRole = userData.EmployeeRole;

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    // User doesn't have the required role
    if (userRole === 4) {
      return <Navigate to="/view-only" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User's role is not in the allowed roles list
    if (userRole === 4) {
      return <Navigate to="/view-only" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
