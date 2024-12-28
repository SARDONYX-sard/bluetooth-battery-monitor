import { useInsertionEffect, useRef, useState } from 'react';

import { CSS, type CssPresets } from '@/lib/css';
import { NOTIFY } from '@/lib/notify';

/**
 * Inject CSS dynamically on the client side.
 */
export function useInjectCss() {
  const [preset, setPreset] = useState<CssPresets>(CSS.preset.get());
  const [css, setCss] = useState(CSS.css.get(preset));
  const style = useRef<HTMLStyleElement | null>(null);

  const setPresetHook = (value: CssPresets) => {
    setPreset(value);
    CSS.preset.set(value);
  };

  const setHook = (value?: string) => {
    setCss(value ?? '');
  };

  // NOTE: Frequent style recalculation is inevitable, but this hook can solve the delay problem caused by style injection lifecycle discrepancies.
  //  - See: [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect)
  useInsertionEffect(() => {
    const styleElement = document.createElement('style');

    if (!style.current) {
      styleElement.id = CSS.css.id; // Assign ID so that user can edit
      styleElement.innerHTML = css;
      style.current = styleElement;
      NOTIFY.try(() => document.head.appendChild(styleElement));
    }

    return () => {
      style.current?.remove();
      style.current = null;
    };
  }, [css]);

  return { preset, setPreset: setPresetHook, css, setCss: setHook } as const;
}
