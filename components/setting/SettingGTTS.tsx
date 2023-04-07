import React, { Dispatch, SetStateAction } from 'react';
import Select from 'react-select';
import Toggle from '../toggleButtons/Toggle';
import { languageModelOptions } from '../../lib/modelsForGPT';

type SettingGTTSProps = {
  setVoiceModel: Dispatch<SetStateAction<string>>;
  setSentGTTS: Dispatch<SetStateAction<boolean>>;
  sentGTTS: boolean;
};

const SettingGTTS: React.FC<SettingGTTSProps> = ({
  setVoiceModel,
  setSentGTTS,
  sentGTTS,
}) => {
  return (
    <div className=" flex items-center justify-between space-x-4">
      <Toggle setSentGTTS={setSentGTTS} />
      {sentGTTS && (
        <Select
          isSearchable={false}
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
      )}
    </div>
  );
};
export default SettingGTTS;
