import { AIVoiceDetector } from '../../src/detectors/ai-voice-detector';
import { createMockAudioInput } from '../mocks/audio-input.mock';

describe('AIVoiceDetector', () => {
    let detector: AIVoiceDetector;

    beforeEach(() => {
        detector = new AIVoiceDetector();
    });

    test('should initialize correctly', () => {
        expect(detector).toBeDefined();
    });

    test('should detect AI-generated voice', async () => {
        const mockAudioInput = createMockAudioInput('ai-generated-voice.wav');
        const result = await detector.detect(mockAudioInput);
        expect(result).toBe(true);
    });

    test('should not detect AI-generated voice for human voice', async () => {
        const mockAudioInput = createMockAudioInput('human-voice.wav');
        const result = await detector.detect(mockAudioInput);
        expect(result).toBe(false);
    });

    test('should handle errors gracefully', async () => {
        const mockAudioInput = createMockAudioInput('invalid-input.wav');
        await expect(detector.detect(mockAudioInput)).rejects.toThrow('Error processing audio input');
    });
});