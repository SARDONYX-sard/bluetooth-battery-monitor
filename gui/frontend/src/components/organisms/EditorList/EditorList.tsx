import { type ComponentPropsWithRef, useCallback } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import { useEditorModeContext } from '@/components/providers/EditorModeProvider';
import { EDITOR_MODE } from '@/lib/editor-mode';

type OnChangeHandler = Exclude<ComponentPropsWithRef<typeof SelectWithLabel>['onChange'], undefined>;

export const EditorList = () => {
  const { t } = useTranslation();
  const { editorMode: mode, setEditorMode } = useEditorModeContext();

  const handleOnChange = useCallback<OnChangeHandler>(
    ({ target }) => {
      setEditorMode(EDITOR_MODE.normalize(target.value));
    },
    [setEditorMode],
  );

  const menuItems = [
    { value: 'default', label: 'Default' },
    { value: 'vim', label: 'Vim' },
  ] as const;

  return (
    <SelectWithLabel label={t('editor-mode-list-label')} menuItems={menuItems} onChange={handleOnChange} value={mode} />
  );
};
