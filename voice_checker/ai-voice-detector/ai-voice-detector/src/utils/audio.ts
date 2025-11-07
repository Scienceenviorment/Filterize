import { AudioBuffer } from 'web-audio-api';

export function convertAudioFormat(buffer: AudioBuffer, targetSampleRate: number): AudioBuffer {
    const offlineContext = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, targetSampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start(0);
    return offlineContext.startRendering();
}

export function handleAudioBuffer(buffer: AudioBuffer): Float32Array {
    return buffer.getChannelData(0);
}

export function mergeAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const outputBuffer = new AudioBuffer({
        length: totalLength,
        numberOfChannels: buffers[0].numberOfChannels,
        sampleRate: buffers[0].sampleRate
    });

    let offset = 0;
    buffers.forEach(buffer => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            outputBuffer.copyToChannel(buffer.getChannelData(channel), channel, offset);
        }
        offset += buffer.length;
    });

    return outputBuffer;
}