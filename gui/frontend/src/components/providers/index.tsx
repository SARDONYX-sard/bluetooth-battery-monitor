import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NextLink from 'next/link';

import { CssProvider } from '@/components/providers/CssProvider';
import { EditorModeProvider } from '@/components/providers/EditorModeProvider';
import { JsProvider } from '@/components/providers/JsProvider';
import { LogLevelProvider } from '@/components/providers/LogLevelProvider';
import NotifyProvider from '@/components/providers/NotifyProvider';
import { TabProvider } from '@/components/providers/TabProvider';

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

type Props = Readonly<{ children: ReactNode }>;

export const GlobalProvider = ({ children }: Props) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <NotifyProvider />
      <LogLevelProvider>
        <TabProvider>
          <EditorModeProvider>
            <JsProvider>
              <CssProvider>
                <CssBaseline />
                {children}
              </CssProvider>
            </JsProvider>
          </EditorModeProvider>
        </TabProvider>
      </LogLevelProvider>
    </ThemeProvider>
  );
};
