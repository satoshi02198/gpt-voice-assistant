import fetch from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Message {
  role: string;
  content: string;
}

interface Choice {
  message: Message;
}

interface OpenAIResponse {
  choices: Choice[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: req.body.messages,
      }),
    });

    const { choices, error } = (await response.json()) as OpenAIResponse;

    if (response.ok) {
      res.json(choices[0].message);
    } else {
      console.error('Error from OpenAI API:', error);
      res.status(500).json({ error: error });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
