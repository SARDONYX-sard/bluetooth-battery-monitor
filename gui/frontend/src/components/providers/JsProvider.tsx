import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useState } from 'react';

import { useStorageState } from '@/components/hooks/useStorageState';
import { STORAGE } from '@/lib/storage';
import { HIDDEN_CACHE_OBJ, PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { boolSchema } from '@/lib/zod/schema-utils';

type ContextType = {
  js: string;
  setJs: (value?: string) => void;
  runScript: boolean;
  setRunScript: Dispatch<SetStateAction<boolean>>;
};
const Context = createContext<ContextType | undefined>(undefined);

type Props = { children: ReactNode };

/** Wrapper component to allow user-defined css and existing css design presets to be retrieved/modified from anywhere */
export const JsProvider = ({ children }: Props) => {
  const [runScript, setRunScript] = useStorageState(HIDDEN_CACHE_OBJ.runScript, boolSchema);
  const [js, setJs] = useState(STORAGE.get(PUB_CACHE_OBJ.customJs) ?? '');

  const setHook = (value?: string) => {
    if (value) {
      setJs(value);
      STORAGE.set(PUB_CACHE_OBJ.customJs, value);
    } else {
      STORAGE.remove(PUB_CACHE_OBJ.customJs);
    }
  };

  return <Context.Provider value={{ js, setJs: setHook, runScript, setRunScript }}>{children}</Context.Provider>;
};

/**
 * @throws `useJsContext must be used within a JsProvider`
 */
export const useJsContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useJsContext must be used within a JsProvider');
  }
  return context;
};
