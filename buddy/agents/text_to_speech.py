# text_to_speech.py

import os
from io import BytesIO
from typing import Optional

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import play, save

# Load environment variables from a .env file
load_dotenv()

class TextToSpeech:
    """
    Wrapper around ElevenLabs Text-to-Speech API.
    Provides methods to generate, play, and save speech audio.
    """

    def __init__(self, api_key: Optional[str] = None, voice: Optional[str] = "Xb7hH8MSUJpSbSDYk0k2"): # <-- CHANGED DEFAULT VOICE ID
        """
        Initialize the ElevenLabs client.
        :param api_key: ElevenLabs API key (defaults to ELEVENLABS_API_KEY env var).
        :param voice: Default voice name or ID to use.
        """
        # --- START CORRECTION ---
        # 1. Resolve the API key from argument or environment variable first.
        resolved_api_key = api_key or os.getenv("ELEVENLABS_API_KEY")

        # 2. Check if the key exists BEFORE initializing the client.
        if not resolved_api_key:
            raise ValueError("ELEVENLABS_API_KEY is not set in environment or passed to constructor.")
        
        # 3. Initialize the client with the validated key.
        self.client = ElevenLabs(api_key=resolved_api_key)
        # --- END CORRECTION ---

        # NOTE: The client's get_all() is now called successfully with the key.
        # This part of the logic handles voice selection:
        available_voices = self.client.voices.get_all().voices
        
        # Ensure the voice check uses the ID first, then name
        self.voice = voice
        voice_found = any(v.name == self.voice or v.voice_id == self.voice for v in available_voices)

        if not voice_found:
            print(f"Warning: Voice '{self.voice}' not found. Falling back to the first available voice.")
            self.voice = available_voices[0].voice_id if available_voices else None
            if not self.voice:
                raise ValueError("No voices available in your ElevenLabs account.")
        # Ensure that if the voice was found by name, we store its ID for the API call
        elif self.voice != "Alice": # Only check if the user/default passed a name
             try:
                self.voice = next(v.voice_id for v in available_voices if v.name == self.voice or v.voice_id == self.voice)
             except StopIteration:
                 # Should not happen due to the `any()` check above, but for safety
                 pass 

    def synthesize(
        self,
        text: str,
        voice: Optional[str] = None,
        model: str = "eleven_multilingual_v2"
    ) -> bytes:
        """
        Generate speech audio for the given text.
        :param text: Text to convert to speech.
        :param voice: Voice name or ID to use (defaults to instance's voice).
        :param model: TTS model ID to use.
        :return: Raw audio bytes (MP3 format).
        """
        audio_bytes = self.client.text_to_speech.convert(
            text=text,
            voice_id=voice or self.voice,
            model_id=model,
        )
        return audio_bytes

    def save_to_file(self, audio_bytes: bytes, file_path: str):
        """
        Save audio bytes to a file.
        :param audio_bytes: Raw bytes returned from synthesize().
        :param file_path: Destination file path (e.g., "output.mp3").
        """
        save(audio_bytes, file_path)
        print(f"Audio saved to {file_path}")


# Example usage when the script is run directly
if __name__ == "__main__":
    try:
        tts = TextToSpeech(voice="21m00Tcm4TlvDq8ikWAM")
        text = "Hello! This is a test of the updated ElevenLabs text-to-speech integration."
        
        # Synthesize audio
        audio_data = tts.synthesize(text)
        
        # Save the audio to a file
        tts.save_to_file(audio_data, "output.mp3")
        
        # Play the audio
        print("Playing audio...")
        play(audio_data)

    except Exception as e:
        print(f"An error occurred: {e}")

        