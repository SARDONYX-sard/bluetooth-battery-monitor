import CloseIcon from '@mui/icons-material/Close';
import { Button, Checkbox, Dialog, Divider, FormControlLabel } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { type Dispatch, type ReactNode, type SetStateAction, useState } from 'react';

import { useTranslation } from '@/hooks';
import { type CacheKey, type LocalCache, pubCacheKeys } from '@/utils/local_storage_manager';

export type DialogClickHandler = (checkedKeys: CacheKey[]) => void;
export type LocalStorageDialogProps = {
  buttonName: string;
  cacheItems: LocalCache;
  /** Event when a button in the dialog is clicked */
  inDialogClick: DialogClickHandler;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: ReactNode;
};

export const LocalStorageDialog = ({
  buttonName,
  cacheItems,
  inDialogClick,
  open,
  setOpen,
  title,
}: Readonly<LocalStorageDialogProps>) => {
  const handleClose = () => setOpen(false);

  const { t } = useTranslation();
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isPubAllChecked, setIsPubAllChecked] = useState(false);
  const [checked, setChecked] = useState<CacheKey[]>([]);

  const handleToggle = (selectedKey: CacheKey) => () => {
    setChecked((prev) => {
      // Remove
      if (prev.includes(selectedKey)) {
        return prev.filter((key) => key !== selectedKey);
      }
      // Add
      return [...prev, selectedKey];
    });
    setIsAllChecked(false);
    setIsPubAllChecked(false);
  };

  const handleAllCheck = () => {
    setIsPubAllChecked(false);
    setIsAllChecked((prev) => {
      const newIsAll = !prev;
      if (newIsAll) {
        setChecked(Object.keys(cacheItems) as CacheKey[]);
      } else {
        setChecked([]);
      }
      return newIsAll;
    });
  };

  const handlePubAllCheck = () => {
    setIsAllChecked(false);
    setIsPubAllChecked((prev) => {
      const newIsPub = !prev;
      if (newIsPub) {
        // Safety: `setState` copies arguments without changing them on its own
        setChecked(pubCacheKeys as unknown as CacheKey[]);
      } else {
        setChecked([]);
      }
      return newIsPub;
    });
  };

  return (
    <Dialog fullWidth maxWidth={'md'} onClose={handleClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle>
        <FormControlLabel
          checked={isAllChecked}
          control={<Checkbox onClick={handleAllCheck} />}
          label={t('backup-dialog-all-checked-label')}
        />
        <FormControlLabel
          checked={isPubAllChecked}
          control={<Checkbox onClick={handlePubAllCheck} />}
          label={t('backup-dialog-pub-checked-label')}
        />
      </DialogTitle>

      <DialogContent dividers>
        <List sx={{ minWidth: 360, bgcolor: 'background.paper' }}>
          {Object.keys(cacheItems).map((key_) => {
            const key = key_ as CacheKey;
            const value = cacheItems[key];
            const labelId = `checkbox-list-label-${key}`;
            const oneObject: LocalCache = {};
            oneObject[key] = value;

            return (
              <ListItem disablePadding key={key}>
                <ListItemButton dense onClick={handleToggle(key)}>
                  <ListItemIcon>
                    <Checkbox
                      checked={checked.includes(key)}
                      disableRipple
                      edge='start'
                      inputProps={{ 'aria-labelledby': labelId }}
                      tabIndex={-1}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={key} secondary={value} />
                </ListItemButton>
                <Divider />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => inDialogClick(checked)}>{buttonName}</Button>
        <Button onClick={handleClose}>{t('cancel-btn')}</Button>
      </DialogActions>
    </Dialog>
  );
};
