# session_manager.py

import threading
from typing import Any, Dict, List, Optional

class SessionManager:
    """
    Thread-safe in-memory session manager for conversation context.
    Can be extended to use Redis or a database for persistence.
    """

    def __init__(self):
        # Protects access to session data
        self._lock = threading.Lock()
        # Maps session_id -> list of message dicts {"role": ..., "content": ...}
        self._sessions: Dict[str, List[Dict[str, Any]]] = {}

    def create_session(self, session_id: str) -> None:
        """
        Create a new session if it doesn't exist.
        """
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []

    def get_history(self, session_id: str) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieve the message history for a session.
        Returns None if session_id does not exist.
        """
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def append_message(self, session_id: str, role: str, content: Any) -> None:
        """
        Append a message to the session history.
        role: 'user' or 'assistant' (or 'system')
        content: the message text or data
        """
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []
            self._sessions[session_id].append({"role": role, "content": content})

    def clear_session(self, session_id: str) -> None:
        """
        Clear the history for a given session.
        """
        with self._lock:
            if session_id in self._sessions:
                self._sessions.pop(session_id, None)

    def delete_session(self, session_id: str) -> None:
        """
        Permanently delete a session and its history.
        """
        with self._lock:
            self._sessions.pop(session_id, None)

# Example usage
if __name__ == "__main__":
    sm = SessionManager()
    sid = "user123"
    sm.create_session(sid)
    sm.append_message(sid, "user", "Hello!")
    sm.append_message(sid, "assistant", "Hi there, how can I help?")
    print("History:", sm.get_history(sid))
    sm.clear_session(sid)
    print("After clear:", sm.get_history(sid))