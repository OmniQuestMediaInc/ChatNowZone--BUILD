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
