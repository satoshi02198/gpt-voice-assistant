import React, { Dispatch, SetStateAction } from 'react';
import Select from 'react-select';
import Toggle from '../toggleButtons/Toggle';
import {
  languageOutputOptions,
  languageInputOptions,
} from '../../lib/modelsForGPT';

type SettingGTTSProps = {
  setVoiceModel: Dispatch<SetStateAction<string>>;
  setVoiceInput: Dispatch<SetStateAction<string>>;
  setSentGTTS: Dispatch<SetStateAction<boolean>>;
  sentGTTS: boolean;
};

const SettingGTTS: React.FC<SettingGTTSProps> = ({
  setVoiceModel,
  setVoiceInput,
  setSentGTTS,
  sentGTTS,
}) => {
  return (
    <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
      <Toggle setSentGTTS={setSentGTTS} />
      {sentGTTS && (
        <div className="flex justify-start items-center space-x-2 ">
          <Select
            isSearchable={false}
            styles={{
              control: (styles) => ({
                ...styles,
                width: '180px',
              }),
            }}
            placeholder="Output"
            options={languageOutputOptions}
            menuPlacement="top"
            onChange={(e) => setVoiceModel(e.value)}
          />
          <Select
            isSearchable={false}
            styles={{
              control: (styles) => ({
                ...styles,
                width: '180px',
              }),
            }}
            placeholder="Input(optional)"
            options={languageInputOptions}
            menuPlacement="top"
            onChange={(e) => setVoiceInput(e.value)}
          />
        </div>
      )}
    </div>
  );
};
export default SettingGTTS;
