# media-literacy-voice-module

## Overview
The Media Literacy Voice Module is an AI-powered assistant designed to enhance media literacy through voice interactions. This project integrates text-to-speech (TTS) and speech-to-text (STT) functionalities to provide an interactive experience for users.

## Project Structure
```
media-literacy-voice-module
├── src
│   ├── voice_module
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── tts.py
│   │   ├── stt.py
│   │   ├── pipeline.py
│   │   └── utils.py
│   └── main.py
├── models
│   └── pretrained
├── tests
│   ├── test_tts.py
│   └── test_stt.py
├── scripts
│   └── start.sh
├── docs
│   └── architecture.md
├── pyproject.toml
├── requirements.txt
├── setup.cfg
└── README.md
```

## Installation
To set up the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd media-literacy-voice-module
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up any necessary environment variables as specified in `src/voice_module/config.py`.

## Usage
To run the application, use the provided shell script:
```
scripts/start.sh
```

This will start the Flask server for the backend and the React application for the frontend.

## Testing
Unit tests are provided for both the TextToSpeech and SpeechToText classes. To run the tests, execute:
```
pytest tests/
```

## Documentation
For detailed architecture and design decisions, refer to `docs/architecture.md`.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.