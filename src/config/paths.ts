import path from 'path';

const root = path.resolve(__dirname, '../..');

export const paths = Object.freeze({
  logs: path.join(root, 'logs'),
  screenshots: path.join(root, 'screenshots'),
  allureResults: path.join(root, 'allure-results'),
  playwrightReport: path.join(root, 'playwright-report'),
  testResults: path.join(root, 'test-results'),
});
