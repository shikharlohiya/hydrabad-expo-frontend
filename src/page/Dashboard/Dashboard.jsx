import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardPage from "./DashboardPage/DashboardPage";
import IncomingCallPage from "./IncomingCall/IncomingCallPage";
import NotFound from "../NotFound";
import OutgoingCallPage from "./OutgoingCall/OutgoingCallPage";
import ContactsPage from "./Contacts/ContactsPage";
import CallHistoryPage from "./CallHistory/CallHistoryPage";
import ProfilePage from "./Profile/ProfilePage";
import FollowUpPage from "./FollowUp/FollowUpPage";

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* Default dashboard route */}
        <Route index element={<DashboardPage />} />

        {/* Dashboard sub-routes */}
        <Route path="home" element={<DashboardPage />} />
        <Route path="incoming-call" element={<IncomingCallPage />} />
        <Route path="outgoing-call" element={<OutgoingCallPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="call-history" element={<CallHistoryPage />} />
        <Route path="follow-up" element={<FollowUpPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Add more dashboard routes here as needed */}
        {/* Example additional routes:
                <Route path="trades" element={<TradesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="reports" element={<ReportsPage />} />
                */}

        {/* Redirect /dashboard/dashboard to /dashboard */}
        <Route
          path="dashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 for dashboard sub-routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
