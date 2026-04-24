// WO: WO-INIT-001 — extracted from package.json inline jest config
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/tests/integration', '<rootDir>/services'],
  testMatch: [
    '<rootDir>/tests/integration/**/*.spec.ts',
    '<rootDir>/services/**/src/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'commonjs',
        target: 'ES2022',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        strictNullChecks: true,
        noImplicitAny: false,
      },
    },
  },
};

module.exports = config;
