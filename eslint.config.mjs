import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  {
    ignores: ['lib/**', 'docs/**', 'node_modules/**', '**/*.js', '**/*.mjs', '**/*.cjs'],
  },
  js.configs.recommended,
  tsPlugin.configs['flat/eslint-recommended'],
  ...tsPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        __VERSION__: 'readonly',
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      // Newly part of eslint:recommended in v9+; would require ES2022 Error `cause`.
      'preserve-caught-error': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
