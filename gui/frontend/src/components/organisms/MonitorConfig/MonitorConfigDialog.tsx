import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';

import { ConfigFields } from './ConfigFields';

import type React from 'react';

interface MonitorConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export const MonitorConfigDialog: React.FC<MonitorConfigDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{`${t('monitor.config-dialog.title')}`}</DialogTitle>
      <DialogContent>
        <ConfigFields />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={onClose}>
          {t('cancel-btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
