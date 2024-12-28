import MonitorIcon from '@mui/icons-material/Monitor';
import SettingsIcon from '@mui/icons-material/Settings';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { schemaStorage } from '@/lib/storage/schemaStorage';

// NOTE: Note that the order of the arrays must be in the order of the `BottomNavigationAction` declarations,
//       otherwise it will jump to the wrong place.
const validPathNames = ['/', '/settings'] as const;
const lastPathSchema = z.enum(validPathNames);
const getPageIndex = (path: string) => {
  switch (path) {
    case '/':
      return 0;
    case '/settings':
      return 1;
    default:
      return 0;
  }
};

/** HACK: To prevents the conversion button from being hidden because the menu is fixed. */
const MenuPadding = () => <div style={{ height: '56px' }} />;

export function PageNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPage, setSelectedPage] = useState(0);
  const [lastPath, setLastPath] = schemaStorage.use(PUB_CACHE_OBJ.lastPath, lastPathSchema);

  useEffect(() => {
    // Check if we've already redirected in this session
    const hasRedirected = sessionStorage.getItem('hasRedirected');

    if (lastPath && lastPath !== pathname && !hasRedirected) {
      sessionStorage.setItem('hasRedirected', 'true');
      // Since `/` is the initial coming path, there is no need to jump.
      // If you jump, you will have to jump twice when `/` is the LAST PATH.
      if (lastPath === '/') {
        return;
      }
      router.push(lastPath);
    }
  }, [lastPath, pathname, router]);

  useEffect(() => {
    const currentPage = getPageIndex(pathname);
    setSelectedPage(currentPage);

    const result = lastPathSchema.safeParse(pathname);
    if (result.success) {
      setLastPath(result.data);
    }
  }, [pathname, setLastPath]);

  const handleNavigationChange = (pageIdx: number) => {
    setSelectedPage(pageIdx);
    router.push(validPathNames[pageIdx]);
  };

  return (
    <>
      <MenuPadding />
      <BottomNavigation
        onChange={(_event, newPageIdx: number) => handleNavigationChange(newPageIdx)}
        showLabels={true}
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: '100',
          '.Mui-selected': {
            color: '#99e4ee',
          },
        }}
        value={selectedPage}
      >
        <BottomNavigationAction icon={<MonitorIcon />} label='Monitor' />
        <BottomNavigationAction icon={<SettingsIcon />} label='Settings' />
      </BottomNavigation>
    </>
  );
}
