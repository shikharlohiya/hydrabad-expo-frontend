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

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
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
