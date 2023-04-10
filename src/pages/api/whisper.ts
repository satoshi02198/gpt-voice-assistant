const FormData = require('form-data');
import { withFileUpload } from 'next-multiparty';
import { PathLike, createReadStream } from 'fs';
import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, PersistentFile } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface WhisperResponse {
  text: string;
  error?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const form = new IncomingForm();

      await new Promise<void>((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
          try {
            if (err) {
              throw new Error('Error parsing form data');
            }

            const file = files.file;
            const voiceInput = fields.voiceInput;

            if (!file) {
              throw new Error('No file uploaded');
            }

            const formData = new FormData();

            if (Array.isArray(file)) {
              throw new Error('Multiple files are not supported');
            }

            formData.append(
              'file',
              createReadStream(file.filepath),
              'audio.webm'
            );
            formData.append('model', 'whisper-1');
            formData.append('language', voiceInput);
            const response = await fetch(
              'https://api.openai.com/v1/audio/transcriptions',
              {
                method: 'POST',
                headers: {
                  ...formData.getHeaders(),
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: formData,
              }
            );

            const { text, error } = (await response.json()) as WhisperResponse;
            if (response.ok) {
              res.status(200).json({ text: text });
            } else {
              console.log('OPEN AI ERROR:');
              console.log(error.message);
              res.status(400).send(new Error());
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } else {
      res.status(405).send('Method not allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
}

//? next-multiparty version
// export default withFileUpload(async (req: any, res: NextApiResponse) => {
//   const file = req.file;

//   if (!file) {
//     res.status(400).send('No file uploaded');
//     return;
//   }
//   // const voiceInput = req.body.voiceInput;

//   //? Create form data
//   const formData = new FormData();
//   formData.append('file', createReadStream(file.filepath), 'audio.webm');
//   formData.append('model', 'whisper-1');
//   formData.append('language', 'en');
//   const response = await fetch(
//     'https://api.openai.com/v1/audio/transcriptions',
//     {
//       method: 'POST',
//       headers: {
//         ...formData.getHeaders(),
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: formData,
//     }
//   );

//   const { text, error } = (await response.json()) as WhisperResponse;
//   if (response.ok) {
//     res.status(200).json({ text: text });
//   } else {
//     console.log('OPEN AI ERROR:');
//     console.log(error.message);
//     res.status(400).send(new Error());
//   }
// });
