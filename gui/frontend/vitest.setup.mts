import '@testing-library/jest-dom/vitest';
import { loadEnvConfig } from '@next/env';
import { configure } from '@testing-library/react';

loadEnvConfig(process.cwd());

configure({
  testIdAttribute: 'data-test',
});
