import { client } from '../../../lib/clients/googleTextToSpeech';
import { NextApiRequest, NextApiResponse } from 'next';
// import ISynthesizeSpeechRequest from '@google-cloud/text-to-speech/build/src';
import { protos } from '@google-cloud/text-to-speech';

const SsmlVoiceGender = protos.google.cloud.texttospeech.v1.SsmlVoiceGender;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const request: any = {
      input: { text: req.body.text },
      //? select the language, voice, and audio encoding of the output
      voice: {
        // languageCode: 'ja-JP',
        // name: 'ja-JP-Standard-A',
        // ssmlGender: 'FEMALE',
        // naturalSampleRateHertz: 24000,
        languageCode: req.body.voiceModel,
        name: `${req.body.voiceModel}-Standard-B`,
        ssmlGender: 'MALE',
        naturalSampleRateHertz: 24000,
        //     languageCode:  'es-US' ,
        // name: 'es-US-Standard-A',
        // ssmlGender: 'FEMALE',
        // naturalSampleRateHertz: 24000
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // const [result] = await client.listVoices({});
    // const voices = result.voices;
    // console.log('🚀 ~ voices:', voices);

    try {
      const [response]: any = await client.synthesizeSpeech(request);

      const audioContent = response.audioContent;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioContent);
    } catch (err) {
      console.error('ERROR:', err);
      res.status(500).json({ error: 'Error synthesizing speech' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
