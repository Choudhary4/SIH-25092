# voice_agent/main.py

import os
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from agents.llm_handler import LLMHandler
from agents.text_to_speech import TextToSpeech
from agents.session_manager import SessionManager

load_dotenv()

app = FastAPI(title="Voice Agent API")

# Enable CORS for React frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize modules
llm = LLMHandler()
tts = TextToSpeech()
sessions = SessionManager()

@app.get("/")
async def root():
    return {"message": "Voice Agent API is running"}

@app.post("/chat")
async def chat_endpoint(payload: dict = Body(...)):
    """
    REST endpoint for voice chat.
    Receives JSON: { "session_id": "...", "text": "...", "response_format": "audio|json" }
    Returns MP3 audio response by default, or JSON with text and audio URL if response_format=json
    """
    user_text = payload.get("text", "").strip()
    session_id = payload.get("session_id", "default_session")
    response_format = payload.get("response_format", "audio")

    if not user_text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Maintain session context
    sessions.create_session(session_id)
    sessions.append_message(session_id, "user", user_text)

    # Query the LLM
    response_text = llm.ask_llm(user_text, session_id=session_id)
    sessions.append_message(session_id, "assistant", response_text)

    # Convert response to speech
    audio_result = tts.synthesize(response_text)
    # Handle different return types from TTS
    if hasattr(audio_result, 'read'):
        # File-like object
        audio_bytes = audio_result.read()
    elif hasattr(audio_result, '__iter__') and not isinstance(audio_result, (str, bytes)):
        # Generator/iterator - consume chunks
        audio_chunks = []
        for chunk in audio_result:
            if isinstance(chunk, bytes):
                audio_chunks.append(chunk)
            elif hasattr(chunk, 'read'):
                audio_chunks.append(chunk.read())
        audio_bytes = b''.join(audio_chunks)
    elif isinstance(audio_result, bytes):
        # Already bytes
        audio_bytes = audio_result

    if response_format == "json":
        # Return JSON with both text and audio
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "text": response_text,
            "audio_base64": audio_base64,
            "session_id": session_id
        }
    else:
        # Return audio file (default behavior)
        return Response(
            content=audio_bytes,
            media_type="audio/mp3",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )

@app.post("/chat/text")
async def text_chat_endpoint(payload: dict = Body(...)):
    """
    REST endpoint for text-only chat.
    Receives JSON: { "session_id": "...", "text": "..." }
    Returns JSON with text response only.
    """
    user_text = payload.get("text", "").strip()
    session_id = payload.get("session_id", "default_session")

    if not user_text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Maintain session context
    sessions.create_session(session_id)
    sessions.append_message(session_id, "user", user_text)

    # Query the LLM
    response_text = llm.ask_llm(user_text, session_id=session_id)
    sessions.append_message(session_id, "assistant", response_text)

    return {
        "text": response_text,
        "session_id": session_id
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Voice Agent API is operational"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
