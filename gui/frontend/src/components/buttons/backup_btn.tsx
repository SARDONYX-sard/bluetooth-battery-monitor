import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileOpen from '@mui/icons-material/FileOpen';
import { Button, Tooltip } from '@mui/material';
import { type ReactNode, useState } from 'react';

import { backup } from '@/backend_api';
import {
  type DialogClickHandler,
  LocalStorageDialog,
  type LocalStorageDialogProps,
  notify,
} from '@/components/notifications';
import { useTranslation } from '@/hooks';
import { type LocalCache, localStorageManager } from '@/utils/local_storage_manager';

type Props = {
  buttonName: string;
  /** Trigger to open dialog */
  onClick?: () => void;
  startIcon: ReactNode;
  tooltipTitle: ReactNode;
} & LocalStorageDialogProps;

export const BackupButton = ({ buttonName, startIcon, tooltipTitle, onClick, ...props }: Readonly<Props>) => {
  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Button
          onClick={onClick}
          startIcon={startIcon}
          sx={{
            height: '4em',
            marginBottom: '8px',
            marginRight: '8px',
            marginTop: '8px',
            minWidth: '120px',
            width: '120px',
          }}
          type='button'
          variant='outlined'
        >
          {buttonName}
        </Button>
      </Tooltip>
      <LocalStorageDialog buttonName={buttonName} {...props} />
    </>
  );
};

export const ImportBackupButton = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<LocalCache>({});
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    const newSettings = await backup.import();
    try {
      if (newSettings) {
        setSettings(newSettings);
        setOpen(true);
      }
    } catch (e) {
      notify.error(`${e}`);
    }
  };

  const handleDialogClick: DialogClickHandler = (checkedKeys) => {
    for (const key of checkedKeys) {
      const value = settings[key];
      if (value) {
        localStorage.setItem(key, value);
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

export const ExportBackupButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleClick: DialogClickHandler = async (checkedKeys) => {
    try {
      const exportTarget = localStorageManager.getFromKeys(checkedKeys);
      if (await backup.export(exportTarget)) {
        notify.success(t('backup-export-success'));
        setOpen(false);
      }
    } catch (e) {
      notify.error(`${e}`);
    }
  };

  return (
    <BackupButton
      buttonName={t('backup-export-btn-name')}
      cacheItems={localStorageManager.getAll()}
      inDialogClick={handleClick}
      onClick={() => setOpen(true)}
      open={open}
      setOpen={setOpen}
      startIcon={<FileDownloadIcon />}
      title={t('backup-export-dialog-title')}
      tooltipTitle={t('backup-export-tooltip')}
    />
  );
};
