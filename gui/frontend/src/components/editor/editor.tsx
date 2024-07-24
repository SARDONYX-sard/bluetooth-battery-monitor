import { TabContext, TabList } from '@mui/lab';
import { Box, InputLabel, Tab } from '@mui/material';

import { CodeEditor } from '@/components/editor/code_editor';
import { useInjectScript, useStorageState, useTranslation } from '@/hooks';
import { selectEditorMode } from '@/utils/selector';
import type { EditorMode } from '@/utils/selector';

import type { SyntheticEvent } from 'react';

export type EditorProps = {
  editorMode: string;
  setPreset: (script: string) => void;
  setStyle: (style: string) => void;
  style: string;
};

export const Editor = ({ editorMode, setPreset, setStyle, style }: EditorProps) => {
  const [script, handleScriptChange] = useInjectScript();
  const { t } = useTranslation();

  const [value, setValue] = useStorageState('editor-tab-select', 'javascript');
  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const editorValues: EditorValues = {
    css: {
      label: t('custom-css-label'),
      defaultValue: style,
      language: 'css',
      onChange: (newValue) => {
        const value = newValue ?? '';
        setStyle(value);
        localStorage.setItem('customCSS', value);
        setPreset('0');
      },
    },

    javascript: {
      label: t('custom-js-label'),
      defaultValue: script,
      language: 'javascript',
      onChange: handleScriptChange,
    },
  };

  const editorValue = (() => {
    if (value === 'javascript') {
      return editorValues.javascript;
    }
    return editorValues.css;
  })();

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList aria-label='Setting tabs' onChange={handleTabChange}>
          <Tab label={'CSS'} value='css' />
          <Tab label={'JavaScript'} value='javascript' />
        </TabList>
      </Box>

      <EditorInner
        defaultValue={editorValue.defaultValue}
        editorMode={selectEditorMode(editorMode)}
        label={editorValue.label}
        language={editorValue.language}
        onChange={editorValue.onChange}
      />
    </TabContext>
  );
};

type EditorInnerProps = {
  label: string;
  defaultValue: string;
  language: string;
  onChange: (newValue: string | undefined) => void;
  editorMode: EditorMode;
};
type InitEditor = Omit<EditorInnerProps, 'editorMode'>;

type EditorValues = {
  css: InitEditor;
  javascript: InitEditor;
};

const EditorInner = ({ label, defaultValue, language, onChange, editorMode }: EditorInnerProps) => {
  return (
    <>
      <InputLabel
        error={language === 'javascript'}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}
      >
        {label}
      </InputLabel>
      <CodeEditor
        height='500px'
        language={language}
        onChange={onChange}
        options={{
          suggestOnTriggerCharacters: true,
          renderWhitespace: 'boundary',
          rulers: [120],
          hover: {
            above: true,
          },
        }}
        theme='vs-dark'
        value={defaultValue}
        vimMode={editorMode === 'vim'}
        width={'95%'}
      />
      <InputLabel id='status-node' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
    </>
  );
};
