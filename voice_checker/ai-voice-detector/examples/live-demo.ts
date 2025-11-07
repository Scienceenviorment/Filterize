import { AIVoiceDetector } from '../src/detectors/ai-voice-detector';
import { AudioRecorder } from '../src/realtime/recorder';
import { StreamManager } from '../src/realtime/stream';

async function runLiveDemo() {
    const recorder = new AudioRecorder();
    const streamManager = new StreamManager();
    const voiceDetector = new AIVoiceDetector();

    // Start capturing audio
    recorder.start();

    // Process audio in real-time
    streamManager.on('audioData', async (audioData) => {
        const isAIVoice = await voiceDetector.detect(audioData);
        if (isAIVoice) {
            console.log('AI-generated voice detected!');
        } else {
            console.log('Human voice detected.');
        }
    });

    console.log('Live demo is running. Press Ctrl+C to stop.');
}

// Run the live demo
runLiveDemo().catch(console.error);