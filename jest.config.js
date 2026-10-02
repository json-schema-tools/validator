module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: require('path').join(__dirname, 'coverage'),
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: { global: { branches: 87.77, functions: 100, lines: 93.99, statements: 94.28 } },
  resetMocks: true,
  restoreMocks: true,
  rootDir: './src',
  preset: 'ts-jest'
};
