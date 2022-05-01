module.exports = {
  exit: true,
  reporter: 'spec',
  timeout: 20000,
  verbose: true,
  spec: [
    './src/test/unit/*/*.test.ts',
  ],
};
