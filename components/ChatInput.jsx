import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const ChatInput = ({ updateMessageFromWhisper, setAudioArray }) => {
  const [prompt, setPrompt] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    const input = prompt.trim();
    console.log('🚀 ~ sendMessage ~ input:', input);

    setPrompt('');

    updateMessageFromWhisper(input);
    setAudioArray((prev) => [...prev, { audioUrl: null }]);
  };

  return (
    <div className="bg-gray-50/50 text-gray-700 rounded-lg text-sm flex-grow">
      <form onSubmit={sendMessage} className="p-5 space-x-5 flex">
        <input
          className="bg-transparent focus:outline-none flex-1"
          type="text"
          placeholder="Type your message here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          type="submit"
          disabled={!prompt}
          className="bg-[#11A37F] rounded hover:opacity-50 text-white font-bold px-4 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-4 w-4 -rotate-45" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
