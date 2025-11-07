# filepath: media-literacy-voice-module/src/main.py
import argparse
from voice_module.pipeline import VoiceModulePipeline

def main():
    parser = argparse.ArgumentParser(description="AI-Powered Media Literacy Assistant Voice Module")
    parser.add_argument('--text', type=str, help='Text to convert to speech')
    parser.add_argument('--audio', type=str, help='Audio file to transcribe to text')
    
    args = parser.parse_args()
    
    pipeline = VoiceModulePipeline()
    
    if args.text:
        print("Converting text to speech...")
        pipeline.process_text_to_speech(args.text)
    
    if args.audio:
        print("Transcribing audio to text...")
        transcription = pipeline.process_speech_to_text(args.audio)
        print(f"Transcription: {transcription}")

if __name__ == "__main__":
    main()