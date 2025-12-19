import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  /* -------------------------------------------------- */
  /* Base JS rules                                      */
  /* -------------------------------------------------- */
  js.configs.recommended,

  /* -------------------------------------------------- */
  /* TypeScript recommended (type-aware)                */
  /* -------------------------------------------------- */
  ...tseslint.configs.recommended,

  /* -------------------------------------------------- */
  /* TypeScript / TSX files                             */
  /* -------------------------------------------------- */
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  /* -------------------------------------------------- */
  /* JavaScript / JSX files (ESM)                        */
  /* -------------------------------------------------- */
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
    },
  },

  /* -------------------------------------------------- */
  /* React                                              */
  /* -------------------------------------------------- */
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  /* -------------------------------------------------- */
  /* Jest config & setup (CommonJS / Node)               */
  /* -------------------------------------------------- */
  {
    files: ['jest.config.js', 'jest-setup.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  /* -------------------------------------------------- */
  /* Jest test files                                    */
  /* -------------------------------------------------- */
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  /* -------------------------------------------------- */
  /* Datasource (Grafana-style exception)                */
  /* -------------------------------------------------- */
  {
    files: ['src/datasource.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  /* -------------------------------------------------- */
  /* Ignore patterns                                    */
  /* -------------------------------------------------- */
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.config/**',
    ],
  },
];
