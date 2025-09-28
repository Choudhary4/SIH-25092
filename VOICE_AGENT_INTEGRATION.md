# Voice Agent Integration Setup

## Overview
The voice agent integration allows users to interact with Buddy (your mental health AI companion) through both text and voice modes. The system includes:

1. **Frontend (React)**: Chat interface with voice recognition and audio playback
2. **Buddy Agent (FastAPI)**: Voice processing backend with LLM integration
3. **Main Server (Node.js)**: Original chat server as fallback

## Architecture

```
User Input (Text/Voice) 
    ↓
Frontend (Chat.jsx)
    ↓
Voice Mode: Buddy Agent (FastAPI:8000) → LLM (OpenRouter) → TTS (ElevenLabs)
    ↓
Text Mode: Buddy Agent (FastAPI:8000) → LLM (OpenRouter)
    ↓
Fallback: Main Server (Node.js:5000) → Original chat logic
```

## Setup Instructions

### 1. Install Dependencies

#### Buddy Agent (Python)
```bash
cd buddy
pip install -r requirements.txt
```

#### Main Server (Node.js)
```bash
cd server
npm install
```

#### Frontend (React)
```bash
cd client/client
npm install
```

### 2. Environment Configuration

#### Buddy Agent (.env in buddy/ folder)
```
OPENROUTER_API_KEY=your_openrouter_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
MODEL_NAME=deepseek/deepseek-chat-v3.1:free
PORT=8000
```

#### Frontend (.env in client/client/ folder)
```
VITE_BUDDY_AGENT_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_VOICE_MODE=true
```

### 3. Start Services

#### Start Buddy Agent (Terminal 1)
```bash
cd buddy
python main.py
```

#### Start Main Server (Terminal 2)  
```bash
cd server
npm run dev
```

#### Start Frontend (Terminal 3)
```bash
cd client/client
npm run dev
```

## Usage

1. **Text Mode**: Type messages normally, get text responses
2. **Voice Mode**: Click the voice button to toggle, then:
   - Click microphone to speak
   - Get text + audio responses
   - Audio plays automatically

## API Endpoints

### Buddy Agent (localhost:8000)

- `POST /chat` - Voice chat (returns JSON with text + audio)
- `POST /chat/text` - Text-only chat
- `GET /health` - Health check

### Request Format
```json
{
  "text": "I'm feeling anxious",
  "session_id": "user_session_123",
  "response_format": "json"  // or "audio"
}
```

### Response Format
```json
{
  "text": "I understand you're feeling anxious...",
  "audio_base64": "base64_encoded_mp3_data",
  "session_id": "user_session_123"
}
```

## Troubleshooting

### Check Browser Console
All API calls are logged with emojis:
- 🎤 Voice input captured
- 📡 API requests/responses
- ✅ Success responses
- ❌ Error messages
- 🔊 Audio processing

### Common Issues

1. **Voice Recognition Not Working**
   - Ensure microphone permissions
   - Use Chrome/Safari (Firefox has limited support)

2. **Audio Not Playing**
   - Check browser audio permissions
   - Verify ElevenLabs API key
   - Check network/CORS settings

3. **API Connection Errors**
   - Verify buddy agent is running on port 8000
   - Check CORS settings
   - Confirm environment variables

### Debug Steps

1. Open browser DevTools → Console
2. Try sending a message in text mode
3. Switch to voice mode and try speaking
4. Check console for specific error messages
5. Verify all three services are running

## Features

- ✅ Text chat with mental health AI
- ✅ Voice input with speech recognition  
- ✅ Audio responses with TTS
- ✅ Session management
- ✅ Fallback to original server
- ✅ Crisis detection and escalation
- ✅ Comprehensive error handling
- ✅ Console logging for debugging