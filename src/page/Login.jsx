import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../library/axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            toast.error('Please fill in all fields', {
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
            const response = await axiosInstance.post('/login', {
                EmployeeId: username,
                EmployeePassword: password
            });

            // Check if login was successful
            if (response.data.status === "200" && response.data.message === "Login successful") {
                // Store user data and token in localStorage
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.employee));
                login(response.data.token); // Update context state
                setUser(response.data.employee); // Update user context

                // Show success toast with custom styling
                toast.success(`🎉 Welcome back, ${response.data.employee.EmployeeName}!`, {
                    position: "top-right",
                    autoClose: 1000,
                    onClose: () => {
                        // Navigate after toast closes
                        navigate('/dashboard');
                    }
                });

            } else {
                toast.error(response.data.message || 'Login failed', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle different error scenarios
            let errorMessage = 'An error occurred during login';
            let errorIcon = '❌';

            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    errorMessage = 'Invalid credentials';
                    errorIcon = '🔒';
                } else if (error.response.status === 400) {
                    errorMessage = 'Invalid request format';
                    errorIcon = '⚠️';
                } else if (error.response.status >= 500) {
                    errorMessage = 'Server error. Please try again later';
                    errorIcon = '🔧';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection';
                errorIcon = '🌐';
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
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[pulse_6s_infinite]"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[pulse_6s_infinite]"></div>
            </div>

            <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
                {/* Header */}
                <div className="text-center mb-6">
                    <img src="/icon-512.png" alt="ib-logo" className="w-16 h-16 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-sm text-gray-500">Sign in to continue</p>
                </div>

                <div className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="Enter your Employee ID"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-transform transform hover:scale-105 active:scale-95 shadow-md"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}