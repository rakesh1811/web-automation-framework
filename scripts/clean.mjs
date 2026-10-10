import fs from 'fs';
import path from 'path';

const removeAll = ['allure-results', 'allure-report', 'playwright-report', 'test-results'];
const emptyKeep = ['logs', 'screenshots', 'reports'];

for (const dir of removeAll) {
  fs.rmSync(dir, { recursive: true, force: true });
}
for (const dir of emptyKeep) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    if (entry !== '.gitkeep') fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}
console.log(`Cleaned: ${[...removeAll, ...emptyKeep].join(', ')}`);
