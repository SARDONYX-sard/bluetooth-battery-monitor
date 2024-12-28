import { type Dispatch, type FC, type ReactNode, type SetStateAction, createContext, useContext } from 'react';
import { z } from 'zod';

import { useStorageState } from '@/components/hooks/useStorageState';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';

type TabPosition = 'top' | 'bottom';
type ContextType = {
  tabPos: TabPosition;
  setTabPos: Dispatch<SetStateAction<TabPosition>>;
};

const Context = createContext<ContextType | undefined>(undefined);
export const tabPosSchema = z.enum(['bottom', 'top']).catch('top');

type Props = { children: ReactNode };
export const TabProvider: FC<Props> = ({ children }) => {
  const [tabPos, setTabPos] = useStorageState(PUB_CACHE_OBJ.settingsTabPosition, tabPosSchema);
  return <Context.Provider value={{ tabPos, setTabPos }}>{children}</Context.Provider>;
};

/**
 * @throws `useTabContext must be used within a TabProvider`
 */
export const useTabContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useJsContext must be used within a TabProvider');
  }
  return context;
};
