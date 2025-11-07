"""
Advanced Voice Analysis Module for Filterize AI
Integrates voice detection, deepfake detection, and speech analysis
"""

import os
import subprocess
import librosa
import numpy as np
import speech_recognition as sr
import pyttsx3
from pydub import AudioSegment
import tempfile
import logging
from typing import Dict, Any, Optional, List
import json

logger = logging.getLogger(__name__)

class VoiceAnalyzer:
    """Comprehensive voice analysis with AI detection capabilities"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.tts_engine = pyttsx3.init()
        self.voice_module_path = os.path.join(os.path.dirname(__file__), 'voice_module', 'media-literacy-voice-module')
        self.voice_checker_path = os.path.join(os.path.dirname(__file__), 'voice_checker', 'ai-voice-detector')
        
        # Configure TTS
        self.tts_engine.setProperty('rate', 150)
        self.tts_engine.setProperty('volume', 0.9)
        
        logger.info("🎤 Voice Analyzer initialized")
    
    def analyze_audio_file(self, file_path: str) -> Dict[str, Any]:
        """
        Comprehensive audio file analysis including deepfake detection
        """
        try:
            logger.info(f"🔍 Analyzing audio file: {file_path}")
            
            results = {
                'file_path': file_path,
                'analysis_type': 'voice_analysis',
                'timestamp': self._get_timestamp(),
                'success': False,
                'transcription': None,
                'audio_features': {},
                'deepfake_detection': {},
                'credibility_score': 0,
                'metadata': {}
            }
            
            # Basic audio analysis
            audio_analysis = self._analyze_audio_features(file_path)
            results['audio_features'] = audio_analysis
            
            # Speech-to-text transcription
            transcription = self._transcribe_audio(file_path)
            results['transcription'] = transcription
            
            # AI voice detection
            deepfake_results = self._detect_ai_voice(file_path)
            results['deepfake_detection'] = deepfake_results
            
            # Calculate credibility score
            credibility = self._calculate_voice_credibility(audio_analysis, deepfake_results)
            results['credibility_score'] = credibility
            
            results['success'] = True
            logger.info(f"✅ Voice analysis completed with {credibility}% credibility")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Voice analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'analysis_type': 'voice_analysis',
                'timestamp': self._get_timestamp()
            }
    
    def analyze_live_audio(self, duration: int = 5) -> Dict[str, Any]:
        """
        Analyze live audio from microphone
        """
        try:
            logger.info(f"🎙️ Starting live audio analysis for {duration} seconds")
            
            with sr.Microphone() as source:
                logger.info("🔧 Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                logger.info("🎧 Listening...")
                audio = self.recognizer.listen(source, timeout=duration, phrase_time_limit=duration)
            
            # Save temporary file for analysis
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
                with open(temp_path, 'wb') as f:
                    f.write(audio.get_wav_data())
            
            # Analyze the recorded audio
            results = self.analyze_audio_file(temp_path)
            results['analysis_type'] = 'live_voice_analysis'
            
            # Clean up
            os.unlink(temp_path)
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Live audio analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'analysis_type': 'live_voice_analysis',
                'timestamp': self._get_timestamp()
            }
    
    def _analyze_audio_features(self, file_path: str) -> Dict[str, Any]:
        """Extract audio features for analysis"""
        try:
            # Load audio file
            y, sr = librosa.load(file_path, sr=None)
            
            # Extract features
            features = {
                'duration': float(len(y) / sr),
                'sample_rate': int(sr),
                'channels': 1,  # librosa loads as mono by default
                'bit_depth': 16,  # assumed
            }
            
            # Advanced audio features
            features.update({
                'zero_crossing_rate': float(np.mean(librosa.feature.zero_crossing_rate(y))),
                'spectral_centroid': float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))),
                'spectral_rolloff': float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))),
                'tempo': float(librosa.beat.tempo(y=y, sr=sr)[0]),
            })
            
            # MFCC features (commonly used for voice analysis)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            features['mfcc_mean'] = [float(np.mean(mfcc)) for mfcc in mfccs]
            features['mfcc_std'] = [float(np.std(mfcc)) for mfcc in mfccs]
            
            return features
            
        except Exception as e:
            logger.error(f"❌ Audio feature extraction failed: {str(e)}")
            return {'error': str(e)}
    
    def _transcribe_audio(self, file_path: str) -> Optional[str]:
        """Convert speech to text"""
        try:
            # Convert to wav if needed
            audio = AudioSegment.from_file(file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
                audio.export(temp_path, format='wav')
            
            # Transcribe
            with sr.AudioFile(temp_path) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data)
            
            # Clean up
            os.unlink(temp_path)
            
            return text
            
        except sr.UnknownValueError:
            logger.warning("⚠️ Could not understand audio")
            return "Could not understand audio"
        except sr.RequestError as e:
            logger.error(f"❌ Speech recognition error: {str(e)}")
            return f"Speech recognition error: {str(e)}"
        except Exception as e:
            logger.error(f"❌ Transcription failed: {str(e)}")
            return None
    
    def _detect_ai_voice(self, file_path: str) -> Dict[str, Any]:
        """Detect if voice is AI-generated using available models"""
        try:
            # Basic AI voice detection using audio features
            features = self._analyze_audio_features(file_path)
            
            # Simple heuristic-based detection
            ai_indicators = []
            confidence_score = 100  # Start with human assumption
            
            # Check for unnatural patterns
            if 'zero_crossing_rate' in features:
                zcr = features['zero_crossing_rate']
                if zcr < 0.01 or zcr > 0.15:  # Unusual zero crossing rate
                    ai_indicators.append('unusual_zero_crossing_rate')
                    confidence_score -= 20
            
            if 'spectral_centroid' in features:
                sc = features['spectral_centroid']
                if sc < 500 or sc > 8000:  # Unusual spectral centroid
                    ai_indicators.append('unusual_spectral_characteristics')
                    confidence_score -= 15
            
            # Check MFCC patterns
            if 'mfcc_std' in features:
                mfcc_variations = features['mfcc_std']
                avg_variation = np.mean(mfcc_variations)
                if avg_variation < 1.0:  # Too little variation (AI-like)
                    ai_indicators.append('low_mfcc_variation')
                    confidence_score -= 25
            
            # Duration-based checks
            if 'duration' in features:
                duration = features['duration']
                if duration < 1.0:  # Very short clips often AI
                    ai_indicators.append('suspicious_duration')
                    confidence_score -= 10
            
            confidence_score = max(0, min(100, confidence_score))
            
            return {
                'is_ai_generated': confidence_score < 70,
                'confidence_score': confidence_score,
                'ai_indicators': ai_indicators,
                'detection_method': 'audio_feature_analysis',
                'human_likelihood': confidence_score
            }
            
        except Exception as e:
            logger.error(f"❌ AI voice detection failed: {str(e)}")
            return {
                'is_ai_generated': False,
                'confidence_score': 50,
                'error': str(e),
                'detection_method': 'fallback'
            }
    
    def _calculate_voice_credibility(self, audio_features: Dict, deepfake_results: Dict) -> int:
        """Calculate overall voice credibility score"""
        try:
            base_score = 85  # Start with good credibility
            
            # Factor in AI detection results
            if deepfake_results.get('is_ai_generated', False):
                ai_confidence = deepfake_results.get('confidence_score', 50)
                reduction = (100 - ai_confidence) * 0.6
                base_score -= reduction
            
            # Factor in audio quality
            if 'duration' in audio_features:
                duration = audio_features['duration']
                if duration < 2.0:  # Very short audio is less reliable
                    base_score -= 10
                elif duration > 60.0:  # Very long audio is more reliable
                    base_score += 5
            
            # Factor in feature quality
            if audio_features.get('error'):
                base_score -= 20
            
            return max(0, min(100, int(base_score)))
            
        except Exception as e:
            logger.error(f"❌ Credibility calculation failed: {str(e)}")
            return 50
    
    def text_to_speech(self, text: str, output_path: Optional[str] = None) -> str:
        """Convert text to speech"""
        try:
            if output_path is None:
                output_path = tempfile.mktemp(suffix='.wav')
            
            self.tts_engine.save_to_file(text, output_path)
            self.tts_engine.runAndWait()
            
            logger.info(f"✅ Text-to-speech saved to {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Text-to-speech failed: {str(e)}")
            raise e
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

# Global voice analyzer instance
voice_analyzer = VoiceAnalyzer()

def analyze_voice_content(content: str, content_type: str = 'file') -> Dict[str, Any]:
    """
    Analyze voice content
    Args:
        content: File path for file analysis, or duration for live analysis
        content_type: 'file' or 'live'
    """
    try:
        if content_type == 'live':
            duration = int(content) if content.isdigit() else 5
            return voice_analyzer.analyze_live_audio(duration)
        else:
            return voice_analyzer.analyze_audio_file(content)
    except Exception as e:
        logger.error(f"❌ Voice analysis error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'analysis_type': 'voice_analysis'
        }

if __name__ == "__main__":
    # Test the voice analyzer
    print("🎤 Testing Voice Analyzer...")
    
    # Test live audio (5 seconds)
    print("\n📡 Testing live audio analysis...")
    live_result = voice_analyzer.analyze_live_audio(5)
    print(f"Live analysis result: {json.dumps(live_result, indent=2)}")