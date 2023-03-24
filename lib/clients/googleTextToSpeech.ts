import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

export const client = new TextToSpeechClient({ credentials });
