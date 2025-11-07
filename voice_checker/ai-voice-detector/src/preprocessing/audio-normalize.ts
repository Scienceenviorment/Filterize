import { AudioBuffer } from 'web-audio-api';

/**
 * Normalizes the audio buffer to ensure consistent volume levels.
 * @param {AudioBuffer} audioBuffer - The audio buffer to normalize.
 * @returns {AudioBuffer} - The normalized audio buffer.
 */
export function normalizeAudio(audioBuffer: AudioBuffer): AudioBuffer {
    const channelData = audioBuffer.getChannelData(0);
    const maxAmplitude = Math.max(...channelData.map(Math.abs));

    if (maxAmplitude === 0) {
        return audioBuffer; // Avoid division by zero
    }

    const normalizationFactor = 1 / maxAmplitude;
    const normalizedBuffer = audioBuffer.copyFromChannel(channelData, 0);

    for (let i = 0; i < normalizedBuffer.length; i++) {
        normalizedBuffer[i] *= normalizationFactor;
    }

    return normalizedBuffer;
}