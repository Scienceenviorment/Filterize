export interface AudioInput {
    id: string;
    type: 'microphone' | 'file';
    source: string;
}

export interface DetectionResult {
    isAIVoice: boolean;
    confidence: number;
    timestamp: Date;
}

export interface AudioProcessingOptions {
    normalize: boolean;
    noiseReduction: boolean;
    sampleRate: number;
}

export interface ModelConfig {
    modelPath: string;
    inputShape: number[];
    outputClasses: number;
}