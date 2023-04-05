import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, FormEvent, useState } from 'react';

interface ChatInputProps {
  updateMessageFromWhisper: (message: string) => void;
  setAudioArray: (
    fn: (
      prev: Array<{ audioUrl: string | null }>
    ) => Array<{ audioUrl: string | null }>
  ) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  updateMessageFromWhisper,
  setAudioArray,
}) => {
  const [prompt, setPrompt] = useState('');

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
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
      <form onSubmit={sendMessage} className="p-2 sm:p-2 space-x-5 flex">
        <input
          className="bg-transparent focus:outline-none flex-1"
          type="text"
          placeholder="Type your message here..."
          value={prompt}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPrompt(e.target.value)
          }
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
