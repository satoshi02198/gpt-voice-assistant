export const languageModelOptions = [
  { value: 'en-GB', label: 'en-GB' },
  { value: 'en-US', label: 'en-US' },
  { value: 'ja-JP', label: 'ja(日本語)' },
];

export const roleModelOptions = [
  { value: '', label: 'no setting' },
  {
    value: 'Great Assistant',
    label: 'Assistant',
  },
  {
    value:
      'senior software engineer.You have to assist me to solve the problem',
    label: 'SoftwareEngineer',
  },
  {
    value: 'my researcher',
    label: 'Researcher',
  },
  {
    value:
      'English teacher. Your mission is to make student great communicater in English. teach student natural English rather than accademic. sometimes teach slang.correct English grammer sometimes',
    label: 'English Teacher',
  },
  {
    value:
      'swami vivekanada. use words expecting he uses.you can use words from his book',
    label: 'Swami Vivekanada',
  },
];

export const characterModelOptions = [];

export const wordsLongOptions = [
  { value: '', label: 'no limit' },
  { value: '1 to 2 sentences', label: '1 to 2 sentences' },
  { value: '3 to 5 sentences', label: '3 to 5 sentences' },
  { value: '6 to 10 sentences', label: '6 to 10 sentences' },
];
