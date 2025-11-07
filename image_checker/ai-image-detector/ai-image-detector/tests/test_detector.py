def test_load_image():
    detector = ImageDetector()
    image = detector.load_image('path/to/sample/image.jpg')
    assert image is not None, "Image should be loaded successfully"

def test_predict():
    detector = ImageDetector()
    detector.load_image('path/to/sample/image.jpg')
    prediction = detector.predict()
    assert prediction in ['AI-generated', 'Real'], "Prediction should be either 'AI-generated' or 'Real'"