'use client';

import SettingsIcon from '@mui/icons-material/Settings';
import TransformIcon from '@mui/icons-material/Transform';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { styled } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Nav = styled(BottomNavigation)(() => {
  return {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    zIndex: '100', // Because Ace-editor uses z-index and without it, it would be covered.
    '.Mui-selected': {
      color: '#99e4ee',
    },
  };
});

export default function MenuNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (pathname === '/') {
      setValue(0);
    } else if (pathname === '/settings') {
      setValue(1);
    }
  }, [pathname]);

  return (
    <Nav
      onChange={(_event, newValue) => {
        setValue(newValue);
      }}
      showLabels
      value={value}
    >
      <BottomNavigationAction icon={<TransformIcon />} label='Home' onClick={() => router.push('/')} />
      <BottomNavigationAction icon={<SettingsIcon />} label='Settings' onClick={() => router.push('/settings')} />
    </Nav>
  );
}
