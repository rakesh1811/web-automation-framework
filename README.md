# Web Automation Framework – Playwright + TypeScript

Enterprise-style UI automation for the Login and Signup features of
(https://automationexercise.com), built with Playwright Test, TypeScript (strict),
the Page Object Model, Allure step reporting, Winston logging and GitHub Actions.

It automates the 11 test cases in `AutomationExercise_Login_Signup_TestCases.xlsx` (TC01–TC11).





**Smoke / regression / e2e** are selected by tags (`@smoke`, `@regression`, `@e2e`), defined once per test case in
`test-data/test-cases.ts`.

2. Traceability matrix

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



