import React, { useState } from 'react';
import useDialer from '../../hooks/useDialer';
import { CALL_STATUS } from '../../context/Providers/DialerProvider';
import {
    PhoneIcon,
    PhoneXMarkIcon,
    MicrophoneIcon,
    SpeakerWaveIcon,
    PauseIcon,
    PlayIcon,
    BackspaceIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Dialer = () => {
    const {
        callStatus,
        currentNumber,
        callDuration,
        isMuted,
        isOnHold,
        initiateCall,
        answerCall,
        endCall,
        toggleMute,
        toggleHold,
        setCurrentNumber,
        isCallActive,
        canInitiateCall,
        formatDuration,
        getStatusColor,
        getStatusBgColor
    } = useDialer();

    const [displayNumber, setDisplayNumber] = useState('');
    const [isDialerOpen, setIsDialerOpen] = useState(false);

    // Handle number input
    const handleNumberClick = (digit) => {
        if (callStatus === CALL_STATUS.IDLE) {
            const newNumber = displayNumber + digit;
            setDisplayNumber(newNumber);
            setCurrentNumber(newNumber);
        }
    };

    // Handle backspace
    const handleBackspace = () => {
        if (callStatus === CALL_STATUS.IDLE) {
            const newNumber = displayNumber.slice(0, -1);
            setDisplayNumber(newNumber);
            setCurrentNumber(newNumber);
        }
    };

    // Handle call initiation
    const handleCall = () => {
        if (currentNumber || displayNumber) {
            initiateCall(currentNumber || displayNumber);
        }
    };

    // Handle call answer (for incoming calls)
    const handleAnswer = () => {
        answerCall();
    };

    // Handle call end
    const handleEndCall = () => {
        endCall();
        setDisplayNumber('');
    };

    // Toggle dialer visibility
    const toggleDialer = () => {
        setIsDialerOpen(!isDialerOpen);
    };

    // Auto-open dialer when there's an active call
    React.useEffect(() => {
        if (isCallActive()) {
            setIsDialerOpen(true);
        }
    }, [callStatus, isCallActive]);

    // Floating Button Component
    const FloatingButton = () => (
        <button
            onClick={toggleDialer}
            className={`
                fixed top-10 right-10 z-40
                w-14 h-14 rounded-full shadow-lg
                flex items-center justify-center
                transition-all duration-300 hover:scale-110
                ${isCallActive()
                    ? `${getStatusBgColor()} text-white animate-pulse`
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
            `}
            title={isCallActive() ? `Call ${callStatus}` : 'Open Dialer'}
        >
            {isCallActive() ? (
                <div className="relative">
                    <PhoneIcon className="w-6 h-6" />
                    {callStatus === CALL_STATUS.CONNECTED && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    )}
                </div>
            ) : (
                <PhoneIcon className="w-6 h-6" />
            )}
        </button>
    );

    // Call Status Indicator (Mini view when call is active but dialer is closed)
    const CallStatusIndicator = () => {
        if (!isCallActive() || isDialerOpen) return null;

        return (
            <div className="fixed top-20 right-6 z-30 bg-white shadow-lg rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusBgColor()}`}></div>
                    <span className="text-sm font-medium capitalize">{callStatus}</span>
                    {callStatus === CALL_STATUS.CONNECTED && (
                        <span className="text-xs text-gray-500">
                            {formatDuration(callDuration)}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Main Dialer Panel
    const DialerPanel = () => {
        if (!isDialerOpen) return null;

        return (
            <div className="fixed top-20 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Dialer</h2>
                        <button
                            onClick={toggleDialer}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Display Area */}
                <div className="p-4">
                    <div className="text-center mb-4">
                        <div className="text-2xl font-mono text-gray-800 mb-2 h-8">
                            {callStatus === CALL_STATUS.IDLE ? (displayNumber || 'Enter number') : currentNumber}
                        </div>

                        <div className={`text-sm font-medium capitalize ${getStatusColor()}`}>
                            {callStatus}
                        </div>

                        {callStatus === CALL_STATUS.CONNECTED && (
                            <div className="text-lg font-mono text-gray-600 mt-2">
                                {formatDuration(callDuration)}
                            </div>
                        )}
                    </div>

                    {/* Call Controls for Active Call */}
                    {isCallActive() && (
                        <div className="flex justify-center space-x-4 mb-4">
                            <button
                                onClick={toggleMute}
                                className={`p-3 rounded-full transition-colors ${isMuted
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>

                            <button
                                onClick={toggleHold}
                                className={`p-3 rounded-full transition-colors ${isOnHold
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                title={isOnHold ? 'Resume' : 'Hold'}
                            >
                                {isOnHold ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={handleEndCall}
                                className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                title="End Call"
                            >
                                <PhoneXMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Dialpad - only show when idle */}
                    {callStatus === CALL_STATUS.IDLE && (
                        <>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                                    <button
                                        key={digit}
                                        onClick={() => handleNumberClick(digit.toString())}
                                        className="p-4 text-xl font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {digit}
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleBackspace}
                                    disabled={!displayNumber}
                                    className="p-3 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Backspace"
                                >
                                    <BackspaceIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleCall}
                                    disabled={!currentNumber && !displayNumber}
                                    className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Call"
                                >
                                    <PhoneIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Incoming Call Interface */}
                    {callStatus === CALL_STATUS.RINGING && (
                        <div className="flex justify-center space-x-6">
                            <button
                                onClick={handleEndCall}
                                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                title="Decline"
                            >
                                <PhoneXMarkIcon className="w-6 h-6" />
                            </button>

                            <button
                                onClick={handleAnswer}
                                className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                title="Answer"
                            >
                                <PhoneIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <FloatingButton />
            <CallStatusIndicator />
            <DialerPanel />
        </>
    );
};

export default Dialer;