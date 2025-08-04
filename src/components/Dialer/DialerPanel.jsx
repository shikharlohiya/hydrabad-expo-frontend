import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  BackspaceIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import useDialer from "../../hooks/useDialer";
import { CALL_STATUS } from "../../context/Providers/DialerProvider";

const DialerPanel = ({ onClose, isOpen, onToggle }) => {
  const {
    callStatus,
    currentNumber,
    callDuration,
    isMuted,
    isOnHold,
    initiateCall,
    endCall,
    callDirection,
    toggleMute,
    toggleHold,
    setCurrentNumber,
    isCallActive,
    canInitiateCall,
    formatDuration,
    getStatusColor,
    connectionStatus,
    lastError,
    isLoading,
    activeCallId,
    contactName,
    userData,
    bearerToken,
    incomingCallData,
    isIncomingCall,
    incomingCallTimer,
  } = useDialer();

  const [displayNumber, setDisplayNumber] = useState("");
  const [isRingingSoundEnabled, setIsRingingSoundEnabled] = useState(true);
  const [showError, setShowError] = useState(false);

  // Conference call states
  const [isConferenceMode, setIsConferenceMode] = useState(false);
  const [conferenceNumber, setConferenceNumber] = useState("");
  const [conferenceParticipants, setConferenceParticipants] = useState([]);

  // Audio refs
  const ringingAudioRef = useRef(null);
  const dialToneAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);

  // Auto-open dialer when incoming call arrives
  // useEffect(() => {
  //   if (isIncomingCall && !isOpen) {
  //     console.log("📞 Auto-opening dialer for incoming call");
  //     onToggle?.();
  //   }
  // }, [isIncomingCall, isOpen, onToggle]);

  // Initialize audio
  useEffect(() => {
    const initAudio = (ref, src, volume, loop = false) => {
      ref.current = new Audio(src);
      ref.current.volume = volume;
      ref.current.loop = loop;
      ref.current.preload = "auto";
      ref.current.addEventListener("error", () =>
        console.warn(`Audio error: ${src}`)
      );
      ref.current.load();
    };

    initAudio(ringingAudioRef, "/sounds/phone-ring.mp3", 0.6, true);
    initAudio(dialToneAudioRef, "/sounds/dial-tone.mp3", 0.5, true);
    initAudio(buttonClickAudioRef, "/sounds/button-click.mp3", 0.4);

    return () => {
      [ringingAudioRef, dialToneAudioRef, buttonClickAudioRef].forEach(
        (ref) => {
          if (ref.current) {
            ref.current.pause();
            ref.current = null;
          }
        }
      );
    };
  }, []);

  // Handle ringing sound
  useEffect(() => {
    if (!ringingAudioRef.current || !isRingingSoundEnabled) return;

    const shouldPlayRinging =
      isIncomingCall || callStatus === CALL_STATUS.INCOMING_CALL;

    if (shouldPlayRinging) {
      ringingAudioRef.current.currentTime = 0;
      ringingAudioRef.current.play().catch(console.warn);
    } else {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }

    return () => {
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
    };
  }, [callStatus, isRingingSoundEnabled, isIncomingCall]);

  // Handle error display
  useEffect(() => {
    if (lastError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  // Update display number
  useEffect(() => {
    if (currentNumber && (callStatus !== CALL_STATUS.IDLE || isIncomingCall)) {
      setDisplayNumber(formatPhoneNumber(currentNumber));
    }
  }, [currentNumber, callStatus, isIncomingCall]);

  // Audio helpers
  const playSound = useCallback(
    async (audioRef) => {
      if (audioRef.current && isRingingSoundEnabled) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (error) {
          console.warn("Could not play sound:", error.message);
        }
      }
    },
    [isRingingSoundEnabled]
  );

  // Phone number utilities
  const isValidPhoneNumber = (number) =>
    number.replace(/\D/g, "").length === 10;

  const formatPhoneNumber = (number) => {
    const digits = number.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Number input handlers
  const handleNumberClick = (digit) => {
    if (callStatus === CALL_STATUS.IDLE && !isIncomingCall) {
      const currentDigits = displayNumber.replace(/\D/g, "");
      if (currentDigits.length < 10) {
        const newNumber = currentDigits + digit;
        setDisplayNumber(formatPhoneNumber(newNumber));
        setCurrentNumber(newNumber);
        playSound(buttonClickAudioRef);
      }
    }
  };

  const handleBackspace = useCallback(() => {
    if (callStatus === CALL_STATUS.IDLE && !isIncomingCall) {
      const currentDigits = displayNumber.replace(/\D/g, "");
      if (currentDigits.length > 0) {
        const newNumber = currentDigits.slice(0, -1);
        setDisplayNumber(formatPhoneNumber(newNumber));
        setCurrentNumber(newNumber);
      }
    }
  }, [callStatus, displayNumber, setCurrentNumber, isIncomingCall]);

  // Conference handlers
  const handleConferenceNumberClick = (digit) => {
    if (isConferenceMode) {
      const currentDigits = conferenceNumber.replace(/\D/g, "");
      if (currentDigits.length < 10) {
        const newNumber = currentDigits + digit;
        setConferenceNumber(formatPhoneNumber(newNumber));
        playSound(buttonClickAudioRef);
      }
    }
  };

  const handleConferenceBackspace = () => {
    if (isConferenceMode) {
      const currentDigits = conferenceNumber.replace(/\D/g, "");
      if (currentDigits.length > 0) {
        const newNumber = currentDigits.slice(0, -1);
        setConferenceNumber(formatPhoneNumber(newNumber));
      }
    }
  };

  // Call actions
  const handleCall = async () => {
    const digitsOnly = displayNumber.replace(/\D/g, "");
    if (isValidPhoneNumber(displayNumber)) {
      await playSound(dialToneAudioRef);
      await initiateCall(digitsOnly, { name: contactName });
    }
  };

  const handleEndCall = () => {
    [ringingAudioRef, dialToneAudioRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
    endCall();
    setDisplayNumber("");
    setIsConferenceMode(false);
    setConferenceNumber("");
    setConferenceParticipants([]);
  };

  const toggleConferenceMode = () => {
    setIsConferenceMode(!isConferenceMode);
    setConferenceNumber("");
  };

  const addConferenceParticipant = () => {
    const digitsOnly = conferenceNumber.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      setConferenceParticipants([...conferenceParticipants, digitsOnly]);
      setConferenceNumber("");
      setIsConferenceMode(false);
    }
  };

  const toggleRingingSound = () => {
    setIsRingingSoundEnabled(!isRingingSoundEnabled);
    if (!isRingingSoundEnabled && ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }
  };

  // Keyboard handling
  const handleKeyPress = useCallback(
    (e) => {
      if (
        (callStatus !== CALL_STATUS.IDLE && !isConferenceMode) ||
        isIncomingCall
      )
        return;

      const { key } = e;
      e.preventDefault();

      if (/^[0-9*#]$/.test(key)) {
        isConferenceMode
          ? handleConferenceNumberClick(key)
          : handleNumberClick(key);
      } else if (key === "Backspace") {
        isConferenceMode ? handleConferenceBackspace() : handleBackspace();
      } else if (key === "Enter") {
        if (isConferenceMode && isValidPhoneNumber(conferenceNumber)) {
          addConferenceParticipant();
        } else if (isValidPhoneNumber(displayNumber)) {
          handleCall();
        }
      } else if (key === "Escape") {
        onClose();
      }
    },
    [
      callStatus,
      displayNumber,
      conferenceNumber,
      isConferenceMode,
      isIncomingCall,
      handleBackspace,
      onClose,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Status helpers
  const getCallStatusText = () => {
    if (isIncomingCall || callStatus === CALL_STATUS.INCOMING_CALL)
      return "Incoming Call";

    const statusMap = {
      [CALL_STATUS.DIALING]: "Dialing...",
      [CALL_STATUS.RINGING]:
        callDirection === "incoming" ? "Incoming Call" : "Ringing...",
      [CALL_STATUS.CONNECTED]: isOnHold ? "On Hold" : "Connected",
      [CALL_STATUS.ON_HOLD]: "On Hold",
      [CALL_STATUS.FAILED]: "Call Failed",
      [CALL_STATUS.ENDED]: "Call Ended",
    };

    return statusMap[callStatus] || "Ready";
  };

  const getConnectionIndicator = () => {
    if (connectionStatus === "connected")
      return <CheckCircleIcon className="w-3 h-3 text-green-500" />;
    if (
      connectionStatus === "connecting" ||
      connectionStatus === "reconnecting"
    ) {
      return <ClockIcon className="w-3 h-3 text-yellow-500 animate-spin" />;
    }
    return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
  };

  // UI state helpers
  const shouldShowIncomingCallUI = () =>
    isIncomingCall || callStatus === CALL_STATUS.INCOMING_CALL;
  const shouldShowOutgoingCallUI = () =>
    callStatus === CALL_STATUS.RINGING && callDirection === "outgoing";
  const shouldShowDialpad = () =>
    (callStatus === CALL_STATUS.IDLE && !isIncomingCall) || isConferenceMode;

  const dialpadButtons = Array.from("123456789*0#").map((digit) => ({ digit }));

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 overflow-hidden">
      {/* Header */}
      <div
        className={`px-4 py-3 border-b border-gray-100/50 ${
          shouldShowIncomingCallUI() ? "bg-blue-50" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getConnectionIndicator()}
              <div
                className={`w-2 h-2 rounded-full ${
                  shouldShowIncomingCallUI()
                    ? "bg-blue-500"
                    : callStatus === CALL_STATUS.CONNECTED
                    ? "bg-green-400"
                    : callStatus === CALL_STATUS.RINGING
                    ? "bg-yellow-400"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              Dialer {userData?.EmployeeName && `• ${userData.EmployeeName}`}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleRingingSound}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                isRingingSoundEnabled
                  ? "text-gray-600 hover:bg-white/60"
                  : "text-gray-400 bg-gray-100/50"
              }`}
              title={isRingingSoundEnabled ? "Disable sound" : "Enable sound"}
            >
              {isRingingSoundEnabled ? (
                <SpeakerWaveIcon className="w-4 h-4" />
              ) : (
                <SpeakerXMarkIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/60 transition-all duration-200"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {showError && lastError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">{lastError}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Number Display */}
        <div className="relative">
          <div
            className={`rounded-xl p-3 min-h-[3rem] flex items-center justify-between ${
              shouldShowIncomingCallUI()
                ? "bg-blue-50 border border-blue-200"
                : "bg-gray-50/80"
            }`}
          >
            <div className="flex-1 text-center">
              <div className="text-lg font-mono text-gray-800 tracking-wider">
                {isConferenceMode
                  ? conferenceNumber || "Enter conference number"
                  : shouldShowIncomingCallUI() ||
                    callStatus !== CALL_STATUS.IDLE
                  ? formatPhoneNumber(currentNumber) || "Unknown Number"
                  : displayNumber || "Enter number"}
              </div>

              {conferenceParticipants.length > 0 && !isConferenceMode && (
                <div className="text-xs text-gray-500 mt-1">
                  +{conferenceParticipants.length} participant
                  {conferenceParticipants.length > 1 ? "s" : ""}
                </div>
              )}

              {/* {shouldShowIncomingCallUI() && contactName && (
                <div className="text-sm text-gray-600 mt-1">{contactName}</div>
              )} */}
            </div>

            {/* Backspace button */}
            {((callStatus === CALL_STATUS.IDLE &&
              displayNumber &&
              !isIncomingCall) ||
              (isConferenceMode && conferenceNumber)) && (
              <button
                onClick={
                  isConferenceMode ? handleConferenceBackspace : handleBackspace
                }
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 ml-2"
              >
                <BackspaceIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Call status - Simplified */}
          {(callStatus !== CALL_STATUS.IDLE || isLoading || isIncomingCall) && (
            <div className="flex items-center justify-center mt-2">
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                  shouldShowIncomingCallUI()
                    ? "bg-blue-100 text-blue-700"
                    : callStatus === CALL_STATUS.CONNECTED
                    ? "bg-green-100 text-green-700"
                    : callStatus === CALL_STATUS.RINGING
                    ? "bg-yellow-100 text-yellow-700"
                    : callStatus === CALL_STATUS.FAILED
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isLoading && <ClockIcon className="w-3 h-3 animate-spin" />}

                <span>
                  {getCallStatusText()}
                  {callStatus === CALL_STATUS.CONNECTED && !isOnHold && (
                    <span className="ml-1">
                      • {formatDuration(callDuration)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Incoming Call Interface - SIMPLIFIED */}
        {/* Incoming Call Interface - SIMPLIFIED */}
        {shouldShowIncomingCallUI() && (
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
              <BellIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Incoming Call</span>
            </div>

            {/* {contactName && (
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {contactName}
              </div>
            )} */}

            <div className="text-xs text-gray-500">
              Call will be handled automatically
            </div>
          </div>
        )}

        {/* Call Controls */}
        {isCallActive() && !shouldShowIncomingCallUI() && (
          <div className="flex justify-center space-x-3">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isMuted
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              <MicrophoneIcon className="w-4 h-4" />
            </button>

            <button
              onClick={toggleHold}
              disabled={callStatus !== CALL_STATUS.CONNECTED}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isOnHold
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOnHold ? "Resume" : "Hold"}
            >
              {isOnHold ? (
                <PlayIcon className="w-4 h-4" />
              ) : (
                <PauseIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={toggleConferenceMode}
              disabled={callStatus !== CALL_STATUS.CONNECTED || isOnHold}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isConferenceMode
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Conference Call"
            >
              <UserGroupIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleEndCall}
              className="p-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
              title="End Call"
            >
              <PhoneXMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conference Add Button */}
        {isConferenceMode && (
          <div className="flex justify-center">
            <button
              onClick={addConferenceParticipant}
              disabled={!isValidPhoneNumber(conferenceNumber)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm ${
                isValidPhoneNumber(conferenceNumber)
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add to Call</span>
            </button>
          </div>
        )}

        {/* Dialpad */}
        {shouldShowDialpad() && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {dialpadButtons.map(({ digit }) => (
                <button
                  key={digit}
                  onClick={() =>
                    isConferenceMode
                      ? handleConferenceNumberClick(digit)
                      : handleNumberClick(digit)
                  }
                  className="group relative w-14 h-14 rounded-full bg-gray-50/80 hover:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-md active:scale-95 flex flex-col items-center justify-center mx-auto"
                >
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                    {digit}
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
                </button>
              ))}
            </div>

            {/* Call Button */}
            {callStatus === CALL_STATUS.IDLE &&
              !isConferenceMode &&
              !isIncomingCall && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleCall}
                    disabled={
                      !isValidPhoneNumber(displayNumber) || !canInitiateCall()
                    }
                    className={`px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 ${
                      isValidPhoneNumber(displayNumber) && canInitiateCall()
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl active:scale-95"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      !bearerToken
                        ? "Authentication required"
                        : !isValidPhoneNumber(displayNumber)
                        ? "Enter 10 digits"
                        : "Call"
                    }
                  >
                    {isLoading ? (
                      <ClockIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <PhoneIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? "Calling..." : "Call"}
                    </span>
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Outgoing Call Interface */}
        {shouldShowOutgoingCallUI() && (
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-2">
              <span>Calling {formatPhoneNumber(currentNumber)}</span>
              <ClockIcon className="w-4 h-4 animate-spin" />
            </div>
            <button
              onClick={handleEndCall}
              className="px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg flex items-center space-x-2 mx-auto"
            >
              <PhoneXMarkIcon className="w-5 h-5" />
              <span className="text-sm font-medium">End Call</span>
            </button>
          </div>
        )}

        {/* Connection Status Footer */}
        <div className="text-xs text-gray-500 text-center">
          {connectionStatus === "connected" && bearerToken && (
            <span className="text-green-600">● Connected</span>
          )}
          {(connectionStatus === "connecting" ||
            connectionStatus === "reconnecting") && (
            <span className="text-yellow-600">● Connecting...</span>
          )}
          {connectionStatus === "error" && (
            <span className="text-red-600">● Connection Error</span>
          )}
          {!bearerToken && (
            <span className="text-red-600">● Authentication Required</span>
          )}

          {/* Debug info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-1 text-xs text-gray-400 space-y-1">
              <div>Status: {callStatus}</div>
              <div>Incoming: {isIncomingCall ? "YES" : "NO"}</div>
              <div>Direction: {callDirection}</div>
              {activeCallId && (
                <div>Call ID: {String(activeCallId).slice(-6)}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialerPanel;
