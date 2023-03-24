import React, { useEffect, useState } from 'react';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { renderToStaticMarkup } from 'react-dom/server';
import dynamic from 'next/dynamic';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import ChatInput from './ChatInput';

const SyntaxHighlighter = dynamic(
  async () => {
    const { Light } = await import('react-syntax-highlighter');
    return Light;
  },
  { ssr: false }
);

const darcula = dynamic(
  async () => {
    const { darcula } = await import(
      'react-syntax-highlighter/dist/esm/styles/hljs'
    );
    return darcula;
  },
  { ssr: false }
);

const Recorder = () => {
  const [messageArray, setMessageArray] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioArray, setAudioArray] = useState([]);

  const combinedArray = messageArray.map((message, index) => {
    const audio = audioArray[index]?.audioUrl || null;

    return { ...message, audioUrl: audio };
  });

  useEffect(() => {
    if (
      messageArray.length > 0 &&
      messageArray[messageArray.length - 1].role !== 'assistant'
    ) {
      getResFromChatGPTAndGTTS();
    }
  }, [messageArray]);

  //? get from google text to speech
  const getResFromGTTS = async (text) => {
    try {
      const response = await fetch('/api/googleTToS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
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
      setLoading(false);
    }
  };

  //? get response from chatGPT and GTTS
  const getResFromChatGPTAndGTTS = async () => {
    setLoading(true);
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

      if (res.content) {
        setMessageArray((prev) => [...prev, res]);
        const newAudio = { audioUrl: null };
        const audio = await getResFromGTTS(res.content);
        newAudio.audioUrl = audio;
        setAudioArray((prev) => [...prev, newAudio]);
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
  const recording = async (audioBlob) => {
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
      setError(error.message);
      console.log('Error:', error);
    }
  };

  //?messageStyle depending on role
  const messageStyles = (role) => {
    if (role === 'user') {
      return 'bg-lime-200 text-black px-8 py-4 rounded-sm ';
    } else {
      return 'bg-gray-200 text-black px-8 py-4 rounded-sm ';
    }
  };

  //? formatCodeSnippets
  const formatCodeSnippets = (content) => {
    const codeSnippetRegex = /```([\s\S]*?)```/g;
    return content.replace(codeSnippetRegex, (match, code) => {
      const highlightedCode = (
        <SyntaxHighlighter language="javascript" style={darcula}>
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
      <div>
        <div className="space-y-6 px-4 py-4 ">
          {combinedArray.map((message, index) => (
            <div key={index} className={messageStyles(message.role)}>
              <div
                dangerouslySetInnerHTML={{
                  __html: formatCodeSnippets(message.content),
                }}
                className="text-xl"
              ></div>
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
        </div>
        {loading ? (
          <>
            <p>loading....</p>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center mx-auto w-[90%]">
              <ChatInput
                updateMessageFromWhisper={updateMessageFromWhisper}
                setAudioArray={setAudioArray}
              />
              <AudioRecorder
                onRecordingComplete={(audioBlob) => recording(audioBlob)}
              />
            </div>
            {error && <p>{error}</p>}
          </>
        )}
      </div>
    </>
  );
};
export default Recorder;
