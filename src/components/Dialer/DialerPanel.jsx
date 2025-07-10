// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     PhoneIcon,
//     PhoneXMarkIcon,
//     MicrophoneIcon,
//     PauseIcon,
//     PlayIcon,
//     BackspaceIcon,
//     XMarkIcon
// } from '@heroicons/react/24/outline';
// import useDialer from '../../hooks/useDialer';
// import { CALL_STATUS } from '../../context/Providers/DialerProvider';

// const DialerPanel = ({ onClose }) => {
//     const {
//         callStatus,
//         currentNumber,
//         callDuration,
//         isMuted,
//         isOnHold,
//         initiateCall,
//         answerCall,
//         endCall,
//         toggleMute,
//         toggleHold,
//         setCurrentNumber,
//         isCallActive,
//         formatDuration,
//         getStatusColor
//     } = useDialer();

//     const [displayNumber, setDisplayNumber] = useState('');

//     // Phone number validation
//     const isValidPhoneNumber = (number) => {
//         const digitsOnly = number.replace(/\D/g, '');
//         return digitsOnly.length === 10;
//     };

//     // Format phone number for display
//     const formatPhoneNumber = (number) => {
//         const digitsOnly = number.replace(/\D/g, '');
//         if (digitsOnly.length <= 3) return digitsOnly;
//         if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
//         return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
//     };

//     // Handle number input
//     const handleNumberClick = (digit) => {
//         if (callStatus === CALL_STATUS.IDLE) {
//             const currentDigits = displayNumber.replace(/\D/g, '');
//             if (currentDigits.length < 10) {
//                 const newNumber = currentDigits + digit;
//                 const formattedNumber = formatPhoneNumber(newNumber);
//                 setDisplayNumber(formattedNumber);
//                 setCurrentNumber(newNumber);
//             }
//         }
//     };

//     // Handle backspace
//     const handleBackspace = useCallback(() => {
//         if (callStatus === CALL_STATUS.IDLE) {
//             const currentDigits = displayNumber.replace(/\D/g, '');
//             if (currentDigits.length > 0) {
//                 const newNumber = currentDigits.slice(0, -1);
//                 setDisplayNumber(formatPhoneNumber(newNumber));
//                 setCurrentNumber(newNumber);
//             }
//         }
//     }, [callStatus, displayNumber, setCurrentNumber]);

//     // Handle call actions
//     const handleCall = () => {
//         const digitsOnly = displayNumber.replace(/\D/g, '');
//         if (isValidPhoneNumber(displayNumber)) {
//             initiateCall(digitsOnly);
//         }
//     };

//     const handleEndCall = () => {
//         endCall();
//         setDisplayNumber('');
//     };

//     // Keyboard handling
//     const handleKeyPress = useCallback((e) => {
//         if (callStatus !== CALL_STATUS.IDLE) return;

//         const { key } = e;

//         if (/^[0-9*#]$/.test(key)) {
//             e.preventDefault();
//             handleNumberClick(key);
//         } else if (key === 'Backspace') {
//             e.preventDefault();
//             handleBackspace();
//         } else if (key === 'Enter') {
//             e.preventDefault();
//             if (isValidPhoneNumber(displayNumber)) handleCall();
//         } else if (key === 'Escape') {
//             e.preventDefault();
//             onClose();
//         }
//     }, [callStatus, displayNumber, handleBackspace, onClose]);

//     useEffect(() => {
//         document.addEventListener('keydown', handleKeyPress);
//         return () => document.removeEventListener('keydown', handleKeyPress);
//     }, [handleKeyPress]);

//     // Dialpad buttons with letters
//     const dialpadButtons = [
//         { digit: '1' },
//         { digit: '2' },
//         { digit: '3' },
//         { digit: '4' },
//         { digit: '5' },
//         { digit: '6' },
//         { digit: '7' },
//         { digit: '8' },
//         { digit: '9' },
//         { digit: '*' },
//         { digit: '0' },
//         { digit: '#' }
//     ];

//     return (
//         <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 overflow-hidden">
//             {/* Header */}
//             <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-b border-gray-100/50">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                         <h3 className="text-sm font-medium text-gray-700">Dialer</h3>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/60 transition-all duration-200"
//                     >
//                         <XMarkIcon className="w-4 h-4" />
//                     </button>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="p-4 space-y-4">
//                 {/* Number Display */}
//                 <div className="relative">
//                     <div className="bg-gray-50/80 rounded-xl p-3 min-h-[3rem] flex items-center justify-between">
//                         <div className="flex-1 text-center">
//                             <div className="text-lg font-mono text-gray-800 tracking-wider">
//                                 {callStatus === CALL_STATUS.IDLE
//                                     ? (displayNumber || '')
//                                     : formatPhoneNumber(currentNumber)
//                                 }
//                             </div>
//                         </div>

//                         {/* Backspace button - only show when idle and has number */}
//                         {callStatus === CALL_STATUS.IDLE && displayNumber && (
//                             <button
//                                 onClick={handleBackspace}
//                                 className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 ml-2"
//                             >
//                                 <BackspaceIcon className="w-4 h-4" />
//                             </button>
//                         )}
//                     </div>

//                     {/* Call status */}
//                     {callStatus !== CALL_STATUS.IDLE && (
//                         <div className="flex items-center justify-center mt-2">
//                             <div className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${callStatus === CALL_STATUS.CONNECTED ? 'bg-green-100 text-green-700' :
//                                 callStatus === CALL_STATUS.RINGING ? 'bg-blue-100 text-blue-700' :
//                                     'bg-gray-100 text-gray-700'
//                                 }`}>
//                                 {callStatus}
//                                 {callStatus === CALL_STATUS.CONNECTED && (
//                                     <span className="ml-1 text-xs">• {formatDuration(callDuration)}</span>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Call Controls - only show during active call */}
//                 {isCallActive() && (
//                     <div className="flex justify-center space-x-3">
//                         <button
//                             onClick={toggleMute}
//                             className={`p-2.5 rounded-full transition-all duration-200 ${isMuted
//                                 ? 'bg-red-500 text-white shadow-lg'
//                                 : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
//                                 }`}
//                             title={isMuted ? 'Unmute' : 'Mute'}
//                         >
//                             <MicrophoneIcon className="w-4 h-4" />
//                         </button>

//                         <button
//                             onClick={toggleHold}
//                             className={`p-2.5 rounded-full transition-all duration-200 ${isOnHold
//                                 ? 'bg-amber-500 text-white shadow-lg'
//                                 : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
//                                 }`}
//                             title={isOnHold ? 'Resume' : 'Hold'}
//                         >
//                             {isOnHold ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
//                         </button>

//                         <button
//                             onClick={handleEndCall}
//                             className="p-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
//                             title="End Call"
//                         >
//                             <PhoneXMarkIcon className="w-4 h-4" />
//                         </button>
//                     </div>
//                 )}

//                 {/* Dialpad - only show when idle */}
//                 {callStatus === CALL_STATUS.IDLE && (
//                     <div className="space-y-3">
//                         <div className="grid grid-cols-3 gap-2">
//                             {dialpadButtons.map(({ digit }) => (
//                                 <button
//                                     key={digit}
//                                     onClick={() => handleNumberClick(digit)}
//                                     className="group relative w-14 h-14 rounded-full bg-gray-50/80 hover:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-md active:scale-95 flex flex-col items-center justify-center mx-auto"
//                                 >
//                                     <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
//                                         {digit}
//                                     </span>
//                                     {/* Subtle hover effect */}
//                                     <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Call Button */}
//                         <div className="flex justify-center pt-2">
//                             <button
//                                 onClick={handleCall}
//                                 disabled={!isValidPhoneNumber(displayNumber)}
//                                 className={`px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 ${isValidPhoneNumber(displayNumber)
//                                     ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl active:scale-95'
//                                     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                     }`}
//                                 title={isValidPhoneNumber(displayNumber) ? "Call" : "Enter 10 digits"}
//                             >
//                                 <PhoneIcon className="w-5 h-5" />
//                                 <span className="text-sm font-medium">
//                                     {isValidPhoneNumber(displayNumber) ? 'Call' : 'Call'}
//                                 </span>
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Incoming Call Interface */}
//                 {callStatus === CALL_STATUS.RINGING && (
//                     <div className="space-y-3">
//                         <div className="text-center">
//                             <div className="text-sm text-gray-600 mb-3">Incoming call</div>
//                             <div className="text-lg font-medium text-gray-800">
//                                 {formatPhoneNumber(currentNumber)}
//                             </div>
//                         </div>

//                         <div className="flex justify-center space-x-4">
//                             <button
//                                 onClick={handleEndCall}
//                                 className="px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg flex items-center space-x-2"
//                                 title="Decline"
//                             >
//                                 <PhoneXMarkIcon className="w-5 h-5" />
//                                 <span className="text-sm font-medium">Decline</span>
//                             </button>

//                             <button
//                                 onClick={answerCall}
//                                 className="px-6 py-3 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg animate-pulse flex items-center space-x-2"
//                                 title="Answer"
//                             >
//                                 <PhoneIcon className="w-5 h-5" />
//                                 <span className="text-sm font-medium">Answer</span>
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DialerPanel;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    PhoneIcon,
    PhoneXMarkIcon,
    MicrophoneIcon,
    PauseIcon,
    PlayIcon,
    BackspaceIcon,
    XMarkIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import useDialer from '../../hooks/useDialer';
import { CALL_STATUS } from '../../context/Providers/DialerProvider';

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
    const [isRingingSoundEnabled, setIsRingingSoundEnabled] = useState(true);

    // Audio refs for different sounds
    const ringingAudioRef = useRef(null);
    const dialToneAudioRef = useRef(null);

    // Initialize audio elements
    useEffect(() => {
        // Create ringing sound audio element
        ringingAudioRef.current = new Audio('/sounds/phone-ring.mp3');
        ringingAudioRef.current.loop = true;
        ringingAudioRef.current.volume = 0.6;
        ringingAudioRef.current.preload = 'auto';

        // Create dial tone sound (optional)
        dialToneAudioRef.current = new Audio('/sounds/dial-tone.mp3');
        dialToneAudioRef.current.volume = 0.3;
        dialToneAudioRef.current.preload = 'auto';

        // Handle audio loading errors with fallbacks
        const handleRingingError = () => {
            console.warn('Could not load phone-ring.mp3, using fallback sound');
            // Fallback to data URL if MP3 fails to load
            ringingAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCWO1fDQfCEEJJbN8Nw=';
        };

        const handleDialToneError = () => {
            console.warn('Could not load dial-tone.mp3, using fallback sound');
            dialToneAudioRef.current.src = 'data:audio/wav;base64,UklGRi4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoBAAAA';
        };

        // Add error event listeners
        ringingAudioRef.current.addEventListener('error', handleRingingError);
        dialToneAudioRef.current.addEventListener('error', handleDialToneError);

        // Preload audio files
        ringingAudioRef.current.load();
        dialToneAudioRef.current.load();

        return () => {
            if (ringingAudioRef.current) {
                ringingAudioRef.current.removeEventListener('error', handleRingingError);
                ringingAudioRef.current.pause();
                ringingAudioRef.current = null;
            }
            if (dialToneAudioRef.current) {
                dialToneAudioRef.current.removeEventListener('error', handleDialToneError);
                dialToneAudioRef.current.pause();
                dialToneAudioRef.current = null;
            }
        };
    }, []);

    // Handle ringing sound based on call status
    useEffect(() => {
        if (!ringingAudioRef.current || !isRingingSoundEnabled) return;

        const playRinging = async () => {
            try {
                if (callStatus === CALL_STATUS.RINGING) {
                    // Reset audio to beginning
                    ringingAudioRef.current.currentTime = 0;

                    // Start playing
                    await ringingAudioRef.current.play();
                    console.log('Ringing sound started');
                } else {
                    // Stop ringing sound
                    ringingAudioRef.current.pause();
                    ringingAudioRef.current.currentTime = 0;
                    console.log('Ringing sound stopped');
                }
            } catch (error) {
                console.warn('Could not play ringing sound:', error.message);
                // Try fallback if main audio fails
                if (error.name === 'NotAllowedError') {
                    console.log('Audio autoplay blocked by browser. User interaction required.');
                }
            }
        };

        playRinging();

        return () => {
            if (ringingAudioRef.current) {
                ringingAudioRef.current.pause();
                ringingAudioRef.current.currentTime = 0;
            }
        };
    }, [callStatus, isRingingSoundEnabled]);

    // Play dial tone when making a call (optional)
    const playDialTone = useCallback(async () => {
        if (dialToneAudioRef.current && isRingingSoundEnabled) {
            try {
                dialToneAudioRef.current.currentTime = 0;
                await dialToneAudioRef.current.play();
            } catch (error) {
                console.warn('Could not play dial tone:', error.message);
            }
        }
    }, [isRingingSoundEnabled]);

    // Play button click sound (optional)
    const playButtonSound = useCallback(async () => {
        if (dialToneAudioRef.current && isRingingSoundEnabled) {
            try {
                // Create a short beep for button feedback
                dialToneAudioRef.current.volume = 0.1;
                dialToneAudioRef.current.currentTime = 0;
                await dialToneAudioRef.current.play();
            } catch (error) {
                console.warn('Could not play button sound:', error.message);
            }
        }
    }, [isRingingSoundEnabled]);

    // Phone number validation
    const isValidPhoneNumber = (number) => {
        const digitsOnly = number.replace(/\D/g, '');
        return digitsOnly.length === 10;
    };

    // Format phone number for display
    const formatPhoneNumber = (number) => {
        const digitsOnly = number.replace(/\D/g, '');
        if (digitsOnly.length <= 3) return digitsOnly;
        if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
        return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    };

    // Handle number input
    const handleNumberClick = (digit) => {
        if (callStatus === CALL_STATUS.IDLE) {
            const currentDigits = displayNumber.replace(/\D/g, '');
            if (currentDigits.length < 10) {
                const newNumber = currentDigits + digit;
                const formattedNumber = formatPhoneNumber(newNumber);
                setDisplayNumber(formattedNumber);
                setCurrentNumber(newNumber);

                // Play button sound for feedback
                playButtonSound();
            }
        }
    };

    // Handle backspace
    const handleBackspace = useCallback(() => {
        if (callStatus === CALL_STATUS.IDLE) {
            const currentDigits = displayNumber.replace(/\D/g, '');
            if (currentDigits.length > 0) {
                const newNumber = currentDigits.slice(0, -1);
                setDisplayNumber(formatPhoneNumber(newNumber));
                setCurrentNumber(newNumber);
            }
        }
    }, [callStatus, displayNumber, setCurrentNumber]);

    // Handle call actions
    const handleCall = () => {
        const digitsOnly = displayNumber.replace(/\D/g, '');
        if (isValidPhoneNumber(displayNumber)) {
            playDialTone();
            initiateCall(digitsOnly);
        }
    };

    const handleEndCall = () => {
        // Stop all audio when ending call
        if (ringingAudioRef.current) {
            ringingAudioRef.current.pause();
            ringingAudioRef.current.currentTime = 0;
        }
        endCall();
        setDisplayNumber('');
    };

    const handleAnswerCall = () => {
        // Stop ringing when answering
        if (ringingAudioRef.current) {
            ringingAudioRef.current.pause();
            ringingAudioRef.current.currentTime = 0;
        }
        answerCall();
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
    const handleKeyPress = useCallback((e) => {
        if (callStatus !== CALL_STATUS.IDLE) return;

        const { key } = e;

        if (/^[0-9*#]$/.test(key)) {
            e.preventDefault();
            handleNumberClick(key);
        } else if (key === 'Backspace') {
            e.preventDefault();
            handleBackspace();
        } else if (key === 'Enter') {
            e.preventDefault();
            if (isValidPhoneNumber(displayNumber)) handleCall();
        } else if (key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [callStatus, displayNumber, handleBackspace, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Dialpad buttons
    const dialpadButtons = [
        { digit: '1' },
        { digit: '2' },
        { digit: '3' },
        { digit: '4' },
        { digit: '5' },
        { digit: '6' },
        { digit: '7' },
        { digit: '8' },
        { digit: '9' },
        { digit: '*' },
        { digit: '0' },
        { digit: '#' }
    ];

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${callStatus === CALL_STATUS.RINGING ? 'bg-red-400 animate-ping' : 'bg-green-400 animate-pulse'
                            }`}></div>
                        <h3 className="text-sm font-medium text-gray-700">Dialer</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Sound toggle button */}
                        <button
                            onClick={toggleRingingSound}
                            className={`p-1.5 rounded-full transition-all duration-200 ${isRingingSoundEnabled
                                ? 'text-gray-600 hover:bg-white/60'
                                : 'text-gray-400 bg-gray-100/50'
                                }`}
                            title={isRingingSoundEnabled ? 'Disable sound' : 'Enable sound'}
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

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Number Display */}
                <div className="relative">
                    <div className="bg-gray-50/80 rounded-xl p-3 min-h-[3rem] flex items-center justify-between">
                        <div className="flex-1 text-center">
                            <div className="text-lg font-mono text-gray-800 tracking-wider">
                                {callStatus === CALL_STATUS.IDLE
                                    ? (displayNumber || '')
                                    : formatPhoneNumber(currentNumber)
                                }
                            </div>
                        </div>

                        {/* Backspace button - only show when idle and has number */}
                        {callStatus === CALL_STATUS.IDLE && displayNumber && (
                            <button
                                onClick={handleBackspace}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 ml-2"
                            >
                                <BackspaceIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Call status */}
                    {callStatus !== CALL_STATUS.IDLE && (
                        <div className="flex items-center justify-center mt-2">
                            <div className={`text-xs font-medium capitalize px-2 py-1 rounded-full flex items-center space-x-1 ${callStatus === CALL_STATUS.CONNECTED ? 'bg-green-100 text-green-700' :
                                callStatus === CALL_STATUS.RINGING ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {callStatus === CALL_STATUS.RINGING && isRingingSoundEnabled && (
                                    <SpeakerWaveIcon className="w-3 h-3 animate-pulse" />
                                )}
                                <span>{callStatus}</span>
                                {callStatus === CALL_STATUS.CONNECTED && (
                                    <span className="ml-1 text-xs">• {formatDuration(callDuration)}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Call Controls - only show during active call */}
                {isCallActive() && (
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={toggleMute}
                            className={`p-2.5 rounded-full transition-all duration-200 ${isMuted
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <MicrophoneIcon className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleHold}
                            className={`p-2.5 rounded-full transition-all duration-200 ${isOnHold
                                ? 'bg-amber-500 text-white shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title={isOnHold ? 'Resume' : 'Hold'}
                        >
                            {isOnHold ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
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

                {/* Dialpad - only show when idle */}
                {callStatus === CALL_STATUS.IDLE && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            {dialpadButtons.map(({ digit }) => (
                                <button
                                    key={digit}
                                    onClick={() => handleNumberClick(digit)}
                                    className="group relative w-14 h-14 rounded-full bg-gray-50/80 hover:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-md active:scale-95 flex flex-col items-center justify-center mx-auto"
                                >
                                    <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                                        {digit}
                                    </span>
                                    {/* Subtle hover effect */}
                                    <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
                                </button>
                            ))}
                        </div>

                        {/* Call Button */}
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleCall}
                                disabled={!isValidPhoneNumber(displayNumber)}
                                className={`px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 ${isValidPhoneNumber(displayNumber)
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                title={isValidPhoneNumber(displayNumber) ? "Call" : "Enter 10 digits"}
                            >
                                <PhoneIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Call</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Incoming Call Interface */}
                {callStatus === CALL_STATUS.RINGING && (
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
            </div>
        </div>
    );
};

export default DialerPanel;