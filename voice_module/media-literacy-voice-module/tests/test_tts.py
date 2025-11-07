import unittest
from src.voice_module.tts import TextToSpeech

class TestTextToSpeech(unittest.TestCase):

    def setUp(self):
        self.tts = TextToSpeech()

    def test_synthesize(self):
        text = "Hello, this is a test."
        audio_output = self.tts.synthesize(text)
        self.assertIsNotNone(audio_output)
        self.assertIsInstance(audio_output, bytes)

if __name__ == '__main__':
    unittest.main()