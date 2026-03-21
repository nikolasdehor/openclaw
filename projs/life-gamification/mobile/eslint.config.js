import tseslint from 'typescript-eslint';
import expo from 'eslint-config-expo/flat.js';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default tseslint.config(
  {
    extends: [expo],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...expo.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-native/no-inline-styles': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  }
);
