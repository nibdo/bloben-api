module.exports = {
  exit: true,
  reporter: 'spec',
  timeout: 20000,
  require: ['./src/test/integration/hooks.ts'],
  parallel: true,
  jobs: 2,
  verbose: true,
  spec: [
    './src/test/integration/app/*/*/*.test.ts',
    './src/test/integration/app/*/*/*/*.test.ts',
    './src/test/integration/app/jobs/*/*.test.ts',
  ],
};
