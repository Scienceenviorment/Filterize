import { FFT } from 'fft.js';
import { getAudioData } from '../utils/audio';

export function spectralAnalysis(audioBuffer: Float32Array, sampleRate: number): Float32Array {
    const fftSize = 2048;
    const fft = new FFT(fftSize);
    const spectrum = new Float32Array(fftSize / 2);

    const audioData = getAudioData(audioBuffer);
    const complexSpectrum = fft.createComplexArray();

    fft.realTransform(complexSpectrum, audioData);
    fft.completeSpectrum(complexSpectrum);

    for (let i = 0; i < spectrum.length; i++) {
        spectrum[i] = Math.sqrt(complexSpectrum[i * 2] ** 2 + complexSpectrum[i * 2 + 1] ** 2);
    }

    return spectrum;
}