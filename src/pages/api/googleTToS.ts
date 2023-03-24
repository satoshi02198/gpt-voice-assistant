import { client } from '../../../lib/clients/googleTextToSpeech';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const request = {
      input: { text: req.body.text },
      //? select the language, voice, and audio encoding of the output
      voice: { languageCode: 'en-US', ssmGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    try {
      const [response] = await client.synthesizeSpeech(request);
      const audioContent = response.audioContent;
      console.log('🚀 ~ handler ~ audioContent:', audioContent);
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
