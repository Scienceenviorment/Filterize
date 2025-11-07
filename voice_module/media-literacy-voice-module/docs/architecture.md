# Architecture of the Media Literacy Voice Module

## Overview
The Media Literacy Voice Module is designed to facilitate interaction through voice commands and responses, enhancing media literacy education. It integrates text-to-speech (TTS) and speech-to-text (STT) functionalities to create a seamless user experience.

## Components

### 1. Voice Module
- **TextToSpeech (tts.py)**: This class is responsible for converting text input into spoken audio. It includes methods for synthesizing speech from text.
- **SpeechToText (stt.py)**: This class handles the conversion of spoken audio into text. It provides methods for transcribing audio input.
- **VoiceModulePipeline (pipeline.py)**: This orchestrates the interaction between TTS and STT components. It manages the flow of data and ensures that inputs and outputs are processed correctly.

### 2. Configuration
- **config.py**: Contains all configuration settings, including API keys, model paths, and constants necessary for the operation of the voice module.

### 3. Utilities
- **utils.py**: Provides helper functions for tasks such as audio file handling, data preprocessing, and other common operations that support the main functionalities.

### 4. Main Application
- **main.py**: The entry point of the application. It initializes the voice module, sets up command-line argument parsing, and starts the necessary services.

## Data Flow
1. User provides voice input.
2. The SpeechToText class transcribes the audio into text.
3. The transcribed text is processed by the VoiceModulePipeline.
4. The TextToSpeech class synthesizes a response based on the processed input.
5. The audio response is played back to the user.

## Pretrained Models
The `models/pretrained` directory contains the necessary pretrained models for both TTS and STT functionalities, ensuring that the voice module can operate effectively without requiring extensive training from scratch.

## Testing
The project includes unit tests located in the `tests` directory:
- **test_tts.py**: Tests for the TextToSpeech class.
- **test_stt.py**: Tests for the SpeechToText class.

## Conclusion
This architecture provides a robust framework for developing an AI-powered media literacy assistant, leveraging voice interaction to enhance user engagement and learning outcomes.