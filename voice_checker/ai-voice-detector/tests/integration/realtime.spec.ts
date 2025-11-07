import { AIVoiceDetector } from '../../src/detectors/ai-voice-detector';
import { Stream } from '../../src/realtime/stream';
import { Recorder } from '../../src/realtime/recorder';

describe('Real-time Audio Processing Integration Tests', () => {
    let voiceDetector: AIVoiceDetector;
    let audioStream: Stream;
    let audioRecorder: Recorder;

    beforeAll(() => {
        voiceDetector = new AIVoiceDetector();
        audioStream = new Stream();
        audioRecorder = new Recorder();
    });

    afterAll(() => {
        audioStream.stop();
        audioRecorder.stop();
    });

    test('should detect AI-generated voice from live audio stream', async () => {
        audioStream.start();
        const result = await voiceDetector.detect(audioStream);
        expect(result).toBeDefined();
        expect(result.isAIVoice).toBe(true);
    });

    test('should record live audio input', async () => {
        audioRecorder.start();
        const recordedAudio = await audioRecorder.record();
        expect(recordedAudio).toBeDefined();
        expect(recordedAudio.length).toBeGreaterThan(0);
    });

    test('should process recorded audio and detect AI-generated voice', async () => {
        audioRecorder.start();
        const recordedAudio = await audioRecorder.record();
        const result = await voiceDetector.detect(recordedAudio);
        expect(result).toBeDefined();
        expect(result.isAIVoice).toBe(true);
    });
});