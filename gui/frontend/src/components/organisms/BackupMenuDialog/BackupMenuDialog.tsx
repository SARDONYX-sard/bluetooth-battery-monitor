import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
} from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';
import { OBJECT } from '@/lib/object-utils';
import type { Cache, CacheKey } from '@/lib/storage';

import { CacheItem } from './CacheItem';
import { CacheValueItem } from './CacheValueItem';
import { CheckBoxControls } from './CheckBoxControls';
import { useCheckBoxState } from './useCheckBoxState';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type DialogClickHandler = (checkedKeys: readonly CacheKey[]) => void;
export type BackupMenuDialogProps = {
  buttonName: string;
  cacheItems: Cache;
  inDialogClick: DialogClickHandler;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: ReactNode;
};

export const BackupMenuDialog = ({
  buttonName,
  cacheItems,
  inDialogClick,
  open,
  setOpen,
  title,
}: BackupMenuDialogProps) => {
  const handleClose = () => setOpen(false);
  const { isAllChecked, isPubAllChecked, checked, handleToggleItem, handleCheckAll, handleCheckPubAll } =
    useCheckBoxState(cacheItems);

  return (
    <Dialog fullWidth={true} maxWidth='md' onClose={handleClose} open={open}>
      <DialogHeader onClose={handleClose} title={title}>
        <CheckBoxControls
          isAllChecked={isAllChecked}
          isPubAllChecked={isPubAllChecked}
          onAllCheck={handleCheckAll}
          onPubCheck={handleCheckPubAll}
        />
      </DialogHeader>

      <DialogContent dividers={true}>
        <DialogContentList cacheItems={cacheItems} checked={checked} handleToggleItem={handleToggleItem} />
      </DialogContent>

      <DialogActionsPanel buttonName={buttonName} onCancel={handleClose} onConfirm={() => inDialogClick(checked)} />
    </Dialog>
  );
};

const DialogHeader = ({
  title,
  onClose,
  children,
}: {
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
}) => (
  <DialogTitle>
    {title}
    <IconButton
      aria-label='close'
      onClick={onClose}
      sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
    >
      <CloseIcon />
    </IconButton>
    {children}
  </DialogTitle>
);

const DialogContentList = ({
  cacheItems,
  checked,
  handleToggleItem,
}: {
  cacheItems: Cache;
  checked: readonly CacheKey[];
  handleToggleItem: (key: CacheKey) => () => void;
}) => (
  <List sx={{ backgroundColor: '#121212be', minWidth: 360 }}>
    {OBJECT.entries(cacheItems).map(([key, value]) =>
      value ? (
        <CacheItem
          key={key}
          onToggle={handleToggleItem(key)}
          selected={checked.includes(key)}
          title={key}
          value={<CacheValueItem cacheKey={key} value={value} />}
        />
      ) : null,
    )}
  </List>
);

const DialogActionsPanel = ({
  buttonName,
  onConfirm,
  onCancel,
}: {
  buttonName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <DialogActions>
    <Button onClick={onConfirm}>{buttonName}</Button>
    <CancelButton onClick={onCancel} />
  </DialogActions>
);

const CancelButton = ({ ...props }: ButtonProps) => {
  const { t } = useTranslation();
  return <Button {...props}>{t('cancel-btn')}</Button>;
};
