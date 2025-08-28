# Backend Routes Required for Acefone Integration

## Required API Endpoints

The frontend now expects these routes to exist on your backend:

### 1. Initiate Call Endpoint
```javascript
// Route: POST /acefone-initiate-call
// This should integrate with your Acefone system to start calls
router.post("/acefone-initiate-call", async (req, res) => {
  // Your existing initiate call logic adapted for Acefone
  // Should return call ID and success status
});
```

### 2. End Call Endpoint  
```javascript
// Route: POST /acefone-call-disconnection
// This should integrate with your Acefone system to end calls
router.post("/acefone-call-disconnection", async (req, res) => {
  // Your existing call disconnection logic adapted for Acefone
  // Should handle call termination properly
});
```

## Socket Events (Already Implemented)

Your Acefone webhook handler already emits these events correctly:

- ✅ `call-connected` - When call connects (triggers form opening)
- ✅ `call-disconnected` - When call ends
- ✅ `call-initiated` - When call starts

## Integration Notes

1. **Frontend expects**: The new endpoints to behave similarly to the old ones
2. **Socket events**: Your current Acefone webhook is already properly set up
3. **Form auto-open**: Will happen automatically when `call-connected` is emitted
4. **Call ID tracking**: Make sure call IDs are consistent between initiate and webhook events

## Current Acefone Handler Status

Your existing `/Acefone-call-connect` webhook handler is perfect and already:
- ✅ Handles connected/disconnected events properly  
- ✅ Emits the right socket events (`handleCallConnected`, `handleCallDisconnected`)
- ✅ Stores call data correctly
- ✅ Transforms Acefone data to your format

## Recommended Next Steps

1. Create the two new API endpoints above
2. Test call initiation through frontend
3. Verify form opens automatically on connection
4. Test call termination works properly

The socket integration should work immediately with your existing Acefone webhook!