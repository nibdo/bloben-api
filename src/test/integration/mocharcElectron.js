module.exports = {
  exit: true,
  reporter: 'spec',
  timeout: 20000,
  require: ['./src/test/integration/hooks.ts'],
  parallel: true,
  jobs: 1,
  verbose: true,
  recursive: true,
  spec: [
    './src/test/integration/api/app/*/*.test.ts',
    './src/test/integration/jobs/*/*.test.ts',
  ],
  exclude: ['./src/test/integration/api/app/auth/*.test.ts'],
};
