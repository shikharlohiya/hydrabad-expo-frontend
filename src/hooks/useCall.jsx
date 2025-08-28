import { useState } from "react";
import axiosInstance from "../library/axios";

export const useCall = () => {
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [userData] = useState(() => {
    return JSON.parse(localStorage.getItem("userData")) || {};
  });

  const initiateCall = async (phoneNumber) => {
    setIsInitiatingCall(true);
    try {
      const response = await axiosInstance.post("/initiate-call", {
        destination_number: phoneNumber,
        agent_number: userData.EmployeePhone,
      });
      // Call will be handled automatically by socket events
      return response.data;
    } catch (error) {
      console.error("Call initiation failed:", error);
      throw error;
    } finally {
      setIsInitiatingCall(false);
    }
  };

  return { initiateCall, isInitiatingCall };
};
