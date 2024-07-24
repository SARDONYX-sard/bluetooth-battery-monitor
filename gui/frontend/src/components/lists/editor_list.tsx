import { FormControl, InputLabel } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useCallback } from 'react';

import { useTranslation } from '@/hooks';
import { selectEditorMode } from '@/utils/selector';
import type { EditorMode } from '@/utils/selector';

export type SelectEditorProps = {
  setEditorMode: (value: EditorMode) => void;
  editorMode: EditorMode;
};

export const SelectEditorMode = ({ editorMode, setEditorMode }: SelectEditorProps) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const presetEditor = selectEditorMode(e.target.value);
      setEditorMode(presetEditor);
      window.location.reload();
    },
    [setEditorMode],
  );

  return (
    <FormControl sx={{ m: 1, minWidth: 105 }} variant='filled'>
      <InputLabel id='editor-select-label'>{t('editor-mode-list-label')}</InputLabel>
      <Select
        MenuProps={{ disableScrollLock: true }} // NOTE: Without this, padding will be added to the body during popup in consideration of nest, and the design will be broken.
        id='editor-select'
        label='Editor Mode'
        labelId='editor-select-label'
        onChange={handleChange}
        value={editorMode}
      >
        <MenuItem value={'default'}>Default</MenuItem>
        <MenuItem value={'vim'}>Vim</MenuItem>
      </Select>
    </FormControl>
  );
};
