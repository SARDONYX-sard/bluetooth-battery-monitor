'use client';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Button, Grid } from '@mui/material';
import Tab from '@mui/material/Tab';

import { start } from '@/backend_api';
import { ExecJsBtn, ExportBackupButton, ImportBackupButton, ImportLangButton } from '@/components/buttons';
import { Editor, type EditorProps } from '@/components/editor';
import { NoticeSettingsList, SelectEditorMode, StyleList, TranslationList } from '@/components/lists';
import type { SelectEditorProps, StyleListProps } from '@/components/lists';
import { useDynStyle, useLocale, useStorageState, useTranslation } from '@/hooks';
import { selectEditorMode } from '@/utils/selector';
import type { EditorMode } from '@/utils/selector';

import packageJson from '@/../../package.json';

import type { SyntheticEvent } from 'react';

export default function Settings() {
  useLocale();
  const [editorMode, setEditorMode] = useStorageState('editorMode', 'default');
  const [preset, setPreset] = useStorageState('presetNumber', '0');
  const [style, setStyle] = useDynStyle();
  const validEditorMode = selectEditorMode(editorMode);

  const setEditorKeyMode = (editorMode: EditorMode) => setEditorMode(editorMode);
  return (
    <Box
      component='main'
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 56px)',
        width: '100%',
      }}
    >
      <Editor editorMode={validEditorMode} setPreset={setPreset} setStyle={setStyle} style={style} />

      <Grid container sx={{ width: '95%' }}>
        <Grid sx={{ overflowX: 'auto' }} xs={8}>
          <Tabs
            editorMode={validEditorMode}
            preset={preset}
            setEditorMode={setEditorKeyMode}
            setPreset={setPreset}
            setStyle={setStyle}
            style={style}
          />
        </Grid>
        <Grid sx={{ overflowX: 'auto' }} xs={4}>
          <Help />
        </Grid>
      </Grid>
    </Box>
  );
}

type TabsProps = StyleListProps & SelectEditorProps & EditorProps;
const Tabs = ({ editorMode, setEditorMode, preset, setPreset, setStyle }: TabsProps) => {
  const [value, setValue] = useStorageState('settings-tab-select', 'editor');
  const { t } = useTranslation();

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        minWidth: 'max-content',
        typography: 'body1',
      }}
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList aria-label='Setting tabs' onChange={handleChange}>
            <Tab label={t('tab-label-editor')} value='editor' />
            <Tab label={t('tab-label-notice')} value='notice' />
            <Tab label={t('tab-label-lang')} value='lang' />
            <Tab label={t('tab-label-backup')} value='backup' />
          </TabList>
        </Box>
        <TabPanel value='editor'>
          <SelectEditorMode editorMode={editorMode} setEditorMode={setEditorMode} />
          <StyleList preset={preset} setPreset={setPreset} setStyle={setStyle} />
          <ExecJsBtn sx={{ marginLeft: '10px' }} />
        </TabPanel>
        <TabPanel value='notice'>
          <NoticeSettingsList />
        </TabPanel>
        <TabPanel value='lang'>
          <ImportLangButton />
          <TranslationList />
        </TabPanel>
        <TabPanel value='backup'>
          <ImportBackupButton />
          <ExportBackupButton />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

const Help = () => {
  const handleClick = () => start(packageJson.homepage);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-evenly',
      }}
    >
      <div>Version: {packageJson.version}</div>
      <div>
        Source:{' '}
        <Button onClick={handleClick} sx={{ fontSize: 'large' }} type='button' variant='text'>
          GitHub
        </Button>
      </div>
    </Box>
  );
};
