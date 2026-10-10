# Web Automation Framework – Playwright + TypeScript

Enterprise-style UI automation for the **Login** and **Signup** features of
[automationexercise.com](https://automationexercise.com), built with Playwright Test, TypeScript (strict),
the Page Object Model, Allure step reporting, Winston logging and GitHub Actions.

It automates the 11 test cases in `AutomationExercise_Login_Signup_TestCases.xlsx` (TC01–TC11).

---

## 1. Architecture

```
├── src/
│   ├── components/        # Reusable UI parts: HeaderComponent, LoginFormComponent, SignupFormComponent
│   ├── pages/             # Page objects: BasePage, AuthPage (/login), AccountInformationPage (/signup), AccountStatusPage
│   ├── core/stepRunner.ts # Allure step + screenshot + log wrapper used by every test step
│   ├── flows/             # Reusable business flows: register, login-or-register, delete account (TC06, TC11)
│   ├── fixtures/          # Custom Playwright fixtures (page objects, StepRunner, test users, Allure labels)
│   ├── services/          # AccountApiService – creates/deletes test users through the public API
│   ├── config/            # env.ts (dotenv, validated) and paths.ts (artifact folders)
│   ├── utils/             # logger, masking, form validation, ad blocking, data factory, text helpers
│   └── types/             # Shared TypeScript interfaces
├── tests/
│   ├── regression/        # login.spec.ts (TC01–TC05), signup.spec.ts (TC07–TC10)
│   └── e2e/               # registration.spec.ts (TC06), login-or-register.spec.ts (TC11)
├── test-data/             # test-cases.ts (traceability matrix), messages.ts, account-profile.json
├── .github/workflows/     # playwright.yml – CI pipeline
├── logs/ screenshots/ reports/   # generated at run time (git-ignored)
└── playwright.config.ts, tsconfig.json, eslint.config.js, .prettierrc.json, .env.example
```

**Design principles**

| Principle                    | Where                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Single Responsibility        | Pages hold locators + actions only; tests hold assertions; `StepRunner` only reports; `AccountApiService` only talks to the API |
| Open/Closed                  | New pages/components plug into `testFixtures.ts` without changing existing ones                                                 |
| Liskov                       | All pages extend the small `BasePage` contract (`open`, `currentPath`)                                                          |
| Interface Segregation        | Components expose only what their form needs (`LoginFormComponent` vs `SignupFormComponent`)                                    |
| Dependency Inversion         | Tests receive page objects, services and the step runner through fixtures, never `new` them                                     |
| Composition over inheritance | `AuthPage` is composed of the two form components                                                                               |

**Smoke / regression / e2e** are selected by tags (`@smoke`, `@regression`, `@e2e`), defined once per test case in
`test-data/test-cases.ts`.

## 2. Traceability matrix

| TC   | Scenario                                                      | Type     | Spec                                  | Tags                   |
| ---- | ------------------------------------------------------------- | -------- | ------------------------------------- | ---------------------- |
| TC01 | Login with valid credentials                                  | Positive | `tests/regression/login.spec.ts`      | smoke, regression      |
| TC02 | Logout after successful login                                 | Positive | `tests/regression/login.spec.ts`      | regression             |
| TC03 | Valid email with wrong password                               | Negative | `tests/regression/login.spec.ts`      | regression             |
| TC04 | Unregistered email                                            | Negative | `tests/regression/login.spec.ts`      | regression             |
| TC05 | Blank email and password                                      | Negative | `tests/regression/login.spec.ts`      | regression             |
| TC06 | Complete registration end to end                              | Positive | `tests/e2e/registration.spec.ts`      | smoke, regression, e2e |
| TC07 | Name and email carried to account info page                   | Positive | `tests/regression/signup.spec.ts`     | regression             |
| TC08 | Signup with an already registered email                       | Negative | `tests/regression/signup.spec.ts`     | regression             |
| TC09 | Signup with invalid email format                              | Negative | `tests/regression/signup.spec.ts`     | regression             |
| TC10 | Signup with blank name                                        | Negative | `tests/regression/signup.spec.ts`     | regression             |
| TC11 | Login, register if not found, log in again and delete account | Positive | `tests/e2e/login-or-register.spec.ts` | regression, e2e        |

## 3. Prerequisites

- **Node.js 20+** and npm
- **Git**
- **Java 8+ (JRE)** – required only by `allure-commandline` to generate/open the Allure report
- Internet access to `automationexercise.com`

## 4. Installation

```bash
git clone https://github.com/rakesh1811/web-automation-framework.git
cd web-automation-framework
git checkout Development
npm install
npx playwright install chromium
cp .env.example .env        # Windows: copy .env.example .env
```

Commit the generated `package-lock.json` so CI can use `npm ci`.

## 5. Environment configuration

All settings live in `.env` (see `.env.example`) and are read only through `src/config/env.ts`, which validates them.

| Variable           | Default                          | Purpose                                                               |
| ------------------ | -------------------------------- | --------------------------------------------------------------------- |
| `BASE_URL`         | `https://automationexercise.com` | Application under test                                                |
| `API_BASE_URL`     | `${BASE_URL}/api`                | API used to create/delete test users                                  |
| `BROWSER`          | `chromium`                       | `chromium`, `firefox` or `webkit`                                     |
| `HEADLESS`         | `false`                          | `true` to run without a visible browser (CI sets `true`)              |
| `WORKERS`          | `1`                              | Parallel workers – raise only after the suite is stable               |
| `LOG_LEVEL`        | `info`                           | `debug`, `info`, `warn`, `error`                                      |
| `STEP_SCREENSHOTS` | `true`                           | Screenshot after every passed step (failed steps are always captured) |
| `BLOCK_ADS`        | `true`                           | Blocks third-party ad hosts that cover the page and break clicks      |

No real credentials are needed: every test user is generated at run time with a unique email in the format
`qa_<DateTimeStamp>_Automation@testmail.com` (e.g. `qa_20261010150812345_Automation@testmail.com`) and a random
password, and deleted afterwards.

## 6. Running tests

| Command                                   | What it does                                   |
| ----------------------------------------- | ---------------------------------------------- |
| `npm test`                                | All tests, headless                            |
| `npm run test:headed`                     | All tests with a visible browser               |
| `npm run test:smoke`                      | `@smoke` tests (TC01, TC06)                    |
| `npm run test:regression`                 | `@regression` tests (all 11)                   |
| `npm run test:e2e`                        | End-to-end flows (TC06, TC11)                  |
| `npm run test:debug`                      | Playwright Inspector, step by step             |
| `npx playwright test -g "TC03"`           | A single test case                             |
| `npm run lint` / `npm run lint:fix`       | ESLint                                         |
| `npm run typecheck`                       | TypeScript strict check                        |
| `npm run format` / `npm run format:check` | Prettier                                       |
| `npm run report:allure`                   | Build the Allure report from `allure-results/` |
| `npm run report:open`                     | Open the Allure report                         |
| `npm run report:html`                     | Open Playwright's HTML report                  |
| `npm run clean`                           | Delete generated artifacts                     |

## 7. Allure reporting

Each test shows:

- **Labels:** test case ID, epic, feature (Login / Signup), story, suite, severity, tags
- **Description:** business objective, precondition and expected result from the test case sheet
- **Parameters:** browser, environment, attempt number (excluded from history so retries group correctly)
- **Environment widget:** base URL, browser, headless, workers, retries, Node.js version, OS
- **Nested steps** `Step 1: …`, `Step 2: …`, each with:
  - `Action`, `Page / component`, `Test data: …` (passwords shown masked), `Expected`, `Actual`, `Status`
  - a screenshot after the step (passed or failed)
  - Playwright's own sub-steps for every locator action and `expect` assertion
- **Failure details:** error and stack trace attached to the failing step, Playwright failure screenshot, video and trace
- **Execution log** attachment with the test's log lines
- **Retries:** each attempt appears in the test's _Retries_ tab

```bash
npm test
npm run report:allure
npm run report:open
```

## 8. Screenshots, logs and diagnostics

| Artifact                         | Location                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Step screenshots                 | `screenshots/<TC>/retry-<n>/<TC>_retry<n>_step<NN>_<step>_<passed\|failed>.png` |
| Execution log (all levels)       | `logs/execution.log`                                                            |
| Errors only                      | `logs/error.log`                                                                |
| Failure screenshot, video, trace | `test-results/<test>/` (one folder per attempt)                                 |
| Allure results / report          | `allure-results/`, `allure-report/`                                             |
| Playwright HTML report           | `playwright-report/`                                                            |

Password inputs are masked in every screenshot, and values whose key contains "password", "token" or "secret"
are masked in logs and Allure parameters.

Log line format:

```
2026-10-10 14:02:11.532 [INFO] [TC03] [Step 2] [Retry 0] [Login form] PASSED in 812 ms | Expected: ... | Actual: ...
```

## 9. Retry behaviour

`retries: 2` in `playwright.config.ts`: a failing test runs up to **3 times** (initial attempt + 2 retries).
Each attempt gets its own screenshots folder, trace and log lines. At the end of every attempt the log records
one of: `PASSED on initial attempt`, `PASSED after retry N`, `FAILED on attempt N; will retry`, or
`FAILED after exhausting 2 retries`. Playwright marks tests that pass only after a retry as **flaky**.
There are no custom retry loops around actions.

## 10. Exception handling

- `StepRunner.run` logs the failure with test case, step and retry context, attaches the stack trace and a
  screenshot to the failing Allure step, then **re-throws the original error unchanged** so the test fails honestly.
- Screenshot problems are logged as warnings and never hide the original failure.
- Test-user cleanup runs in fixture teardown; a cleanup problem is logged as a warning without changing the test result.
- No empty catch blocks; no success is logged for a failed operation.

## 11. Locator conventions (XPath)

- Relative XPath, anchored on stable attributes: `//form[@action='/login']//input[@data-qa='login-email']`
- Scope to the owning form or region first, so locators never match elements elsewhere on the page
- No absolute paths, no positional indexes
- Case-insensitive text match helper (`xpathContainsTextCI`) for headings styled in upper case
- Locators live only in page/component classes

**Locator verification status**

All locators were verified against the live site: `/login` (both forms, inputs, buttons, `required` and
`type="email"` attributes) by inspection, and the Account Information page, account status pages, header links and
form error messages through a local execution of the suite.

## 12. Adding a page object and a test

1. Create `src/pages/MyPage.ts` extending `BasePage` (or a component in `src/components/`).
2. Register it in `src/fixtures/testFixtures.ts`:
   ```ts
   myPage: async ({ page }, use) => use(new MyPage(page)),
   ```
3. Add the test case to `test-data/test-cases.ts` (ID, title, objective, expected, severity, tags).
4. Write the test using the fixture and `steps.run`:
   ```ts
   test(testTitle('TC11'), testDetails('TC11'), async ({ myPage, steps }) => {
     await steps.run(
       { title: 'Open page', action: 'Navigate to /my-page', expected: 'Heading visible', component: myPage.name },
       async () => {
         await myPage.open();
         await expect(myPage.heading).toBeVisible();
         return 'Heading visible';
       },
     );
   });
   ```

## 13. CI/CD (GitHub Actions)

`.github/workflows/playwright.yml` runs on push / pull request to `Development` and `main`, and on demand
(_Actions → Playwright Tests → Run workflow_, choose `smoke`, `regression`, `e2e` or `all`). It installs
dependencies and Chromium, runs lint and type check, runs the suite, builds the Allure report, and uploads
`allure-report` and `test-evidence` (results, traces, screenshots, logs) as artifacts for 14 days.
Reports are kept as private workflow artifacts, not published publicly. Override `BASE_URL`, `API_BASE_URL` or
`WORKERS` with repository _Variables_; put any future credentials in _Secrets_.

## 14. Git workflow

- Work on the `Development` branch; open pull requests to `main`.
- Run `npm run lint && npm run typecheck && npm run test:smoke` before pushing.
- Never commit `.env`, `node_modules/` or generated reports (already in `.gitignore`).
- Commit messages follow Conventional Commits, e.g. `feat: add checkout tests`.

## 15. Troubleshooting

| Symptom                                      | Fix                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Clicks time out / element covered            | Keep `BLOCK_ADS=true`; the site's ad vignettes intercept clicks                                  |
| `allure: command not found` or Java error    | Install Java 8+ and make sure `java -version` works                                              |
| `Executable doesn't exist`                   | Run `npx playwright install chromium`                                                            |
| Precondition step fails on `createAccount`   | The public API may be down or rate-limited; rerun later                                          |
| A locator stops matching after a site change | Inspect the page and update the matching page object (see §11)                                   |
| Test passes only on retry (flaky)            | Open the trace for the failed attempt: `npx playwright show-trace test-results/<test>/trace.zip` |
