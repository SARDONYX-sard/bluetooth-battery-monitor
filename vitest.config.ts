// This file is a test configuration file for gui/frontend.
// By placing the configuration file in the root directory, it eliminates wasted time in directory searches
// and prevents time delays in testing.

import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    alias: [{ find: '@/', replacement: `${__dirname}/gui/frontend/src/` }],
    globals: true,
    root: './gui/frontend/src/',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    testTransformMode: {
      ssr: ['**/*'],
    },
    reporters: ['default', 'hanging-process'],
  },
});
