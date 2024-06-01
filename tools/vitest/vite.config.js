/** @type {import('vitest').InlineConfig} */
module.exports = {
  include: ['**/*.test.ts'],
  globals: true,
  environment: 'jsdom',
  coverage: {
    reporter: ['lcov', 'text']
  },
  outputFile: 'coverage/sonar-report.xml'
};
