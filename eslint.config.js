const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const playwright = require('eslint-plugin-playwright');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/',
      'allure-results/',
      'allure-report/',
      'playwright-report/',
      'test-results/',
      'logs/',
      'screenshots/',
      'reports/',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': 'off',
      'playwright/valid-title': 'off',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
    },
  },
  {
    files: ['eslint.config.js', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', require: 'readonly', module: 'writable' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  prettier,
);
