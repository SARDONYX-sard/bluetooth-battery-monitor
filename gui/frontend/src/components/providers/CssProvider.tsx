import { createContext, useContext } from 'react';

import { useInjectCss } from '@/components/hooks/useInjectCss';

import type React from 'react';

type ContextType = ReturnType<typeof useInjectCss>;
const Context = createContext<ContextType | undefined>(undefined);

/** Wrapper component to allow user-defined css and existing css design presets to be retrieved/modified from anywhere */
export const CssProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useInjectCss();
  return <Context.Provider value={context}>{children}</Context.Provider>;
};

/**
 * @throws `useCssContext must be used within a CssProvider`
 */
export const useCssContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useCssContext must be used within a CssProvider');
  }
  return context;
};
