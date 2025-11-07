import { AIVoiceDetector } from './detectors/ai-voice-detector';
import { initializeAudioProcessing } from './realtime/stream';
import { setupCLI } from './cli';

const main = async () => {
    // Initialize audio processing
    await initializeAudioProcessing();

    // Setup command-line interface
    setupCLI();

    // Create an instance of the AI Voice Detector
    const detector = new AIVoiceDetector();

    // Start the detection process
    detector.startDetection();
};

main().catch(err => {
    console.error('Error starting the application:', err);
});