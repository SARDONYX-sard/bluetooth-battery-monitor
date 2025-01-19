import { LoadingButton } from '@mui/lab';
import { type ButtonProps, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import type { ReactNode } from 'react';

type Props = {
  buttonName: ReactNode;
  tooltipTitle?: ReactNode;
  icon?: ReactNode;
  minWidth?: number;
  minScreenWidth?: number;
} & ButtonProps;

export const LoadingButtonWithToolTip = ({
  buttonName,
  tooltipTitle,
  icon,
  minWidth = 97,
  minScreenWidth = 740, // Set default value for minimum screen width
  ...props
}: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [canShowText, setCanShowText] = useState(true); // Default to showing icon

  useEffect(() => {
    const updateShowText = () => {
      if (buttonRef.current) {
        setCanShowText(window.innerWidth > minScreenWidth);
      }
    };

    updateShowText();
    window.addEventListener('resize', updateShowText);

    return () => window.removeEventListener('resize', updateShowText);
  }, [minScreenWidth]);

  return (
    <Tooltip placement='top' title={tooltipTitle}>
      <LoadingButton
        ref={buttonRef}
        startIcon={canShowText ? icon : undefined}
        sx={{
          height: '55px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        variant='outlined'
        {...props}
      >
        {canShowText ? buttonName : icon}
      </LoadingButton>
    </Tooltip>
  );
};
