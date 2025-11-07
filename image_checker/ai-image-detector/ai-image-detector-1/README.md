# AI Image Detector

This project is an AI-based module designed to detect whether an image is AI-generated or real. It utilizes various machine learning techniques and models to analyze images and provide predictions.

## Overview

The AI Image Detector project consists of several components:

- **Image Detection**: The core functionality is provided by the `ImageDetector` class, which handles image loading, prediction, and evaluation.
- **Model Management**: The `AIModel` class is responsible for loading pre-trained models and making predictions.
- **Image Preprocessing**: Functions for resizing, normalizing, and augmenting images to prepare them for analysis.
- **Utilities**: Helper functions for logging and configuration management.

## Installation

To install the required dependencies, run:

```
pip install -r requirements.txt
```

## Usage

1. Import the necessary classes and functions from the `src` package.
2. Load an image using the `ImageDetector` class.
3. Use the `predict` method to determine if the image is AI-generated or real.

### Example

```python
from src.detector import ImageDetector

detector = ImageDetector()
detector.load_image('path/to/image.jpg')
result = detector.predict()
print(result)
```

## Directory Structure

```
ai-image-detector
├── src
│   ├── __init__.py
│   ├── detector.py
│   ├── model.py
│   ├── preprocessing.py
│   └── utils.py
├── tests
│   ├── __init__.py
│   └── test_detector.py
├── data
│   ├── models
│   │   └── pretrained_model.h5
│   └── samples
│       ├── real_images
│       └── ai_generated_images
├── requirements.txt
├── setup.py
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.