import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import AuthContext from "./context/AuthContext";

import Login from "./page/Login";
import NotFound from "./page/NotFound";
import Dashboard from "./page/Dashboard/Dashboard";
import ViewOnlyDashboard from "./page/Dashboard/ViewOnlyDashboard";
// import DialerProvider from "./context/Providers/DialerProvider";
import FormProvider from "./context/Providers/FormProvider";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Login />
              </PublicRoute>
            }
          />

          {/* Redirect /login to / for consistency */}
          <Route
            path="/login"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Login />
              </PublicRoute>
            }
          />

          {/* View Only Dashboard - Full Screen for Projector (Role 4 Only) */}
          <Route
            path="/view-only"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                requiredRole={4}
              >
                <ViewOnlyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard Routes (Exclude Role 4) */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                allowedRoles={[1, 2, 3]} // All roles except 4 (View Only)
              >
                {/* DialerProvider wraps only the dashboard since it needs Socket and Form contexts */}
                <FormProvider>
                  {/* <DialerProvider> */}
                  <Dashboard />
                  {/* </DialerProvider> */}
                </FormProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  );
}

export default App;
