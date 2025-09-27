# agents/llm_handler.py

import os
import requests
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# Load OpenRouter configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable not set!")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = os.getenv("MODEL_NAME", "deepseek/deepseek-chat-v3.1:free")

# Default system prompt for mental health supporter
DEFAULT_SYSTEM_PROMPT = (
    "You are a compassionate, empathetic mental health supporter. "
    "Your role is to provide thoughtful, safe, and non-judgmental guidance to users who may be experiencing emotional distress, anxiety, depression, or other mental health challenges. "
    "Always listen actively, validate their feelings, and offer practical self-care suggestions. "
    "Encourage users to seek professional help from licensed therapists, counselors, or crisis hotlines when they display signs of severe distress, suicidal ideation, or crisis indicators. "
    "Remind users that you are not a replacement for professional mental health services. "
    "Be warm, supportive, and use language that promotes hope and healing. "
    "If someone is in immediate danger, always direct them to emergency services or crisis hotlines."
)

class LLMHandler:
    """
    Handles LLM queries via OpenRouter API.
    Manages per-session conversation history with mental health supporter system prompt.
    """

    def __init__(self):
        # session_id -> list of {"role":..., "content":...}
        self.session_histories: Dict[str, List[Dict[str, str]]] = {}

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        return self.session_histories.get(session_id, [])

    def add_to_history(self, session_id: str, role: str, content: str):
        if session_id not in self.session_histories:
            self.session_histories[session_id] = []
        self.session_histories[session_id].append({"role": role, "content": content})

    def ask_llm(
        self,
        user_query: str,
        session_id: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Send a chat completion request to OpenRouter.
        - user_query: the user's message text
        - session_id: identifier for conversation history
        - system_prompt: overrides default mental health prompt
        """
        prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
        messages = [{"role": "system", "content": prompt}]

        if session_id:
            messages.extend(self.get_history(session_id))

        messages.append({"role": "user", "content": user_query})

        payload = {
            "model": MODEL_NAME,
            "messages": messages,
            "temperature": 0.8,
            "max_tokens": 600,
            "stream": False
        }
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "X-Title": "Mental Health Support Agent"
        }

        try:
            resp = requests.post(
                OPENROUTER_API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            resp.raise_for_status()
            data = resp.json()
            assistant_msg = data["choices"][0]["message"]["content"].strip()
        except Exception as exc:
            assistant_msg = f"Error contacting LLM: {exc}"

        # Update history
        if session_id:
            self.add_to_history(session_id, "user", user_query)
            self.add_to_history(session_id, "assistant", assistant_msg)

        return assistant_msg


# Quick check when running this module directly
if __name__ == "__main__":
    handler = LLMHandler()
    resp = handler.ask_llm(
        "I've been feeling really anxious and overwhelmed lately. I don't know what to do.",
        session_id="test_session"
    )
    print("LLMHandler test response:\n", resp)
