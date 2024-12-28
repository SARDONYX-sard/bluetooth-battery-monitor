import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, IconButton, type SxProps, type Theme } from '@mui/material';
import { type CustomContentProps, type SnackbarKey, SnackbarProvider, closeSnackbar } from 'notistack';
import { forwardRef, memo } from 'react';

import { NOTIFY_CONFIG } from '@/lib/notify/config';

/**
 * ref
 * - https://github.com/iamhosseindhv/notistack/issues/477#issuecomment-1885706867
 * @export
 */
export default function NotifyProvider() {
  const { anchorOrigin, maxSnack } = NOTIFY_CONFIG.getOrDefault();

  return (
    <SnackbarProvider
      Components={{
        info: ThemeResponsiveSnackbar,
        success: ThemeResponsiveSnackbar,
        error: ThemeResponsiveSnackbar,
        warning: ThemeResponsiveSnackbar,
      }}
      action={action}
      anchorOrigin={anchorOrigin}
      dense={true}
      maxSnack={maxSnack}
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

const ThemeResponsiveSnackbar = memo(
  forwardRef<HTMLDivElement, CustomContentProps>(function ThemeResponsiveSnackbarCompRef(props, forwardedRef) {
    const { id, message, variant, hideIconVariant, style, className } = props;

    const action = (() => {
      const { action } = props;
      return typeof action === 'function' ? action(id) : action;
    })();

    const severity = variant === 'default' ? 'info' : variant;

    const sx: SxProps<Theme> = (theme) => ({
      alignItems: 'center',
      backgroundColor: '#1a1919e1',
      borderRadius: '8px',
      boxShadow: theme.shadows[8],
      display: 'flex',
      maxWidth: '65vw',
      whiteSpace: 'pre', // ref: https://github.com/iamhosseindhv/notistack/issues/32
      willChange: 'transform',
    });

    // HACK: Convert whitespace to a special Unicode space equal to the numeric width to alleviate whitespace misalignment.
    // - ref: https://www.fileformat.info/info/unicode/char/2007/index.htm
    const errMsg = message?.toString().replaceAll(' ', '\u2007');

    return (
      <Alert
        action={action}
        className={className}
        icon={hideIconVariant ? false : undefined}
        ref={forwardedRef}
        severity={severity}
        style={style}
        sx={sx}
        variant='outlined'
      >
        <AlertTitle sx={{ color: '#fff', fontWeight: 'bold' }}>{severity.toUpperCase()}</AlertTitle>
        {errMsg}
      </Alert>
    );
  }),
);
