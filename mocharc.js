module.exports = {
  exit: true,
  require: ['./src/test/hooks.ts'],
  reporter: 'spec',
  timeout: 20000,
  verbose: true,
  spec: [
    './src/test/app/*/*/*.test.ts',
    './src/test/app/jobs/*/*.test.ts',
    './src/test/app/utils/*.test.ts',
  ],
};
