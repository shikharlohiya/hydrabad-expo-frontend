import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardPage from "./DashboardPage/DashboardPage";
import IncomingCallPage from "./IncomingCall/IncomingCallPage";
import NotFound from "../NotFound";

const Dashboard = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardLayout />}>
                {/* Default dashboard route */}
                <Route index element={<DashboardPage />} />

                {/* Dashboard sub-routes */}
                <Route path="home" element={<DashboardPage />} />
                <Route path="incoming-call" element={<IncomingCallPage />} />

                {/* Add more dashboard routes here as needed */}
                {/* Example additional routes:
                <Route path="trades" element={<TradesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="reports" element={<ReportsPage />} />
                */}

                {/* Redirect /dashboard/dashboard to /dashboard */}
                <Route path="dashboard" element={<Navigate to="/dashboard" replace />} />

                {/* 404 for dashboard sub-routes */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default Dashboard;