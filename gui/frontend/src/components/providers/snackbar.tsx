'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import {
  type CustomContentProps,
  type SnackbarKey,
  SnackbarProvider as SnackbarProviderInner,
  closeSnackbar,
} from 'notistack';
import { forwardRef, memo } from 'react';

import { getSnackbarSettings } from '@/components/notifications';

/**
 * ref
 * - https://github.com/iamhosseindhv/notistack/issues/477#issuecomment-1885706867
 * @export
 */
export default function SnackBarProvider() {
  const settings = getSnackbarSettings();

  return (
    <SnackbarProviderInner
      Components={{
        info: ThemeResponsiveSnackbar,
        success: ThemeResponsiveSnackbar,
        error: ThemeResponsiveSnackbar,
        warning: ThemeResponsiveSnackbar,
      }}
      action={action}
      anchorOrigin={settings.position}
      dense
      maxSnack={settings.maxSnack}
      preventDuplicate={true}
    />
  );
}

/** It exists to realize the deletion of the history of the passage at any timing by Click. */
const action = (id: SnackbarKey) => (
  <IconButton aria-label='close' color='inherit' onClick={() => closeSnackbar(id)} size='small'>
    <CloseIcon fontSize='inherit' />
  </IconButton>
);

const ThemeResponsiveSnackbarComp = forwardRef<HTMLDivElement, CustomContentProps>((props, forwardedRef) => {
  const {
    id,
    message,
    action: componentOrFnAction,
    variant: notistackVariant,
    hideIconVariant,
    style,
    className,
  } = props;

  const severity = notistackVariant === 'default' ? 'info' : notistackVariant;
  const action = typeof componentOrFnAction === 'function' ? componentOrFnAction(id) : componentOrFnAction;

  return (
    <Alert
      action={action}
      className={className}
      icon={hideIconVariant ? false : undefined}
      ref={forwardedRef}
      severity={severity}
      style={style}
      sx={(theme) => ({
        alignItems: 'center',
        backgroundColor: '#1a1919e1',
        borderRadius: '8px',
        boxShadow: theme.shadows[8],
        display: 'flex',
        maxWidth: '35vw',
        willChange: 'transform',
      })}
      variant='outlined'
    >
      <AlertTitle sx={{ color: '#fff', fontWeight: 'bold' }}>{severity.toUpperCase()}</AlertTitle>
      {message}
    </Alert>
  );
});
ThemeResponsiveSnackbarComp.displayName = 'ThemeResponsiveSnackbarCompRef';
const ThemeResponsiveSnackbar = memo(ThemeResponsiveSnackbarComp);
