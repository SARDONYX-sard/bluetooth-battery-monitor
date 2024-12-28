import { Button, type SxProps, type Theme, Tooltip } from '@mui/material';

import { BackupMenuDialog, type BackupMenuDialogProps } from '@/components/organisms/BackupMenuDialog';

import type { ReactNode } from 'react';

type Props = {
  buttonName: string;
  /** Trigger to open dialog */
  onClick?: () => void;
  startIcon: ReactNode;
  tooltipTitle: ReactNode;
} & BackupMenuDialogProps;

const style: SxProps<Theme> = {
  height: '4em',
  marginBottom: '8px',
  marginRight: '8px',
  marginTop: '8px',
  minWidth: '120px',
  width: '120px',
};

export const BackupButton = ({ buttonName, startIcon, tooltipTitle, onClick, ...props }: Readonly<Props>) => {
  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Button onClick={onClick} startIcon={startIcon} sx={style} type='button' variant='outlined'>
          {buttonName}
        </Button>
      </Tooltip>
      <BackupMenuDialog buttonName={buttonName} {...props} />
    </>
  );
};
