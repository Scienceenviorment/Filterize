import { AudioBuffer } from 'web-audio-api';

export function reduceNoise(audioBuffer: AudioBuffer, noiseReductionLevel: number): AudioBuffer {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    const outputBuffer = new AudioBuffer({
        length: length,
        numberOfChannels: numberOfChannels,
        sampleRate: sampleRate
    });

    for (let channel = 0; channel < numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = outputBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
            // Simple noise reduction algorithm
            outputData[i] = inputData[i] > noiseReductionLevel ? inputData[i] - noiseReductionLevel : 0;
        }
    }

    return outputBuffer;
}