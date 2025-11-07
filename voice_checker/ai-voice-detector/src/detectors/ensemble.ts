import { AIVoiceDetector } from './ai-voice-detector';
import { Model } from './model';

export class EnsembleDetector {
    private detectors: AIVoiceDetector[];

    constructor(detectors: AIVoiceDetector[]) {
        this.detectors = detectors;
    }

    public async detect(audioInput: Buffer): Promise<boolean> {
        const results = await Promise.all(this.detectors.map(detector => detector.detect(audioInput)));
        return this.combineResults(results);
    }

    private combineResults(results: boolean[]): boolean {
        // Simple majority voting
        const trueCount = results.filter(result => result).length;
        return trueCount > Math.floor(this.detectors.length / 2);
    }
}