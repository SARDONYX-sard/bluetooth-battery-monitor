import { Typography } from '@mui/material';

import { MonacoEditor } from '@/components/organisms/MonacoEditor';
import { useEditorModeContext } from '@/components/providers/EditorModeProvider';

import type { ComponentPropsWithoutRef } from 'react';

export type EditorInfo = {
  css: Props;
  javascript: Props;
};

/** https://github.com/suren-atoyan/monaco-react?tab=readme-ov-file#multi-model-editor */
type Props = {
  value: string;
  /** NOTE: If this is not changed, it is considered the same file change and the change history will be mixed. */
  fileName: string;
  label: string;
  language: string;
  onChange: ComponentPropsWithoutRef<typeof MonacoEditor>['onChange'];
};

export const EditorInitializer = ({ value, fileName, label, language, onChange }: Props) => {
  const { editorMode } = useEditorModeContext();
  const isVimMode = editorMode === 'vim';

  return (
    <>
      <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
        {label}
      </Typography>
      <MonacoEditor
        height='500px'
        language={language}
        onChange={onChange}
        options={{
          renderWhitespace: 'boundary',
          rulers: [120],
          hover: { above: true },
        }}
        path={fileName}
        value={value}
        vimMode={isVimMode}
        width='95%'
      />
    </>
  );
};
