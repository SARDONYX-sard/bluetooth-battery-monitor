import { relaunch } from '@tauri-apps/plugin-process';
import { type Update, check } from '@tauri-apps/plugin-updater';
import { useEffect, useState } from 'react';

import { NOTIFY } from '@/lib/notify';

// - ref: https://v2.tauri.app/plugin/updater/
export const useUpdater = () => {
  const [isDownloading, setDownloading] = useState(false);
  const [isUpdatable, setUpdatable] = useState(false);
  const [progress, setProgress] = useState(0);

  const [updater, setUpdater] = useState<Update | null>(null);
  const [oldVersion, setOldVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      const update = await check();
      setUpdater(update);
      if (update?.available) {
        setOldVersion(update.currentVersion);
        setNewVersion(update.version);

        setDownloading(true);
        let downloaded = 0;
        let contentLength = 0;

        await update.download((event) => {
          switch (event.event) {
            case 'Started': {
              contentLength = event.data.contentLength ?? 0;
              break;
            }
            case 'Progress': {
              downloaded += event.data.chunkLength;
              const percentage = Math.round((downloaded / contentLength) * 100);
              setProgress(percentage);
              break;
            }
            case 'Finished': {
              setUpdatable(true);
              setProgress(100);
              break;
            }
            default:
          }
        });
      }

      setDownloading(false);
    };

    (async () => {
      try {
        await checkForUpdates();
      } catch (err) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error(`[Failed to check update]: ${err}`);
      }
    })();
  }, []);

  const handleRelaunch = async () => {
    try {
      if (updater) {
        await updater.install();
        await relaunch();
      }
    } catch (err) {
      NOTIFY.error(`[Failed to launch app]: ${err}`);
    }
  };

  return { isDownloading, isUpdatable, progress, handleRelaunch, oldVersion, newVersion };
};
