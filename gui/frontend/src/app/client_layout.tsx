// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// SPDX-License-Identifier: MIT or Apache-2.0
'use client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NextLink from 'next/link';

import Menu from '@/components/navigation';
import SnackBarProvider from '@/components/providers/snackbar';

import type { ComponentProps, ReactNode } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    MuiLink: {
      defaultProps: {
        component: (props: ComponentProps<typeof NextLink>) => <NextLink {...props} />,
      },
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    MuiButtonBase: {
      defaultProps: {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        LinkComponent: (props: ComponentProps<typeof NextLink>) => <NextLink {...props} />,
      },
    },
  },
});

interface ClientLayoutProps {
  children: ReactNode;
}
export default function ClientLayout({ children }: Readonly<ClientLayoutProps>) {
  return (
    <ThemeProvider theme={darkTheme}>
      <SnackBarProvider />
      <CssBaseline />
      {children}
      <Menu />
    </ThemeProvider>
  );
}
