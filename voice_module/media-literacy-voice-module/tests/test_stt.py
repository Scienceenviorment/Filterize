import unittest
from src.voice_module.stt import SpeechToText

class TestSpeechToText(unittest.TestCase):

    def setUp(self):
        self.stt = SpeechToText()

    def test_transcribe(self):
        # Assuming we have a method to create a test audio file
        test_audio_file = "path/to/test/audio.wav"
        expected_transcription = "This is a test transcription."
        
        # Call the transcribe method
        transcription = self.stt.transcribe(test_audio_file)
        
        # Check if the transcription matches the expected output
        self.assertEqual(transcription, expected_transcription)

if __name__ == '__main__':
    unittest.main()