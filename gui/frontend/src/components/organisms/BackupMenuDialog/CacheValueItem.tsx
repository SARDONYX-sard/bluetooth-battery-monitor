import { MonacoEditor } from '@/components/organisms/MonacoEditor/MonacoEditor';
import { useEditorModeContext } from '@/components/providers/EditorModeProvider';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

import type React from 'react';

// Function to calculate the height based on the number of lines in the value
const calculateHeight = (value: string, lineHeight = 20, minHeight = 40, maxHeight = 500): string => {
  const lines = value.split('\n').length;
  const height = Math.min(Math.max(lines * lineHeight, minHeight), maxHeight);
  return `${height}px`;
};

type Props = {
  cacheKey: string;
  value: string;
};

export const CacheValueItem: React.FC<Props> = ({ cacheKey, value }: Props) => {
  const { editorMode } = useEditorModeContext();
  const language = getLanguageByKey(cacheKey);

  const fmtValue = (() => {
    const json = stringToJsonSchema.safeParse(value);
    if (json.success) {
      return JSON.stringify(json.data, null, 2);
    }
    return value;
  })();
  const editorHeight = calculateHeight(fmtValue);

  return (
    <MonacoEditor
      height={editorHeight}
      language={language}
      options={{
        hover: { above: true },
        renderWhitespace: 'boundary',
        rulers: [120],
        scrollBeyondLastLine: false,
      }}
      path={cacheKey}
      value={fmtValue}
      vimMode={editorMode === 'vim'}
      width='100%'
    />
  );
};

// Helper function to determine the language based on the key
const getLanguageByKey = (key: string) => {
  switch (key) {
    case 'custom-js':
      return 'javascript';
    case 'custom-css':
      return 'css';
    default:
      return 'json';
  }
};
