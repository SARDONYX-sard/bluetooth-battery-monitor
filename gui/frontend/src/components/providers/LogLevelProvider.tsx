import { type ReactNode, createContext, useContext, useState } from 'react';

import { LOG, type LogLevel } from '@/services/api/log';

type ContextType = {
  logLevel: LogLevel;
  /**
   * setState & setLocalStorage
   *
   * # Note
   * It is necessary to call the backend API manually to actually change the log level, just to store the information.
   * (since that is not the responsibility of this function).
   */
  setLogLevel: (value: LogLevel) => void;
};

const Context = createContext<ContextType | undefined>(undefined);

type Props = { children: ReactNode };
export const LogLevelProvider = ({ children }: Props) => {
  const [logLevel, setLogLevel] = useState(LOG.get());
  const setHook = (value: LogLevel) => {
    setLogLevel(value);
    LOG.set(value);
  };

  return <Context.Provider value={{ logLevel, setLogLevel: setHook }}>{children}</Context.Provider>;
};

/**
 * @throws `useLogLevelContext must be used within a LogLevelProvider`
 */
export const useLogLevelContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useEditorModeContext must be used within a EditorModeProvider');
  }
  return context;
};
