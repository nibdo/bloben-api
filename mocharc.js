module.exports = {
  exit: true,
  require: ['./src/test/hooks.ts'],
  reporter: 'spec',
  timeout: 20000,
  spec: ['./src/test/app/*/*/*.test.ts', './src/test/app/jobs/*/*.test.ts'],
};
