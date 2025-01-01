import packageJson from '@/../../package.json';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: packageJson.name,
  description: packageJson.description,
};
