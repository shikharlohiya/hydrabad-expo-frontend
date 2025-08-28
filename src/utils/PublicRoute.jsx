import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, isAuthenticated }) => {
    if (isAuthenticated) {
        // Always redirect to dashboard after login, regardless of previous location
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;