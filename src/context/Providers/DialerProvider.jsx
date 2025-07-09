import { useState, useEffect } from "react";
import DialerContext from "../DialerContext";

// Call status constants
export const CALL_STATUS = {
    IDLE: 'idle',
    DIALING: 'dialing',
    RINGING: 'ringing',
    CONNECTED: 'connected',
    ON_HOLD: 'on_hold',
    ENDED: 'ended',
    FAILED: 'failed'
};

const DialerProvider = ({ children }) => {
    const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
    const [currentNumber, setCurrentNumber] = useState('');
    const [callDuration, setCallDuration] = useState(0);
    const [callStartTime, setCallStartTime] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [callHistory, setCallHistory] = useState([]);
    const [activeCallId, setActiveCallId] = useState(null);
    const [contactName, setContactName] = useState(null);
    const [contactAvatar, setContactAvatar] = useState(null);

    // New state for call remarks form
    const [isRemarksFormOpen, setIsRemarksFormOpen] = useState(false);
    const [currentCallDetails, setCurrentCallDetails] = useState(null);
    const [pendingCallEnd, setPendingCallEnd] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // Timer effect for call duration
    useEffect(() => {
        let interval;
        if (callStatus === CALL_STATUS.CONNECTED && callStartTime) {
            interval = setInterval(() => {
                const duration = Math.floor((Date.now() - callStartTime) / 1000);
                setCallDuration(duration);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus, callStartTime]);

    // Auto-open remarks form when call connects - REMOVED since we're using page replacement
    // useEffect(() => {
    //     if (callStatus === CALL_STATUS.CONNECTED && !isRemarksFormOpen) {
    //         setCurrentCallDetails({
    //             phoneNumber: currentNumber,
    //             startTime: callStartTime,
    //             duration: callDuration
    //         });
    //         setIsRemarksFormOpen(true);
    //     }
    // }, [callStatus, currentNumber, callStartTime, callDuration, isRemarksFormOpen]);

    // Actions
    const initiateCall = (number, contactInfo = null) => {
        setCurrentNumber(number);
        setCallStatus(CALL_STATUS.DIALING);
        setContactName(contactInfo?.name || null);
        setContactAvatar(contactInfo?.avatar || null);

        // Simulate dialing process
        setTimeout(() => {
            setCallStatus(CALL_STATUS.RINGING);
        }, 1000);
    };

    const answerCall = () => {
        setCallStatus(CALL_STATUS.CONNECTED);
        setCallStartTime(Date.now());
        setIsRemarksFormOpen(true);
        setIsFormSubmitted(false);
    };

    const endCall = () => {
        // Proceed with ending call
        finishCall();
    };

    const finishCall = (remarksData = null) => {
        // Add to call history
        if (currentNumber) {
            const callRecord = {
                id: Date.now(),
                number: currentNumber,
                contactName,
                duration: callDuration,
                timestamp: new Date(),
                type: 'outgoing',
                status: callStatus === CALL_STATUS.CONNECTED ? 'completed' : 'missed',
                remarks: remarksData || null
            };
            setCallHistory(prev => [callRecord, ...prev]);
        }

        setCallStatus(CALL_STATUS.ENDED);

        // Reset call-related state but keep form open if not submitted
        setTimeout(() => {
            setCallStatus(CALL_STATUS.IDLE);
            setCurrentNumber('');
            setCallDuration(0);
            setCallStartTime(null);
            setIsMuted(false);
            setIsOnHold(false);
            setActiveCallId(null);
            setContactName(null);
            setContactAvatar(null);
            // DON'T reset these - let form persist:
            // setIsRemarksFormOpen(false);
            // setIsFormSubmitted(false);
        }, 1000);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleHold = () => {
        const newHoldState = !isOnHold;
        setIsOnHold(newHoldState);
        setCallStatus(newHoldState ? CALL_STATUS.ON_HOLD : CALL_STATUS.CONNECTED);
    };

    const clearCurrentNumber = () => {
        setCurrentNumber('');
    };

    const resetDialer = () => {
        setCallStatus(CALL_STATUS.IDLE);
        setCurrentNumber('');
        setCallDuration(0);
        setCallStartTime(null);
        setIsMuted(false);
        setIsOnHold(false);
        setActiveCallId(null);
        setContactName(null);
        setContactAvatar(null);
        setIsRemarksFormOpen(false);
        setCurrentCallDetails(null);
        setPendingCallEnd(false);
        setIsFormSubmitted(false);
    };

    // Handle remarks form submission
    const handleRemarksSubmit = (remarksData) => {
        // Mark form as submitted
        setIsFormSubmitted(true);
        setIsRemarksFormOpen(false);

        // Save the remarks data
        setCurrentCallDetails(prev => ({
            ...prev,
            remarks: remarksData
        }));

        console.log('Remarks saved:', remarksData);
    };

    const handleRemarksCancel = () => {
        // Just close the form without saving, but keep form available
        setIsRemarksFormOpen(false);
    };

    // Helper functions
    const isCallActive = () => {
        return [CALL_STATUS.DIALING, CALL_STATUS.RINGING, CALL_STATUS.CONNECTED, CALL_STATUS.ON_HOLD].includes(callStatus);
    };

    const canInitiateCall = () => {
        return callStatus === CALL_STATUS.IDLE;
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
        switch (callStatus) {
            case CALL_STATUS.CONNECTED:
                return 'text-green-500';
            case CALL_STATUS.DIALING:
            case CALL_STATUS.RINGING:
                return 'text-yellow-500';
            case CALL_STATUS.ON_HOLD:
                return 'text-orange-500';
            case CALL_STATUS.FAILED:
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusBgColor = () => {
        switch (callStatus) {
            case CALL_STATUS.CONNECTED:
                return 'bg-green-500';
            case CALL_STATUS.DIALING:
            case CALL_STATUS.RINGING:
                return 'bg-yellow-500';
            case CALL_STATUS.ON_HOLD:
                return 'bg-orange-500';
            case CALL_STATUS.FAILED:
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const value = {
        // State
        callStatus,
        currentNumber,
        callDuration,
        callStartTime,
        isMuted,
        isOnHold,
        callHistory,
        activeCallId,
        contactName,
        contactAvatar,
        isRemarksFormOpen,
        currentCallDetails,
        pendingCallEnd,
        isFormSubmitted,

        // Actions
        initiateCall,
        answerCall,
        endCall,
        finishCall,
        toggleMute,
        toggleHold,
        setCurrentNumber,
        clearCurrentNumber,
        resetDialer,
        handleRemarksSubmit,
        handleRemarksCancel,

        // Helpers
        isCallActive,
        canInitiateCall,
        formatDuration,
        getStatusColor,
        getStatusBgColor
    };

    return (
        <DialerContext.Provider value={value}>
            {children}
        </DialerContext.Provider>
    );
};

export default DialerProvider;