import React, { useEffect, useState } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { renderToStaticMarkup } from 'react-dom/server';
import dynamic from 'next/dynamic';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import ChatInput from '../../components/ChatInput';
import Skelton from '../../components/layouts/Skelton';

import SettingGTTS from '../../components/setting/SettingGTTS';
import SettingChatGPT from '../../components/setting/SettingChatGPT';
import { BarsArrowUpIcon, BarsArrowDownIcon } from '@heroicons/react/24/solid';
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

export interface Message {
  role: string;
  content: string;
}

export interface AudioData {
  audioUrl: string | null;
}

interface MessageSchema {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export default function Home() {
  //? react-audio-voice-recorder
  const { isRecording, isPaused, startRecording } = useAudioRecorder();
  //? control recorder outside of component
  const recorderControls = useAudioRecorder();
  //? for dropdown menu
  const [isOpen, setIsOpen] = useState(false);

  //? messages and Audios and combined
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [audioArray, setAudioArray] = useState<AudioData[]>([]);
  const combinedArray = messageArray.map((message, index) => {
    const audio = audioArray[index]?.audioUrl || null;

    return { ...message, audioUrl: audio };
  });

  //? settings for GTTS and Chat GPT
  const [sentGTTS, setSentGTTS] = useState<boolean>(false);
  const [voiceModel, setVoiceModel] = useState<string>('');
  const [voiceInput, setVoiceInput] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [wordLong, setWordLong] = useState<string>('');

  //? error and loading state
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

    try {
      //? first get response from chatGPT
      const res = await getResFromChatGPT();

      //? set Message Array if sentGTTS is true
      if (res.content && sentGTTS) {
        setMessageArray((prev) => [...prev, res]);
        const newAudio = { audioUrl: null };

        //? then get response from google text to speech and set AudioArray
        const audio = await getResFromGTTS(res.content);
        newAudio.audioUrl = audio;
        setAudioArray((prev) => [...prev, newAudio]);
      } else if (res.content && !sentGTTS) {
        setMessageArray((prev) => [...prev, res]);
        setAudioArray((prev) => [...prev, { audioUrl: null }]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error at getResFromChatGPTAndGTTS', error);
      setLoading(false);
    }
  };

  //? updataMessageArray from recording
  const updateMessageFromWhisper = async (userMessage: string) => {
    const userMessageData: MessageSchema = {
      role: 'user',
      content: userMessage,
    };
    setMessageArray((prev) => [...prev, userMessageData]);
  };

  //? record and update
  const recording = async (audioBlob: Blob) => {
    //? setAudioArray of user
    //? setAudioArray of assistant is in getResFromChatGPTAndGTTS()
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioArray((prev) => [...prev, { audioUrl: audioUrl }]);

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('voiceInput', voiceInput);

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });
      const { text, error } = await response.json();

      updateMessageFromWhisper(text);
      setError(error);
    } catch (error) {
      setError(error.message);
      console.log('Error in recording', error);
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
    <div className="flex flex-col max-w-7xl mx-auto h-screen overflow-hidden">
      <div className="flex-1 space-y-6 px-4 py-10 overflow-auto overflow-x-hidden">
        {combinedArray.map((message, index) => (
          <div key={index} className={messageStyles(message.role)}>
            <div
              dangerouslySetInnerHTML={{
                __html: formatCodeSnippets(message.content),
              }}
              className="text-xl"
            ></div>
            {message.role === 'system' && (
              <p className="px-4 py-2 mt-2 bg-amber-300 w-44  text-center">
                character setting
              </p>
            )}
            {message.audioUrl && (
              <div className="flex py-4">
                <audio controls className="h-10">
                  <source src={message.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </div>
        ))}

        {error && (
          <p className="text-white">
            <span className="text-red-400 font-semibold">Error: </span>
            {error}
          </p>
        )}
      </div>{' '}
      {loading && <Skelton />}
      {/* separate control for audiorecorder */}
      {/* <button
              className="bg-slate-300 py-2 px-4"
              onClick={recorderControls.startRecording}
            >
              start recording
            </button>
            <button
              className="bg-slate-300 py-2 px-4"
              onClick={recorderControls.stopRecording}
            >
              stop recording
            </button> */}
      <div className="">
        {/* GTTS setting */}
        <div className="hidden sm:flex sm:justify-between sm:items-center sm:space-x-2 bg-gray-300 sm:p-2 sm:rounded-t-md ">
          <SettingGTTS
            sentGTTS={sentGTTS}
            setVoiceModel={setVoiceModel}
            setVoiceInput={setVoiceInput}
            setSentGTTS={setSentGTTS}
          />
          <SettingChatGPT
            role={role}
            wordLong={wordLong}
            setRole={setRole}
            setWordLong={setWordLong}
            setMessageArray={setMessageArray}
            setAudioArray={setAudioArray}
          />
        </div>

        {/* dropdown menu */}
        {isOpen && (
          <div className="sm:hidden  bg-gray-100 p-2 space-y-4">
            <SettingGTTS
              sentGTTS={sentGTTS}
              setVoiceModel={setVoiceModel}
              setVoiceInput={setVoiceInput}
              setSentGTTS={setSentGTTS}
            />
            <SettingChatGPT
              role={role}
              wordLong={wordLong}
              setRole={setRole}
              setWordLong={setWordLong}
              setMessageArray={setMessageArray}
              setAudioArray={setAudioArray}
            />
          </div>
        )}

        {/* dropdown bar */}
        <div
          className="sm:hidden bg-gray-200 w-full h-8 flex justify-between items-center hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 transition duration-200 ease-in-out px-8"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p>Setting Assistant</p>
          {isOpen ? (
            <BarsArrowDownIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <BarsArrowUpIcon className="w-6 h-6 text-gray-600" />
          )}
        </div>

        {/* input area */}
        <div className="flex  items-center justify-center z-50  w-full  bg-gray-100 ">
          <div className="flex justify-end items-center space-x-1 px-2 py-2 sm:px-8 w-full">
            {!recorderControls.isRecording && (
              <ChatInput
                updateMessageFromWhisper={updateMessageFromWhisper}
                setAudioArray={setAudioArray}
              />
            )}

            <AudioRecorder
              recorderControls={recorderControls}
              onRecordingComplete={(audioBlob) => recording(audioBlob)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
