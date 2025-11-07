class VoiceModulePipeline:
    def __init__(self, tts_model, stt_model):
        self.tts_model = tts_model
        self.stt_model = stt_model

    def process(self, input_text):
        # Convert text to speech
        audio_output = self.tts_model.synthesize(input_text)
        
        # Here you would typically play the audio or save it to a file
        # For now, we will just return the audio output
        return audio_output

    def transcribe_audio(self, audio_input):
        # Convert speech to text
        transcribed_text = self.stt_model.transcribe(audio_input)
        return transcribed_text