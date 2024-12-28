import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext } from 'react';

import { useStorageState } from '@/components/hooks/useStorageState';
import { EDITOR_MODE, type EditorMode } from '@/lib/editor-mode';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';

type ContextType = {
  editorMode: EditorMode;
  setEditorMode: Dispatch<SetStateAction<EditorMode>>;
};
const Context = createContext<ContextType | undefined>(undefined);

type Props = { children: ReactNode };
export const EditorModeProvider = ({ children }: Props) => {
  const [editorMode, setEditorMode] = useStorageState(
    PUB_CACHE_OBJ.editorMode,
    EDITOR_MODE.schema.catch(EDITOR_MODE.default),
  );
  return <Context.Provider value={{ editorMode, setEditorMode }}>{children}</Context.Provider>;
};

/**
 * @throws `useEditorModeContext must be used within a EditorModeProvider`
 */
export const useEditorModeContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useEditorModeContext must be used within a EditorModeProvider');
  }
  return context;
};
