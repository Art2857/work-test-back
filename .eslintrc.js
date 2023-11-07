module.exports = {
    overrides: [
        {
            files: ['*.ts'],
            extends: [
                'eslint:recommended',
                'plugin:prettier/recommended',
                'prettier',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/eslint-recommended',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: 'tsconfig.json',
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint/eslint-plugin', 'import'],
            // Custom rules
            rules: {
                'prettier/prettier': [
                    'warn',
                    {
                        printWidth: 120,
                    },
                ],
                'prefer-template': 'off',
                'class-methods-use-this': 'off',
                'lines-between-class-members': 'off',
                'no-return-assign': 'off',
                'import/order': [
                    'error',
                    { groups: ['external', 'builtin', 'internal', 'index', 'sibling', 'parent'] },
                ],
                'no-underscore-dangle': 'off',
                'prefer-destructuring': 'off',
                '@typescript-eslint/lines-between-class-members': ['off', 'always', { exceptAfterOverload: false }],
                'object-shorthand': ['warn', 'always'],
                '@typescript-eslint/unbound-method': [
                    'error',
                    {
                        ignoreStatic: true,
                    },
                ],
                '@typescript-eslint/no-explicit-any': 'warn',
                'import/no-duplicates': ['error'],
                eqeqeq: ['warn', 'always'],
                '@typescript-eslint/no-shadow': 'warn',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            },
        },
    ],
};
