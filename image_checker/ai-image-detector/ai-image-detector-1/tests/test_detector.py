import unittest
from src.detector import ImageDetector

class TestImageDetector(unittest.TestCase):

    def setUp(self):
        self.detector = ImageDetector()

    def test_load_image(self):
        result = self.detector.load_image('data/samples/real_images/sample_real.jpg')
        self.assertIsNotNone(result)

    def test_predict_real_image(self):
        self.detector.load_image('data/samples/real_images/sample_real.jpg')
        result = self.detector.predict()
        self.assertEqual(result, 'real')

    def test_predict_ai_generated_image(self):
        self.detector.load_image('data/samples/ai_generated_images/sample_ai.jpg')
        result = self.detector.predict()
        self.assertEqual(result, 'ai-generated')

if __name__ == '__main__':
    unittest.main()