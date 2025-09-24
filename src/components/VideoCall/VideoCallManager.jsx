import React, { useState, useContext } from "react";
import VideoCallButton from "./VideoCallButton";
import UserContext from "../../context/UserContext";

const VideoCallManager = ({ customerData, phoneNumber }) => {
  const { userData } = useContext(UserContext);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallLink, setVideoCallLink] = useState("");
  const [roomName, setRoomName] = useState("");

  // Generate unique room name based on call details
  const generateRoomName = () => {
    const timestamp = Date.now();
    const customerPhone = phoneNumber?.replace(/\D/g, '') || 'unknown';
    const agentId = userData?.EmployeeId || 'agent';
    return `trader-support-${agentId}-${customerPhone}-${timestamp}`;
  };

  // Generate video call link
  const generateVideoCallLink = (room) => {
    return `https://meet.jit.si/${room}?config.disableDeepLinking=true&config.prejoinPageEnabled=false`;
  };

  const handleStartVideoCall = () => {
    const room = generateRoomName();
    const link = generateVideoCallLink(room);

    setRoomName(room);
    setVideoCallLink(link);
    setIsVideoCallActive(true);

    console.log('📹 Starting video call:', {
      room,
      link,
      customer: customerData?.name,
      agent: userData?.EmployeeName || userData?.EmployeeId
    });
  };

  const handleCloseVideoCall = () => {
    setIsVideoCallActive(false);
    setVideoCallLink("");
    setRoomName("");

    console.log('📹 Video call ended');
  };

  const getCustomerName = () => {
    return customerData?.name ||
           customerData?.Contact_Name ||
           customerData?.Trader_Name ||
           'Customer';
  };

  const getAgentName = () => {
    return userData?.EmployeeName ||
           userData?.EmployeeId ||
           'Agent';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Video Call Interface */}
      <VideoCallButton
        onStartVideoCall={handleStartVideoCall}
        onCloseVideoCall={handleCloseVideoCall}
        videoCallLink={videoCallLink}
        isVideoCallActive={isVideoCallActive}
        customerData={customerData}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};

export default VideoCallManager;