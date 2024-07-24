// For compatibility with Biome (fast linter&fmt made by Rust), the following settings are made
// to compensate for missing functions of Biome with eslint.

/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
  extends: ['next/core-web-vitals'],
  settings: {
    // NOTE: eslint cannot resolve aliases by `@` without the following two settings
    // See:https://github.com/import-js/eslint-plugin-import/issues/2765#issuecomment-1701641064
    next: {
      rootDir: __dirname,
    },
    'import/resolver': {
      typescript: {
        project: __dirname,
      },
    },
  },

  // `next/core-web-vitals` of `eslint-config-next` has sort import and `sort-props` functions, so use them.
  rules: {
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: ['builtin'],
        pathGroups: [
          { pattern: '@/**', group: 'internal', position: 'before' },
          // styles
          // treat group as index because we want it to be last
          { pattern: '@/**.css', group: 'index', position: 'before' },
          { pattern: '@/**.json', group: 'index', position: 'before' },
        ],
      },
    ],
    'react/jsx-sort-props': 'warn',
  },
};
