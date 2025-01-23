import UpdateIcon from '@mui/icons-material/Update';
import { BottomNavigationAction, Box, Tooltip } from '@mui/material';
import { useState } from 'react';

import { CircularProgressWithLabel } from '@/components/atoms/CircularWithLabel';
import { useTranslation } from '@/components/hooks/useTranslation';

import { UpdaterDialog } from './UpdaterDialog';
import { useUpdater } from './useUpdater';

import type React from 'react';

export const NavigationWithUpdater: React.FC = () => {
  const { t } = useTranslation();

  const { isDownloading, isUpdatable, progress, handleRelaunch, oldVersion, newVersion } = useUpdater();
  const versionInfo = oldVersion && newVersion ? `${oldVersion} => ${newVersion}` : '';

  // relative to dialog
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  return isDownloading || isUpdatable ? (
    isUpdatable ? (
      <Tooltip arrow={true} title={t('updater.tooltip.update')}>
        <>
          <BottomNavigationAction icon={<UpdateIcon />} label='Update' onClick={handleOpenDialog} showLabel={true} />
          <UpdaterDialog onClose={handleCloseDialog} onConfirm={handleRelaunch} open={isDialogOpen} />
        </>
      </Tooltip>
    ) : (
      <Tooltip arrow={true} title={`${t('updater.tooltip.downloading')}${versionInfo}: ${progress}%`}>
        <Box alignItems='center' display='flex' flexDirection='column' justifyContent='center'>
          <CircularProgressWithLabel value={progress} />
        </Box>
      </Tooltip>
    )
  ) : null;
};
