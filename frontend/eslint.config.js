import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

const spacingRules = {
  indent: ['error', 2, { SwitchCase: 1 }],
  'no-trailing-spaces': 'error',
  'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
  'space-before-blocks': 'error',
  'keyword-spacing': 'error',
  'space-infix-ops': 'error',
  'space-in-parens': ['error', 'never'],
  'array-bracket-spacing': ['error', 'never'],
  'object-curly-spacing': ['error', 'always'],
  'comma-spacing': ['error', { before: false, after: true }],
  'block-spacing': 'error',
  'eol-last': ['error', 'always'],
  'no-whitespace-before-property': 'error',
  'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
};

const reactRules = {
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
};

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    // Plain JS/JSX: full core "recommended" semantic rules apply cleanly here.
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: { ...js.configs.recommended.rules, ...reactRules, ...spacingRules },
  },
  {
    // TS/TSX: parsed via Babel (typescript-eslint can't run against TS 7 yet, see below).
    // Core JS semantic rules (no-undef, etc.) don't understand TS-only syntax like
    // interface bodies, so only spacing + React rules run here; TypeScript itself
    // already covers the semantic checks those core rules would otherwise provide.
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: { ...reactRules, ...spacingRules },
  },
];
