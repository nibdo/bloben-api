module.exports = {
  exit: true,
  reporter: 'spec',
  timeout: 20000,
  require: ['./src/test/integration/hooks.ts'],
  parallel: true,
  jobs: 2,
  verbose: true,
  recursive: true,
  spec: [
    './src/test/integration/api/*/*/*.test.ts',
    './src/test/integration/api/*/*/*/*.test.ts',
    './src/test/integration/jobs/*/*.test.ts',
  ],
};
