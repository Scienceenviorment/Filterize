import { AudioContext } from 'audio-context';
import { processAudioStream } from '../utils/stream-utils';
import { AIVoiceDetector } from '../detectors/ai-voice-detector';

class AudioStreamManager {
    private audioContext: AudioContext;
    private mediaStream: MediaStream | null;
    private voiceDetector: AIVoiceDetector;

    constructor() {
        this.audioContext = new AudioContext();
        this.mediaStream = null;
        this.voiceDetector = new AIVoiceDetector();
    }

    async startStream() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.audioContext.destination);
            this.processStream(source);
        } catch (error) {
            console.error('Error accessing audio stream:', error);
        }
    }

    private processStream(source: MediaStreamAudioSourceNode) {
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(this.audioContext.destination);

        processor.onaudioprocess = (event) => {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            const isAIVoice = this.voiceDetector.detect(inputBuffer);
            if (isAIVoice) {
                console.log('AI-generated voice detected!');
            }
        };
    }

    stopStream() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.audioContext.close();
            this.mediaStream = null;
        }
    }
}

export default AudioStreamManager;