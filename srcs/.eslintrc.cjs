/**
 * ESLint config for Ming frontend (Vite + React + TypeScript).
 *
 * Notes:
 * - This repo's `npm run lint` expects a legacy ESLint config file.
 * - Keep the config minimal and aligned with installed deps.
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Vite HMR safety (requires react-refresh plugin)
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    '.vite/',
    'src/libs/chinese-lunar/',
  ],
};

