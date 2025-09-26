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
    REST endpoint for text-only chat.
    Receives JSON: { "session_id": "...", "text": "..." }
    Returns MP3 audio response.
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

    # Convert response to speech
    audio_buf = tts.synthesize(response_text)
    audio_bytes = audio_buf.read()

    return Response(
        content=audio_bytes,
        media_type="audio/mp3",
        headers={"Content-Disposition": "attachment; filename=response.mp3"}
    )

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
