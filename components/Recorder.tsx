import React, { useEffect, useState } from 'react';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { renderToStaticMarkup } from 'react-dom/server';
import dynamic from 'next/dynamic';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import ChatInput from './ChatInput';
import Skelton from './layouts/Skelton';
import Toggle from './toggleButtons/Toggle';
import Select from 'react-select';
import ReactSelect from 'react-select';
import {
  languageModelOptions,
  roleModelOptions,
  characterModelOptions,
  wordsLongOptions,
} from '../lib/modelsForGPT';
// import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
// import LightProps from 'react-syntax-highlighter';
// import Style from 'react-syntax-highlighter/dist/esm/styles/hljs';
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';

const SyntaxHighlighter = dynamic(
  async () => {
    const { Light } = await import('react-syntax-highlighter');
    return Light;
  },
  { ssr: false }
);

// const darcula = dynamic(
//   async () => {
//     const { darcula } = await import(
//       'react-syntax-highlighter/dist/esm/styles/hljs'
//     );
//     return darcula;
//   },
//   { ssr: false }
// );

interface Message {
  role: string;
  content: string;
}

interface AudioData {
  audioUrl: string | null;
}

interface MessageSchema {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const Recorder: React.FC = () => {
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [audioArray, setAudioArray] = useState<AudioData[]>([]);
  const [sentGTTS, setSentGTTS] = useState<boolean>(false);
  const [voiceModel, setVoiceModel] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [charactor, setCharactor] = useState<string>('');
  const [wordLong, setWordLong] = useState<string>('');

  const combinedArray = messageArray.map((message, index) => {
    const audio = audioArray[index]?.audioUrl || null;

    return { ...message, audioUrl: audio };
  });

  const botContext = `you have to act like a ${role}. your response is always within ${wordLong}.`;

  useEffect(() => {
    if (
      messageArray.length > 0 &&
      messageArray[messageArray.length - 1].role === 'system'
    )
      return;
    if (
      messageArray.length > 0 &&
      messageArray[messageArray.length - 1].role !== 'assistant'
    ) {
      getResFromChatGPTAndGTTS();
      // setSentGTTS(false);
    }
  }, [messageArray]);

  //? get from google text to speech
  const getResFromGTTS = async (text: string) => {
    try {
      const response = await fetch('/api/googleTToS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, voiceModel: voiceModel }),
      });
      if (response.ok) {
        const audioContent = await response.arrayBuffer();
        const audioBlob = new Blob([audioContent], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();
        return audioUrl;
      }
    } catch (error) {
      console.error('Error fetching synthesized speech:', error);
    }
  };

  //? get response from chatGPT
  const getResFromChatGPT = async () => {
    setLoading(true);
    try {
      console.log('messagesArray in gptRequest fn', messageArray);
      const toChatGPT = await fetchWithRetry('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messageArray,
        }),
      });

      const res = await toChatGPT.json();
      if (res.content) {
        return res;
      }
    } catch (error) {
      console.error('Error at getResFromChatGPT', error);
      setError(error.message);
      setLoading(false);
    }
  };

  //? get response from chatGPT and GTTS
  const getResFromChatGPTAndGTTS = async () => {
    setLoading(true);
    setError('');
    // try {
    //   console.log('messagesArray in gptRequest fn', messageArray);
    //   const toChatGPT = await fetchWithRetry('/api/chatgpt', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       model: 'gpt-3.5-turbo',
    //       messages: messageArray,
    //     }),
    //   });

    //   const res = await toChatGPT.json();
    try {
      const res = await getResFromChatGPT();
      console.log('🚀 ~ getResFromChatGPTAndGTTS ~ resFromChatGPT:', res);

      if (res.content && sentGTTS) {
        setMessageArray((prev) => [...prev, res]);
        const newAudio = { audioUrl: null };
        const audio = await getResFromGTTS(res.content);
        newAudio.audioUrl = audio;
        setAudioArray((prev) => [...prev, newAudio]);
      } else if (res.content && !sentGTTS) {
        setMessageArray((prev) => [...prev, res]);
        setAudioArray((prev) => [...prev, { audioUrl: null }]);
      }
      setLoading(false);

      console.log(res);
    } catch (error) {
      console.error('Error at getResFromChatGPTAndGTTS', error);
      setLoading(false);
    }
  };

  //? updataMessageArray from recording
  const updateMessageFromWhisper = async (userMessage) => {
    const userMessageData = {
      role: 'user',
      content: userMessage,
    };
    setMessageArray((prev) => [...prev, userMessageData]);
  };

  //? record and update
  const recording = async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioArray((prev) => [...prev, { audioUrl: audioUrl }]);
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });
      const { text, error } = await response.json();

      updateMessageFromWhisper(text);
      setError(error);
    } catch (error) {
      setError(error);
      console.log('Error:', error);
    }
  };

  //?messageStyle depending on role
  const messageStyles = (role: string) => {
    if (role === 'user') {
      return 'bg-lime-200 text-black px-8 py-4 rounded-lg ';
    } else if (role === 'assistant') {
      return 'bg-gray-200 text-black px-8 py-4 rounded-lg ';
    } else {
      return 'bg-orange-200 text-black px-8 py-4 rounded-lg ';
    }
  };

  //? formatCodeSnippets
  const formatCodeSnippets = (content: string) => {
    const codeSnippetRegex = /```([\s\S]*?)```/g;
    return content.replace(codeSnippetRegex, (match, code) => {
      const highlightedCode = (
        <SyntaxHighlighter language="javascript">
          {code.trim()}
        </SyntaxHighlighter>
      );
      return renderToStaticMarkup(highlightedCode);
    });
  };

  //? to stop plyaback
  // const stopAudio = () => {
  //   if (playingAudio) {
  //     playingAudio.pause();
  //     playingAudio.currentTime = 0;
  //   }
  // };

  return (
    <>
      <div className="flex-1 space-y-6 px-4 pt-10 pb-60 overflow-auto overflow-x-hidden">
        {combinedArray.map((message, index) => (
          <div key={index} className={messageStyles(message.role)}>
            <div
              dangerouslySetInnerHTML={{
                __html: formatCodeSnippets(message.content),
              }}
              className="text-xl"
            ></div>
            {message.role === 'system' && (
              <p className="px-4 py-2 mt-2 bg-amber-300 w-1/5">
                character setting
              </p>
            )}
            {message.audioUrl && (
              <div className="flex py-4">
                <audio controls className="h-10">
                  <source src={message.audioUrl} type="audio/mpeg" />
                </audio>
                {/* {playingAudio && (
                    <button
                      onClick={() => {
                        stopAudio();
                        setPlayingAudio(null);
                      }}
                    >
                      Stop
                    </button>
                  )} */}
              </div>
            )}
          </div>
        ))}
        {loading && <Skelton />}
        {error && (
          <p className="text-white">
            <span className="text-red-400 font-semibold">Error: </span>
            {error}
          </p>
        )}
      </div>{' '}
      <div className="">
        {/* GTTS setting */}
        <div className="flex justify-between items-center space-x-2 bg-gray-500 p-3 rounded-t-md">
          <div className="flex justify-center items-center space-x-4">
            {' '}
            <Select
              options={languageModelOptions}
              menuPlacement="top"
              onChange={(e) => setVoiceModel(e.value)}
            />
            <Toggle setSentGTTS={setSentGTTS} />
          </div>
          <div className="flex justify-end flex-1  items-center space-x-4">
            <Select
              placeholder="Role"
              styles={{
                control: (styles) => ({
                  ...styles,
                  width: '200px',
                }),
              }}
              options={roleModelOptions}
              menuPlacement="top"
              onChange={(e) => setRole(e.value)}
            />
            <Select
              placeholder="How long do you want to respond?"
              styles={{
                control: (styles) => ({
                  ...styles,
                  width: '250pxpx',
                }),
              }}
              options={wordsLongOptions}
              menuPlacement="top"
              onChange={(e) => setWordLong(e.value)}
            />
            <button
              className="px-4 py-2 bg-lime-200 rounded-md hover:bg-lime-300 active:bg-lime-400 focus:bg-lime-300 transition duration-200"
              onClick={() => {
                if (!role && !wordLong) return;
                const roleText = role && `you have to act like a ${role}.`;
                const wordLongText =
                  wordLong && `your response is always within ${wordLong}.`;

                setMessageArray((prev) => [
                  ...prev,
                  { role: 'system', content: `${roleText}${wordLongText}` },
                ]);
                setAudioArray((prev) => [...prev, { audioUrl: null }]);
              }}
            >
              Set Role
            </button>
          </div>
        </div>

        {/* input area */}
        <div className="flex flex-col items-center justify-center z-50   w-full  bg-gray-100 ">
          <div className="flex justify-center items-center space-x-1 px-2 sm:px-8 w-full">
            <ChatInput
              updateMessageFromWhisper={updateMessageFromWhisper}
              setAudioArray={setAudioArray}
            />
            <AudioRecorder
              onRecordingComplete={(audioBlob) => recording(audioBlob)}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Recorder;
