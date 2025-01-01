import FileOpen from '@mui/icons-material/FileOpen';
import {} from '@mui/material';
import { useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { BackupButton } from '@/components/organisms/BackupButton';
import type { DialogClickHandler } from '@/components/organisms/BackupMenuDialog';
import { NOTIFY } from '@/lib/notify';
import { type Cache, STORAGE } from '@/lib/storage';
import { BACKUP } from '@/services/api/backup';

export const BackupImportButton = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Cache>({});
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    NOTIFY.asyncTry(async () => {
      const newSettings = await BACKUP.import();
      if (newSettings) {
        setSettings(newSettings);
        setOpen(true);
      }
    });
  };

  const handleDialogClick: DialogClickHandler = (checkedKeys) => {
    for (const key of checkedKeys) {
      const value = settings[key];
      if (value) {
        STORAGE.set(key, value);
      }
    }

    window.location.reload(); // To enable
  };

  return (
    <BackupButton
      buttonName={t('backup-import-btn-name')}
      cacheItems={settings}
      inDialogClick={handleDialogClick}
      onClick={handleClick}
      open={open}
      setOpen={setOpen}
      startIcon={<FileOpen />}
      title={t('backup-import-dialog-title')}
      tooltipTitle={t('backup-import-tooltip')}
    />
  );
};
