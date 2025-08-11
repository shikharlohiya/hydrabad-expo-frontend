import { useState, useEffect, useRef, useContext } from "react";
import AuthContext from "../AuthContext";
import UserContext from "../UserContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const logoutTimerRef = useRef(null);
  const { clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        handleLogout();
      } else {
        setIsAuthenticated(true);
        scheduleLogout(exp);
      }
    }
    // Cleanup on unmount
    return () => clearTimeout(logoutTimerRef.current);
  }, []);

  const scheduleLogout = (exp) => {
    const msUntilExpiry = exp * 1000 - Date.now();
    clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, msUntilExpiry);
  };

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);

    const { exp } = jwtDecode(token);
    scheduleLogout(exp);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clearUser();
    setIsAuthenticated(false);
    navigate("/"); // force redirect to login
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
