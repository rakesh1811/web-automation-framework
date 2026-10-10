import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const resultsDir = 'allure-results';
const reportDir = 'allure-report';
const singleFileDir = path.join('reports', '.single-file');
const singleFileReport = path.join('reports', 'AutomationExercise_Allure_Report.html');
const reportName = 'AutomationExercise - Login and Signup';
const openReport = !process.argv.includes('--no-open');

const run = (command) => execSync(command, { stdio: 'inherit' });

const hasResults =
  fs.existsSync(resultsDir) && fs.readdirSync(resultsDir).some((file) => file.endsWith('-result.json'));
if (!hasResults) {
  console.error(`No test results found in ${resultsDir}. Run "npm test" first.`);
  process.exit(1);
}

run(`npx allure generate ${resultsDir} --clean --single-file -o "${singleFileDir}" --name "${reportName}"`);
fs.mkdirSync('reports', { recursive: true });
fs.copyFileSync(path.join(singleFileDir, 'index.html'), singleFileReport);
fs.rmSync(singleFileDir, { recursive: true, force: true });
console.log(`Shareable report created: ${singleFileReport}`);

run(`npx allure generate ${resultsDir} --clean -o ${reportDir} --name "${reportName}"`);
if (openReport) run(`npx allure open ${reportDir}`);
