import React, { Dispatch, SetStateAction } from 'react';
import Select from 'react-select';
import Toggle from '../toggleButtons/Toggle';
import { languageModelOptions } from '../../lib/modelsForGPT';

type SettingGTTSProps = {
  setVoiceModel: Dispatch<SetStateAction<string>>;
  setSentGTTS: Dispatch<SetStateAction<boolean>>;
};

const SettingGTTS: React.FC<SettingGTTSProps> = ({
  setVoiceModel,
  setSentGTTS,
}) => {
  return (
    <div className="space-y-2 sm:space-y-0 sm:flex sm:justify-center sm:items-center sm:space-x-4">
      <Select
        styles={{
          control: (styles) => ({
            ...styles,
            width: '180px',
          }),
        }}
        placeholder="Select language"
        options={languageModelOptions}
        menuPlacement="top"
        onChange={(e) => setVoiceModel(e.value)}
      />
      <Toggle setSentGTTS={setSentGTTS} />
    </div>
  );
};
export default SettingGTTS;
