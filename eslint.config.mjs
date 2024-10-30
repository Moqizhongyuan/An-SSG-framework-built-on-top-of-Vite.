import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    ignores: [
      '.eslintrc.cjs',
      'node_modules',
      'package.json',
      'pnpm-lock.yaml',
      'dist',
      'bin',
      'esm-cjs',
      'docs',
      'eslint.config.mjs'
    ]
  },
  {
    rules: {
      // "prettier/prettier": "error",
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': 'off'
    }
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
