module.exports = {
  exit: true,
  require: ['./src/test/integration/hooks.ts'],
  reporter: 'spec',
  timeout: 20000,
  verbose: true,
  spec: [
    './src/test/integration/app/*/*/*.test.ts',
    './src/test/integration/app/jobs/*/*.test.ts',
  ],
};
