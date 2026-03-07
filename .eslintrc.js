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
    '@typescript-eslint/explicit-function-return-type': 'error', // Forces AI to define returns
    '@typescript-eslint/no-explicit-any': 'error', // Stops AI from being lazy
    'no-console': 'warn',
    'semi': ['error', 'always'],
  },
};
