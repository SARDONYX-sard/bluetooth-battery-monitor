import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';

import type React from 'react';

interface UpdaterDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  versionInfo?: string;
}

export const UpdaterDialog: React.FC<UpdaterDialogProps> = ({ open, onClose, onConfirm, versionInfo }) => {
  const { t } = useTranslation();
  const versions = versionInfo ? ` ${versionInfo}` : '';

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{`${t('updater.dialog.title')}${versions}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('updater.dialog.message')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus={true} color='primary' onClick={onConfirm}>
          {t('restart-btn')}
        </Button>
        <Button color='primary' onClick={onClose}>
          {t('cancel-btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
