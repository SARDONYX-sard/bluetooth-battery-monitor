import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { ButtonWithToolTip } from '@/components/molecules/ButtonWithToolTip';

import { MonitorConfigDialog } from './MonitorConfigDialog';

import type React from 'react';

export const MonitorConfigButton: React.FC = () => {
  const { t } = useTranslation();

  // relative to dialog
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  return (
    <>
      <ButtonWithToolTip
        buttonName={t('monitor.config-dialog.button-name')}
        icon={<SettingsIcon />}
        onClick={handleOpenDialog}
        tooltipTitle={t('monitor.config-dialog.tooltip')}
      />
      <MonitorConfigDialog onClose={handleCloseDialog} open={isDialogOpen} />
    </>
  );
};
