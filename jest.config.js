module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/web/static/js', '<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/web/static/js/tests/setup.js'],
  collectCoverageFrom: [
    'web/static/js/**/*.js',
    '!web/static/js/tests/**',
    '!**/node_modules/**',
    '!tests/**',
  ],
};