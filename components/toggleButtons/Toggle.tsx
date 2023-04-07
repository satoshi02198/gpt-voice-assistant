import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  setSentGTTS: Dispatch<SetStateAction<boolean>>;
};

const Toggle = ({ setSentGTTS }: Props) => {
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSentGTTS(e.target.checked);
  };

  return (
    <div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          onChange={handleToggleChange}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lime-300 dark:peer-focus:ring-lime-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-lime-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Voice Assistant
        </span>
      </label>
    </div>
  );
};
export default Toggle;
