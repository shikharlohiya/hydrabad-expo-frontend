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
} from "@heroicons/react/24/outline";
import useDialer from "../../hooks/useDialer";
import { CALL_STATUS } from "../../context/Providers/DialerProvider";

const DialerPanel = ({ onClose }) => {
  const {
    callStatus,
    currentNumber,
    callDuration,
    isMuted,
    isOnHold,
    initiateCall,
    answerCall,
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
  } = useDialer();

  const [displayNumber, setDisplayNumber] = useState("");
  const [isRingingSoundEnabled, setIsRingingSoundEnabled] = useState(true);
  const [showError, setShowError] = useState(false);

  // Conference call states
  const [isConferenceMode, setIsConferenceMode] = useState(false);
  const [conferenceNumber, setConferenceNumber] = useState("");
  const [conferenceParticipants, setConferenceParticipants] = useState([]);

  // Audio refs for different sounds
  const ringingAudioRef = useRef(null); // Incoming
  const dialToneAudioRef = useRef(null); // Outgoing
  const buttonClickAudioRef = useRef(null); // Button

  useEffect(() => {
    // Create audio elements
    ringingAudioRef.current = new Audio("/sounds/phone-ring.mp3");
    ringingAudioRef.current.loop = true;
    ringingAudioRef.current.volume = 0.6;
    ringingAudioRef.current.preload = "auto";

    dialToneAudioRef.current = new Audio("/sounds/dial-tone.mp3");
    dialToneAudioRef.current.loop = true; // Optional: for continuous outgoing ringing
    dialToneAudioRef.current.volume = 0.5;
    dialToneAudioRef.current.preload = "auto";

    buttonClickAudioRef.current = new Audio("/sounds/button-click.mp3");
    buttonClickAudioRef.current.volume = 0.4;
    buttonClickAudioRef.current.preload = "auto";

    // Handle audio loading errors
    const handleRingingError = () => {
      console.warn("Could not load phone-ring.mp3, using fallback sound");
      ringingAudioRef.current.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCWO1fDQfCEEJJbN8Nw=";
    };

    const handleDialToneError = () => {
      console.warn("Could not load dial-tone.mp3, using fallback sound");
      dialToneAudioRef.current.src =
        "data:audio/wav;base64,UklGRi4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoBAAAA";
    };

    const handleButtonClickError = () => {
      console.warn("Could not load button-click.mp3");
    };

    // Attach error listeners
    ringingAudioRef.current.addEventListener("error", handleRingingError);
    dialToneAudioRef.current.addEventListener("error", handleDialToneError);
    buttonClickAudioRef.current.addEventListener(
      "error",
      handleButtonClickError
    );

    // Preload
    ringingAudioRef.current.load();
    dialToneAudioRef.current.load();
    buttonClickAudioRef.current.load();

    return () => {
      // Clean up ringing audio
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
        ringingAudioRef.current.removeEventListener(
          "error",
          handleRingingError
        );
        ringingAudioRef.current = null;
      }

      // Clean up dial tone audio
      if (dialToneAudioRef.current) {
        dialToneAudioRef.current.pause();
        dialToneAudioRef.current.currentTime = 0;
        dialToneAudioRef.current.removeEventListener(
          "error",
          handleDialToneError
        );
        dialToneAudioRef.current = null;
      }

      // Clean up button click audio
      if (buttonClickAudioRef.current) {
        buttonClickAudioRef.current.pause();
        buttonClickAudioRef.current.currentTime = 0;
        buttonClickAudioRef.current.removeEventListener(
          "error",
          handleButtonClickError
        );
        buttonClickAudioRef.current = null;
      }
    };
  }, []);

  // Handle ringing sound based on call status
  useEffect(() => {
    if (!ringingAudioRef.current || !isRingingSoundEnabled) return;

    const playRinging = async () => {
      try {
        if (
          callStatus === CALL_STATUS.RINGING &&
          callDirection === "incoming"
        ) {
          ringingAudioRef.current.currentTime = 0;
          await ringingAudioRef.current.play();
          console.log("Ringing sound started");
        } else {
          ringingAudioRef.current.pause();
          ringingAudioRef.current.currentTime = 0;
          console.log("Ringing sound stopped");
        }
      } catch (error) {
        console.warn("Could not play ringing sound:", error.message);
      }
    };

    playRinging();
    return () => {
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
    };
  }, [callStatus, isRingingSoundEnabled, callDirection]);

  // Handle error display
  useEffect(() => {
    if (lastError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  // Update display number when current number changes
  useEffect(() => {
    if (currentNumber && callStatus !== CALL_STATUS.IDLE) {
      setDisplayNumber(formatPhoneNumber(currentNumber));
    }
  }, [currentNumber, callStatus]);

  // Play dial tone when making a call (optional)
  const playDialTone = useCallback(async () => {
    if (dialToneAudioRef.current && isRingingSoundEnabled) {
      try {
        dialToneAudioRef.current.currentTime = 0;
        await dialToneAudioRef.current.play();
      } catch (error) {
        console.warn("Could not play dial tone:", error.message);
      }
    }
  }, [isRingingSoundEnabled]);

  // Play button click sound (optional)
  const playButtonSound = useCallback(async () => {
    if (buttonClickAudioRef.current && isRingingSoundEnabled) {
      try {
        buttonClickAudioRef.current.currentTime = 0;
        await buttonClickAudioRef.current.play();
      } catch (error) {
        console.warn("Could not play button sound:", error.message);
      }
    }
  }, [isRingingSoundEnabled]);

  // Phone number validation
  const isValidPhoneNumber = (number) => {
    const digitsOnly = number.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  // Format phone number for display
  const formatPhoneNumber = (number) => {
    const digitsOnly = number.replace(/\D/g, "");
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6)
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      6
    )}-${digitsOnly.slice(6, 10)}`;
  };

  // Handle number input
  const handleNumberClick = (digit) => {
    if (callStatus === CALL_STATUS.IDLE) {
      const currentDigits = displayNumber.replace(/\D/g, "");
      if (currentDigits.length < 10) {
        const newNumber = currentDigits + digit;
        const formattedNumber = formatPhoneNumber(newNumber);
        setDisplayNumber(formattedNumber);
        setCurrentNumber(newNumber);
        playButtonSound();
      }
    }
  };

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (callStatus === CALL_STATUS.IDLE) {
      const currentDigits = displayNumber.replace(/\D/g, "");
      if (currentDigits.length > 0) {
        const newNumber = currentDigits.slice(0, -1);
        setDisplayNumber(formatPhoneNumber(newNumber));
        setCurrentNumber(newNumber);
      }
    }
  }, [callStatus, displayNumber, setCurrentNumber]);

  // Handle conference number input
  const handleConferenceNumberClick = (digit) => {
    if (isConferenceMode) {
      const currentDigits = conferenceNumber.replace(/\D/g, "");
      if (currentDigits.length < 10) {
        const newNumber = currentDigits + digit;
        setConferenceNumber(formatPhoneNumber(newNumber));
        playButtonSound();
      }
    }
  };

  // Handle conference backspace
  const handleConferenceBackspace = () => {
    if (isConferenceMode) {
      const currentDigits = conferenceNumber.replace(/\D/g, "");
      if (currentDigits.length > 0) {
        const newNumber = currentDigits.slice(0, -1);
        setConferenceNumber(formatPhoneNumber(newNumber));
      }
    }
  };

  // Handle call actions
  const handleCall = async () => {
    const digitsOnly = displayNumber.replace(/\D/g, "");
    if (isValidPhoneNumber(displayNumber)) {
      await playDialTone();
      await initiateCall(digitsOnly, { name: contactName });
    }
  };

  const handleEndCall = () => {
    // Stop all audio when ending call
    if (ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }
    if (dialToneAudioRef.current) {
      dialToneAudioRef.current.pause();
      dialToneAudioRef.current.currentTime = 0;
    }
    endCall();
    setDisplayNumber("");
    setIsConferenceMode(false);
    setConferenceNumber("");
    setConferenceParticipants([]);
  };

  const handleAnswerCall = () => {
    answerCall();
  };

  // Toggle conference mode
  const toggleConferenceMode = () => {
    setIsConferenceMode(!isConferenceMode);
    setConferenceNumber("");
  };

  // Add conference participant (placeholder - would need backend implementation)
  const addConferenceParticipant = () => {
    const digitsOnly = conferenceNumber.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      setConferenceParticipants([...conferenceParticipants, digitsOnly]);
      setConferenceNumber("");
      setIsConferenceMode(false);
      // Here you would make API call to add participant
      console.log("Adding conference participant:", digitsOnly);
    }
  };

  // Toggle sound on/off
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
      if (callStatus !== CALL_STATUS.IDLE && !isConferenceMode) return;

      const { key } = e;

      if (/^[0-9*#]$/.test(key)) {
        e.preventDefault();
        if (isConferenceMode) {
          handleConferenceNumberClick(key);
        } else {
          handleNumberClick(key);
        }
      } else if (key === "Backspace") {
        e.preventDefault();
        if (isConferenceMode) {
          handleConferenceBackspace();
        } else {
          handleBackspace();
        }
      } else if (key === "Enter") {
        e.preventDefault();
        if (isConferenceMode && isValidPhoneNumber(conferenceNumber)) {
          addConferenceParticipant();
        } else if (isValidPhoneNumber(displayNumber)) {
          handleCall();
        }
      } else if (key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [
      callStatus,
      displayNumber,
      conferenceNumber,
      isConferenceMode,
      handleBackspace,
      onClose,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Get call status display text
  const getCallStatusText = () => {
    switch (callStatus) {
      case CALL_STATUS.DIALING:
        return "Dialing...";
      case CALL_STATUS.RINGING:
        return callDirection === "incoming" ? "Incoming Call" : "Ringing...";
      case CALL_STATUS.CONNECTED:
        return isOnHold ? "On Hold" : "Connected";
      case CALL_STATUS.ON_HOLD:
        return "On Hold";
      case CALL_STATUS.FAILED:
        return "Call Failed";
      case CALL_STATUS.ENDED:
        return "Call Ended";
      default:
        return "Ready";
    }
  };

  // Get connection status indicator
  const getConnectionIndicator = () => {
    if (connectionStatus === "connected") {
      return <CheckCircleIcon className="w-3 h-3 text-green-500" />;
    } else if (
      connectionStatus === "connecting" ||
      connectionStatus === "reconnecting"
    ) {
      return <ClockIcon className="w-3 h-3 text-yellow-500 animate-spin" />;
    } else {
      return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
    }
  };

  // Dialpad buttons
  const dialpadButtons = [
    { digit: "1" },
    { digit: "2" },
    { digit: "3" },
    { digit: "4" },
    { digit: "5" },
    { digit: "6" },
    { digit: "7" },
    { digit: "8" },
    { digit: "9" },
    { digit: "*" },
    { digit: "0" },
    { digit: "#" },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getConnectionIndicator()}
              <div
                className={`w-2 h-2 rounded-full ${
                  callStatus === CALL_STATUS.RINGING
                    ? "bg-red-400 animate-ping"
                    : callStatus === CALL_STATUS.CONNECTED
                    ? "bg-green-400"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              Dialer {userData?.EmployeeName && `• ${userData.EmployeeName}`}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Sound toggle button */}
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
          <div className="bg-gray-50/80 rounded-xl p-3 min-h-[3rem] flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="text-lg font-mono text-gray-800 tracking-wider">
                {isConferenceMode
                  ? conferenceNumber || "Enter conference number"
                  : callStatus === CALL_STATUS.IDLE
                  ? displayNumber || "Enter number"
                  : formatPhoneNumber(currentNumber)}
              </div>
              {conferenceParticipants.length > 0 && !isConferenceMode && (
                <div className="text-xs text-gray-500 mt-1">
                  +{conferenceParticipants.length} participant
                  {conferenceParticipants.length > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Backspace button */}
            {((callStatus === CALL_STATUS.IDLE && displayNumber) ||
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

          {/* Call status */}
          {(callStatus !== CALL_STATUS.IDLE || isLoading) && (
            <div className="flex items-center justify-center mt-2">
              <div
                className={`text-xs font-medium capitalize px-2 py-1 rounded-full flex items-center space-x-2 ${
                  callStatus === CALL_STATUS.CONNECTED
                    ? "bg-green-100 text-green-700"
                    : callStatus === CALL_STATUS.RINGING
                    ? "bg-red-100 text-red-700"
                    : callStatus === CALL_STATUS.FAILED
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isLoading && <ClockIcon className="w-3 h-3 animate-spin" />}
                {callStatus === CALL_STATUS.RINGING &&
                  isRingingSoundEnabled && (
                    <SpeakerWaveIcon className="w-3 h-3 animate-pulse" />
                  )}
                <span>{getCallStatusText()}</span>
                {callStatus === CALL_STATUS.CONNECTED && !isOnHold && (
                  <span className="ml-1 text-xs">
                    • {formatDuration(callDuration)}
                  </span>
                )}
                {activeCallId && typeof activeCallId === "string" ? (
                  <span className="text-xs opacity-60">
                    #{activeCallId.slice(-4)}
                  </span>
                ) : activeCallId != null ? (
                  <span className="text-xs opacity-60">
                    #{String(activeCallId).slice(-4)}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Call Controls - show during active call */}
        {isCallActive() && (
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

        {/* Dialpad - only show when idle or in conference mode */}
        {(callStatus === CALL_STATUS.IDLE || isConferenceMode) && (
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
                  <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
                </button>
              ))}
            </div>

            {/* Call Button - only show when idle */}
            {callStatus === CALL_STATUS.IDLE && !isConferenceMode && (
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

        {/* Incoming Call Interface */}
        {callStatus === CALL_STATUS.RINGING && callDirection === "incoming" && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3 flex items-center justify-center space-x-2">
                <span>Incoming call</span>
                {isRingingSoundEnabled && (
                  <SpeakerWaveIcon className="w-4 h-4 text-red-500 animate-pulse" />
                )}
              </div>
              <div className="text-lg font-medium text-gray-800">
                {formatPhoneNumber(currentNumber)}
              </div>
              {contactName && (
                <div className="text-sm text-gray-500 mt-1">{contactName}</div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleEndCall}
                className="px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg flex items-center space-x-2"
                title="Decline"
              >
                <PhoneXMarkIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Decline</span>
              </button>

              <button
                onClick={handleAnswerCall}
                className="px-6 py-3 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg animate-pulse flex items-center space-x-2"
                title="Answer"
              >
                <PhoneIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Answer</span>
              </button>
            </div>
          </div>
        )}

        {/* Outgoing Call Interface */}
        {callStatus === CALL_STATUS.RINGING && callDirection === "outgoing" && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Calling {formatPhoneNumber(currentNumber)}
            </p>
            <button
              onClick={handleEndCall}
              className="mt-3 px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
            >
              End Call
            </button>
          </div>
        )}

        {/* Connection status footer */}
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
        </div>
      </div>
    </div>
  );
};

export default DialerPanel;
