import { FileOpen } from '@mui/icons-material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Button, type ButtonProps, Tooltip } from '@mui/material';

import { openLogDir, openLogFile } from '@/backend_api';
import { notify } from '@/components/notifications';
import { useTranslation } from '@/hooks';

import type { ReactNode } from 'react';

type Props = {
  buttonName: ReactNode;
  tooltipTitle: ReactNode;
} & ButtonProps;

export const LogButton = ({ buttonName, tooltipTitle, ...props }: Props) => (
  <Tooltip title={tooltipTitle}>
    <Button
      startIcon={<FileOpen />}
      sx={{
        width: '100%',
        minHeight: '40px',
      }}
      type='button'
      variant='outlined'
      {...props}
    >
      {buttonName}
    </Button>
  </Tooltip>
);

export const LogFileButton = () => {
  const { t } = useTranslation();

  const handleClick = async () => {
    try {
      await openLogFile();
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  return <LogButton buttonName={t('open-log-btn')} onClick={handleClick} tooltipTitle={t('open-log-tooltip')} />;
};

export const LogDirButton = () => {
  const { t } = useTranslation();

  const handleClick = async () => {
    try {
      await openLogDir();
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  return (
    <LogButton
      buttonName={t('open-log-dir-btn')}
      onClick={handleClick}
      startIcon={<FolderOpenIcon />}
      tooltipTitle={t('open-log-dir-tooltip')}
    />
  );
};
