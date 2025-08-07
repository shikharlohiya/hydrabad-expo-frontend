import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
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

        // Show a welcome message and navigate to the dashboard
        toast.success(
          `🎉 Welcome back, ${response.data.employee.EmployeeName}!`,
          {
            position: "top-right",
            autoClose: 1000,
            onClose: () => navigate("/dashboard"),
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
   * Allows users to submit the form by pressing the Enter key.
   * @param {React.KeyboardEvent} e - The keyboard event.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // --- JSX RENDER ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* =============================================================================== */}
      {/* MOBILE LAYOUT (Visible on small screens)                                        */}
      {/* A simple, centered card layout for a focused mobile experience.                 */}
      {/* =============================================================================== */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-sm border border-gray-200">
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src="/icon.png"
              alt="ib-logo"
              className="w-auto h-auto mx-auto mb-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/80x80/cccccc/ffffff?text=Logo";
              }}
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Traders Help Desk
            </h1>
            <p className="text-sm text-gray-500">Sign in to continue</p>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
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

            {/* Password Input */}
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
              className="w-full bg-[#F68A1F] text-white py-3 rounded-lg hover:bg-opacity-80 disabled:opacity-80 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md"
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

      {/* =============================================================================== */}
      {/* DESKTOP LAYOUT (Visible on large screens)                                       */}
      {/* A two-column layout separating branding from the login form.                    */}
      {/* =============================================================================== */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Section - Branding */}
        <div className="flex-1 bg-[#538FC2] flex items-center justify-center relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full"></div>
          </div>

          <div className="relative text-center text-white z-10 px-12">
            <img
              src="/icon.png"
              alt="ib-logo"
              className="w-96 h-auto mx-auto mb-6 drop-shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/192x192/ffffff/000000?text=Logo";
              }}
            />
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              Traders Help Desk
            </h1>
            <p className="text-xl opacity-90 leading-relaxed max-w-md mx-auto">
              Your centralized hub for support, insights, and trading tools.
            </p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    placeholder="Enter your Employee ID"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#F68A1F] text-white py-4 rounded-xl hover:bg-opacity-80 disabled:opacity-80 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
