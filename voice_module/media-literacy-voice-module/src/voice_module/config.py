# filepath: media-literacy-voice-module/src/voice_module/config.py

class Config:
    """Configuration settings for the voice module."""
    
    # API keys
    GOOGLE_TTS_API_KEY = "your_google_tts_api_key"
    GOOGLE_STT_API_KEY = "your_google_stt_api_key"
    
    # Model paths
    TTS_MODEL_PATH = "models/pretrained/tts_model"
    STT_MODEL_PATH = "models/pretrained/stt_model"
    
    # Other constants
    AUDIO_SAMPLE_RATE = 16000
    AUDIO_FORMAT = "wav"
    MAX_AUDIO_LENGTH = 10  # in seconds

    @staticmethod
    def get_tts_api_key():
        return Config.GOOGLE_TTS_API_KEY

    @staticmethod
    def get_stt_api_key():
        return Config.GOOGLE_STT_API_KEY

    @staticmethod
    def get_tts_model_path():
        return Config.TTS_MODEL_PATH

    @staticmethod
    def get_stt_model_path():
        return Config.STT_MODEL_PATH

    @staticmethod
    def get_audio_sample_rate():
        return Config.AUDIO_SAMPLE_RATE

    @staticmethod
    def get_audio_format():
        return Config.AUDIO_FORMAT

    @staticmethod
    def get_max_audio_length():
        return Config.MAX_AUDIO_LENGTH