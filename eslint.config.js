import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-console': 'warn',
            'prefer-const': 'warn',
            'no-var': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            complexity: ['warn', { max: 10 }],
            'max-depth': ['warn', { max: 4 }],
            'max-lines-per-function': [
                'warn',
                { max: 50, skipBlankLines: true, skipComments: true },
            ],
        },
    },
    {
        ignores: ['dist/', 'coverage/', 'node_modules/', 'playwright-report/'],
    }
);
