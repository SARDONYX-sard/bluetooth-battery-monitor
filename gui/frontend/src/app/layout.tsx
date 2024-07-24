import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';

import Loading from '@/components/pages/loading';
import '@/utils/translation';

import json from '../../../backend/tauri.conf.json';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/app/globals.css';

export const metadata = {
  title: json.tauri.windows[0].title,
  description: json.tauri.windows[0].title,
} as const satisfies Metadata;

const ClientLayout = dynamic(() => import('@/app/client_layout'), {
  loading: () => <Loading />,
  ssr: false,
});
const inter = Inter({ subsets: ['latin'] });

type Props = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: Props) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ClientLayout>
          {children}
          {/* To prevents the conversion button from being hidden because the menu is fixed. */}
          <div style={{ height: '56px' }} />
        </ClientLayout>
      </body>
    </html>
  );
}
