/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: './',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/?(*.)test.[jt]s?(x)'],
  testEnvironment: 'jest-environment-jsdom'
};
