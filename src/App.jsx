import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import NotFound from "./page/NotFound";
import Dashboard from "./page/Dashboard/Dashboard";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
