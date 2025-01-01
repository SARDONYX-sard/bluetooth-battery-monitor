import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { BackupButton } from '@/components/organisms/BackupButton';
import type { DialogClickHandler } from '@/components/organisms/BackupMenuDialog';
import { NOTIFY } from '@/lib/notify';
import { STORAGE } from '@/lib/storage';
import { BACKUP } from '@/services/api/backup';

export const BackupExportButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleClick: DialogClickHandler = (checkedKeys) => {
    NOTIFY.asyncTry(async () => {
      if (await BACKUP.export(STORAGE.getByKeys(checkedKeys))) {
        NOTIFY.success(t('backup-export-success'));
        setOpen(false);
      }
    });
  };

  return (
    <BackupButton
      buttonName={t('backup-export-btn-name')}
      cacheItems={STORAGE.getAll()}
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
