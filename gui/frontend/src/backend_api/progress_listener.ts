import { listen } from '@tauri-apps/api/event';

import { notify } from '@/components/notifications';

import type { EventCallback, EventName } from '@tauri-apps/api/event';
import type { JSX } from 'react/jsx-runtime';

type ListenerProps = {
  setLoading: (loading: boolean) => void;
  setProgress: (percentage: number) => void;
  success: string | JSX.Element;
  /** @default Error */
  error?: string | JSX.Element;
};
/**
 * - Specification decided by backend
 *   - At 1st => length
 *   - After that => index
 */
type Payload = { index: number };

/**
 * Tauri Progress Event Listener.
 * # No exception
 *
 * # Example
 * ```typescript
 * const promiseFn = async() => { await invoke('remove_oar_dir', { path: "/"})};
 * const setLoading = (bool:boolean) => {};
 * const setProgress = (per:number) => {};
 *
 * await progressListener('show-progress', promiseFn, {
 *    setLoading,
 *    setProgress,
 *    success: 'conversion-complete',
 * });
 * ```
 *
 * - backend(focus window.emit)
 *
 * ```rust
 * #[tauri::command]
 * pub(crate) async fn remove_oar_dir(window: Window, path: &str) -> Result<(), ()> {
 *     #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
 *     struct Payload { index: usize }
 *     let sender = |index:usize| window.emit("show-progress", Payload { index });
 *     sender(1);
 *     Ok(())
 * }
 *  ```
 */
export async function progressListener(
  eventName: EventName,
  promiseFn: () => Promise<void>,
  { setLoading, setProgress, success, error }: ListenerProps,
) {
  setLoading(true);
  setProgress(0);

  /** All File & dir counts */
  let maxNum = 0;
  let unlisten: (() => void) | null = null;
  const eventHandler: EventCallback<Payload> = (event) => {
    const toPercentage = (num: number) => (num * 100) / maxNum;

    if (maxNum === 0) {
      maxNum = event.payload.index;
    } else {
      setProgress(toPercentage(event.payload.index));
    }
  };

  try {
    // Setup before run Promise(For event hook)
    unlisten = await listen<Payload>(eventName, eventHandler);

    await promiseFn();

    notify.success(success);
    setProgress(100);
  } catch (err) {
    setProgress(0); // To avoid display `NaN`
    notify.error(error ?? `${err}`);
  } finally {
    if (unlisten) {
      unlisten();
    }
    setLoading(false);
  }
}
