import React, { Dispatch, SetStateAction } from 'react';
import { AudioData, Message } from '../../src/pages';
import Select from 'react-select';
import { roleModelOptions, wordsLongOptions } from '../../lib/modelsForGPT';

type SettingChatGPTProps = {
  role: string;
  wordLong: string;
  setRole: Dispatch<SetStateAction<string>>;
  setWordLong: Dispatch<SetStateAction<string>>;
  setMessageArray: Dispatch<SetStateAction<Message[]>>;
  setAudioArray: Dispatch<SetStateAction<AudioData[]>>;
};

const SettingChatGPT: React.FC<SettingChatGPTProps> = ({
  role,
  wordLong,
  setRole,
  setWordLong,
  setMessageArray,
  setAudioArray,
}) => {
  return (
    <div className="space-y-2  pb-2 sm:space-y-0 sm:flex sm:justify-end sm:flex-1  sm:items-center sm:space-x-4">
      <Select
        isSearchable={false}
        placeholder="Role"
        styles={{
          control: (styles) => ({
            ...styles,
            width: '180px',
          }),
        }}
        options={roleModelOptions}
        menuPlacement="top"
        onChange={(e) => setRole(e.value)}
      />
      <div className="flex justify-between items-center sm:space-x-4">
        <Select
          isSearchable={false}
          placeholder="Response length"
          styles={{
            control: (styles) => ({
              ...styles,
              width: '180px',
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
            const roleText =
              role && `you have to pretend to act like a ${role}.`;
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
  );
};
export default SettingChatGPT;
