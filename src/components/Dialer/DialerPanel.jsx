import React, { useState } from 'react';
import useDialer from '../../hooks/useDialer';
import { CALL_STATUS } from '../../context/Providers/DialerProvider';
import {
    PhoneIcon,
    PhoneXMarkIcon,
    MicrophoneIcon,
    PauseIcon,
    PlayIcon,
    BackspaceIcon
} from '@heroicons/react/24/outline';

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
        toggleMute,
        toggleHold,
        setCurrentNumber,
        isCallActive,
        formatDuration,
        getStatusColor
    } = useDialer();

    const [displayNumber, setDisplayNumber] = useState('');

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

    // Prevent event bubbling for all button clicks
    const handleButtonClick = (e, callback) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
    };

    return (
        <div
            className="w-80 bg-white"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Dialer</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Display Area */}
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
                            onClick={(e) => handleButtonClick(e, toggleMute)}
                            className={`p-3 rounded-full transition-colors ${isMuted
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={(e) => handleButtonClick(e, toggleHold)}
                            className={`p-3 rounded-full transition-colors ${isOnHold
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            title={isOnHold ? 'Resume' : 'Hold'}
                        >
                            {isOnHold ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={(e) => handleButtonClick(e, handleEndCall)}
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
                                    onClick={(e) => handleButtonClick(e, () => handleNumberClick(digit.toString()))}
                                    className="p-4 text-xl font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    {digit}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={(e) => handleButtonClick(e, handleBackspace)}
                                disabled={!displayNumber}
                                className="p-3 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Backspace"
                            >
                                <BackspaceIcon className="w-5 h-5" />
                            </button>

                            <button
                                onClick={(e) => handleButtonClick(e, handleCall)}
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
                            onClick={(e) => handleButtonClick(e, handleEndCall)}
                            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                            title="Decline"
                        >
                            <PhoneXMarkIcon className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => handleButtonClick(e, handleAnswer)}
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

export default DialerPanel;