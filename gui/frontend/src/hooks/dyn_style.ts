import { useCallback, useEffect, useInsertionEffect, useState } from 'react';

import { notify } from '@/components/notifications';
import { localStorageManager } from '@/utils/local_storage_manager';
import { presetStyles, selectPreset } from '@/utils/styles';

const getStyle = () => {
  const presetNumber = selectPreset(localStorageManager.get('presetNumber'));
  if (presetNumber === '0') {
    return localStorageManager.get('customCSS') ?? '';
  }
  return presetStyles[presetNumber];
};

/**
 * Inject CSS dynamically on the client side.
 * # NOTE
 * Frequent style recalculation is inevitable,
 * but this hook can solve the delay problem caused by style injection lifecycle discrepancies.
 *  - See: [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect)
 */
export function useDynStyle(initialState = getStyle()) {
  const [style, setStyle] = useState(initialState);

  useInsertionEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [style]);

  return [style, setStyle] as const;
}

const initScript = () => {
  return localStorageManager.get('customJS') ?? '';
};
/**
 * Inject JavaScript
 */
export function useInjectScript(initialState = initScript()) {
  const [script, setScript] = useState(initialState);
  const [pathname, setPathname] = useState<string | null>(null);

  const handleScriptChange = useCallback((newValue: string | undefined) => {
    setScript(newValue ?? '');
    localStorage.setItem('customJS', newValue ?? '');
  }, []);

  useEffect(() => {
    const scriptElement = document.createElement('script');
    if (localStorage.getItem('runScript') === 'true') {
      scriptElement.innerHTML = script;
    }
    scriptElement.id = 'custom-script';

    if (pathname !== window.location.pathname) {
      try {
        if (!document.getElementById('custom-script')) {
          document.body.appendChild(scriptElement);
        }
      } catch (e) {
        notify.error(`${e}`);
      }
      setPathname(window.location.pathname);
    }
    return () => {
      if (document.getElementById('custom-script')) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [script, pathname]);

  return [script, handleScriptChange] as const;
}
