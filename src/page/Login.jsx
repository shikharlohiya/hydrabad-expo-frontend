import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, User, Lock, Truck, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../library/axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import UserContext from "../context/UserContext";

export default function Login() {
  // --- STATE MANAGEMENT ---
  // State for user inputs, password visibility, and loading status
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // --- ROUTING & CONTEXT ---
  // Hooks for navigation and accessing global state
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);

  // --- LIFECYCLE HOOKS ---
  // Focus the username input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // --- EVENT HANDLERS ---
  /**
   * Handles the entire login process, from validation to API call and feedback.
   */
  const handleLogin = async () => {
    // 1. Validate inputs: Ensure fields are not empty
    if (!username || !password) {
      toast.error("Please fill in all fields", { position: "top-right" });
      return;
    }

    setLoading(true);

    // 2. API Call: Attempt to log the user in
    try {
      const response = await axiosInstance.post("/login", {
        EmployeeId: username,
        EmployeePassword: password,
      });

      // 3. Handle Success: If login is successful, store data and navigate
      if (
        response.data.status === "200" &&
        response.data.message === "Login successful"
      ) {
        // Store auth token and user data for session persistence
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.employee)
        );

        // Update global context
        login(response.data.token);
        setUser(response.data.employee);

        // Role-based navigation: Check if user has View Only role (roleId 4)
        const userRole = response.data.employee.EmployeeRole;

        if (userRole === 4) {
          // View Only role - redirect to full-screen view-only dashboard
          navigate("/view-only", { replace: true });
        } else {
          // Regular users - redirect to normal dashboard
          navigate("/dashboard", { replace: true });
        }

        // Show success toast with custom styling
        toast.success(
          `🎉 Welcome back, ${response.data.employee.EmployeeName}!`,
          {
            position: "top-right",
            autoClose: 2000,
          }
        );
      } else {
        // Handle cases where the API returns a non-error but unsuccessful login
        toast.error(response.data.message || "Login failed", {
          position: "top-right",
        });
      }
    } catch (error) {
      // 4. Handle Errors: Provide specific feedback for different error types
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login";
      let errorIcon = "❌";

      if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 401) {
          errorMessage = "Invalid credentials";
          errorIcon = "🔒";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later";
          errorIcon = "🔧";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error (e.g., no internet)
        errorMessage = "Network error. Please check your connection";
        errorIcon = "🌐";
      }

      toast.error(`${errorIcon} ${errorMessage}`, { position: "top-right" });
    } finally {
      // 5. Cleanup: Always stop the loading indicator
      setLoading(false);
    }
  };

  /**
   * Prevents default form submission and triggers the login logic.
   * @param {React.FormEvent} e - The form event.
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  // --- JSX RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* =============================================================================== */}
      {/* MOBILE LAYOUT (Visible on small screens)                                        */}
      {/* A simple, centered card layout for a focused mobile experience.                 */}
      {/* =============================================================================== */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-orange-100">
          {/* Decorative top accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-t-2xl"></div>

          {/* Header */}
          <div className="text-center mb-8 mt-2">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Truck className="w-10 h-10 text-orange-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
              Chicks Placement
            </h1>
            <p className="text-3xl font-extrabold text-gray-800 mb-1">CRM System</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Vehicle Management & Tracking
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your Employee ID"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          </form>
        </div>
      </div>

      {/* =============================================================================== */}
      {/* DESKTOP LAYOUT (Visible on large screens)                                       */}
      {/* A two-column layout separating branding from the login form.                    */}
      {/* =============================================================================== */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Section - Branding */}
        <div className="flex-1 bg-gradient-to-br from-amber-600 via-orange-600 to-orange-700 flex items-center justify-center relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 right-32 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-yellow-200 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-xl"></div>
          </div>

          {/* Animated decorative shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-yellow-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 right-1/2 w-2 h-2 bg-white rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="relative text-center text-white z-10 px-12 max-w-2xl">
            {/* Icon/Logo Section */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30">
                <Truck className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-6xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
              Chicks Placement
            </h1>
            <h2 className="text-4xl font-bold mb-6 text-yellow-100">
              CRM System
            </h2>
            <div className="h-1 w-32 bg-white/50 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl opacity-95 leading-relaxed max-w-lg mx-auto mb-4">
              Complete vehicle management solution for chicks placement operations
            </p>
            <div className="flex items-center justify-center gap-2 text-lg text-yellow-100">
              <MapPin className="w-5 h-5" />
              <span>Track • Manage • Deliver</span>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-8">
          <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md border-2 border-orange-100 relative overflow-hidden">
            {/* Decorative top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>

            {/* Form Header */}
            <div className="text-center mb-10">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-orange-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Employee ID
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all duration-200"
                    placeholder="Enter your Employee ID"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
