import { client } from '../../../lib/clients/googleTextToSpeech';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    let voiceReq = {};

    switch (req.body.voiceModel) {
      case 'en-GB-male':
        voiceReq = {
          languageCode: 'en-GB',
          name: 'en-GB-Standard-B',
          ssmlGender: 'MALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'en-GB-female':
        voiceReq = {
          languageCode: 'en-GB',
          name: 'en-GB-Standard-A',
          ssmlGender: 'FEMALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'en-US-male':
        voiceReq = {
          languageCode: 'en-US',
          name: 'en-US-Standard-A',
          ssmlGender: 'MALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'en-US-female':
        voiceReq = {
          languageCode: 'en-US',
          name: 'en-US-Standard-C',
          ssmlGender: 'FEMALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'en-AU-male':
        voiceReq = {
          languageCode: 'en-AU',
          name: 'en-AU-Standard-B',
          ssmlGender: 'MALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'en-AU-female':
        voiceReq = {
          languageCode: 'en-AU',
          name: 'en-AU-Standard-A',
          ssmlGender: 'FEMALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'ja-JP-male':
        voiceReq = {
          languageCode: 'ja-JP',
          name: 'ja-JP-Standard-C',
          ssmlGender: 'MALE',
          naturalSampleRateHertz: 24000,
        };
        break;
      case 'ja-JP-female':
        voiceReq = {
          languageCode: 'ja-JP',
          name: 'en-GB-Standard-A',
          ssmlGender: 'FEMALE',
          naturalSampleRateHertz: 24000,
        };
        break;
    }

    const request: any = {
      input: { text: req.body.text },
      //? select the language, voice, and audio encoding of the output
      voice: voiceReq,
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // //? to get voice model
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
