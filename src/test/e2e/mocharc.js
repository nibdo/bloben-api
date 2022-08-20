module.exports = {
  exit: true,
  require: ['./src/test/e2e/hooks.ts'],
  reporter: 'spec',
  timeout: 20000,
  parallel: true,
  jobs: 2,
  verbose: true,
  spec: [
    './src/test/e2e/calDAV/*/*.test.ts',
  ],
};
