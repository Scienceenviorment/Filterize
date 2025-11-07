import { Command } from 'commander';
import { startStream } from './realtime/stream';
import { startRecording } from './realtime/recorder';

const program = new Command();

program
  .name('ai-voice-detector')
  .description('CLI for detecting AI-generated voices and processing audio inputs')
  .version('1.0.0');

program
  .command('stream')
  .description('Start live audio streaming for voice detection')
  .action(() => {
    startStream();
  });

program
  .command('record')
  .description('Record live audio input for processing')
  .action(() => {
    startRecording();
  });

program.parse(process.argv);