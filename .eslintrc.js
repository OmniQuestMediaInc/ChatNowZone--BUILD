module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: { node: true, jest: true },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'warn',
    'semi': ['error', 'always'],
  },
    '@typescript-eslint/explicit-function-return-type': 'error', // Forces AI to define returns
    '@typescript-eslint/no-explicit-any': 'error', // Stops AI from being lazy
    'no-console': 'warn',
    'semi': ['error', 'always'],
  },
// WO: WO-INIT-001
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // Enforce explicit return types on functions
    '@typescript-eslint/explicit-function-return-type': 'error',
    // Disallow use of any
    '@typescript-eslint/no-explicit-any': 'error',
    // Require await on async functions
    '@typescript-eslint/require-await': 'error',
    // Enforce consistent type assertions
    '@typescript-eslint/consistent-type-assertions': 'error',
    // No floating promises
    '@typescript-eslint/no-floating-promises': 'error',
    // No unused variables
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
