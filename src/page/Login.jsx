import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../library/axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import UserContext from "../context/UserContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    // Validate inputs
    if (!username || !password) {
      toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/login", {
        EmployeeId: username,
        EmployeePassword: password,
      });

      // Check if login was successful
      if (
        response.data.status === "200" &&
        response.data.message === "Login successful"
      ) {
        // Store user data and token in localStorage
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.employee)
        );
        login(response.data.token); // Update context state
        setUser(response.data.employee); // Update user context

        // Show success toast with custom styling
        toast.success(
          `🎉 Welcome back, ${response.data.employee.EmployeeName}!`,
          {
            position: "top-right",
            autoClose: 1000,
            onClose: () => {
              // Navigate after toast closes
              navigate("/dashboard");
            },
          }
        );
      } else {
        toast.error(response.data.message || "Login failed", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error scenarios
      let errorMessage = "An error occurred during login";
      let errorIcon = "❌";

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = "Invalid credentials";
          errorIcon = "🔒";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid request format";
          errorIcon = "⚠️";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later";
          errorIcon = "🔧";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection";
        errorIcon = "🌐";
      }

      toast.error(`${errorIcon} ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-screen bg-[#538FC2]  "></div>
      </div>

      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/icon-512.png"
            alt="ib-logo"
            className="w-20 h-20 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Traders Help Desk
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your Employee ID"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#F68A1F] text-white py-3 rounded-lg hover:bg-[#F68A1F]/80 disabled:opacity-80 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
