# Voice Agent Test Script

This script helps you test the voice agent integration step by step.

## Prerequisites Check

### 1. Buddy Agent Server (Port 8000)
Open Terminal 1 and run:
```bash
cd buddy
python main.py
```

Expected output:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy","message":"Voice Agent API is operational"}
```

### 2. Main Server (Port 5000)  
Open Terminal 2 and run:
```bash
cd server
npm run dev
```

### 3. Frontend (Port 5173)
Open Terminal 3 and run:  
```bash
cd client/client
npm run dev
```

## Test Procedures

### Test 1: Text Mode
1. Open http://localhost:5173 in browser
2. Open DevTools → Console  
3. Ensure "Text Mode" is selected (not voice mode)
4. Type: "I'm feeling a bit anxious today"
5. Send message

**Expected Console Output:**
```
🤖 Buddy Chat Component Loaded
📊 Environment: {...}
🏥 Buddy agent health check: Connected
💬 Sending message: I'm feeling a bit anxious today | Voice Mode: false
📝 Using buddy text agent...
📡 Text agent response status: 200
✅ Text agent response: {text: "...", session_id: "..."}
```

### Test 2: Voice Mode
1. Click "Voice Mode" button (should show 🎤 Voice Mode)
2. Click microphone button  
3. Say: "Hello Buddy, how are you?"
4. Wait for response

**Expected Console Output:**
```
🎤 Voice recognition captured: Hello Buddy, how are you?
🔄 Sending to buddy voice agent...
📡 Buddy API response status: 200
✅ Buddy API response data: {text: "...", audio_base64: "...", session_id: "..."}
🔊 Processing audio response...
▶️ Playing audio response...
🗑️ Audio URL cleaned up
```

**Expected Behavior:**
- You should hear Buddy's voice response
- Audio player controls should appear in chat
- Both text and audio should be present

### Test 3: Fallback Behavior
1. Stop buddy agent server (Ctrl+C in Terminal 1)
2. Try sending a text message
3. Should fallback to main server

**Expected Console Output:**
```
❌ Text agent request failed: TypeError: Failed to fetch
🔄 Falling back to original server API...
✅ Fallback API response: {...}
```

## Connection Status Indicators

In the chat header, you should see:
- **Server: Online • Buddy: Online** (All systems working)
- **Server: Online • Buddy: Offline** (Buddy agent down, fallback active)
- **Server: Offline • Buddy: Online** (Main server down, buddy only)
- **Server: Online • Buddy: Checking...** (Health check in progress)

## Troubleshooting Common Issues

### 1. "Buddy: Offline" Status
```bash
# Check if buddy agent is running
curl http://localhost:8000/health

# If not responding, start buddy agent
cd buddy
python main.py
```

### 2. Voice Recognition Not Working
- Check browser permissions (microphone)
- Use Chrome/Safari (better WebSpeech support)
- Check console for recognition errors

### 3. Audio Not Playing
- Check browser audio permissions
- Verify ElevenLabs API key in buddy/.env
- Check console for audio processing errors

### 4. CORS Errors
- Ensure buddy agent has CORS enabled (already configured)
- Check if all ports are correct

### 5. No Response from Any Service
- Verify all three services are running
- Check network connectivity
- Review environment variables

## API Key Requirements

### OpenRouter API Key
Get from: https://openrouter.ai/
```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### ElevenLabs API Key  
Get from: https://elevenlabs.io/
```
ELEVENLABS_API_KEY=sk_xxxxx
```

## Success Criteria

✅ Text messages get responses from buddy agent  
✅ Voice recognition captures speech accurately
✅ Voice responses include both text and audio
✅ Audio plays automatically in browser
✅ Connection status shows "Buddy: Online"
✅ Fallback works when buddy agent is offline
✅ All API calls logged in console with clear indicators

If all tests pass, your voice agent integration is working correctly!