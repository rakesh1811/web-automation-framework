import type { TestCaseMeta } from '../src/types';

export const TEST_CASES = {
  TC01: {
    id: 'TC01',
    title: 'Login with valid credentials',
    module: 'Login',
    type: 'Positive',
    objective: 'A registered customer can sign in and reach their logged-in home page.',
    precondition: 'Registered user exists (created via API before the test)',
    expected: 'Home page loads; header shows "Logged in as {name}"; Logout link visible',
    severity: 'blocker',
    tags: ['@smoke', '@regression', '@login', '@positive'],
  },
  TC02: {
    id: 'TC02',
    title: 'Logout after successful login',
    module: 'Login',
    type: 'Positive',
    objective: 'A signed-in customer can end their session securely.',
    precondition: 'User is logged in',
    expected: 'User is taken back to /login; "Login to your account" visible; "Logged in as" no longer shown',
    severity: 'critical',
    tags: ['@regression', '@login', '@positive'],
  },
  TC03: {
    id: 'TC03',
    title: 'Valid email with wrong password',
    module: 'Login',
    type: 'Negative',
    objective: 'Access is refused when the password is wrong.',
    precondition: 'Registered user exists',
    expected: 'Error "Your email or password is incorrect!" shown; user stays on /login',
    severity: 'critical',
    tags: ['@regression', '@login', '@negative'],
  },
  TC04: {
    id: 'TC04',
    title: 'Unregistered email',
    module: 'Login',
    type: 'Negative',
    objective: 'Access is refused for an email that has no account.',
    precondition: 'None',
    expected: 'Same error message shown; user not logged in',
    severity: 'normal',
    tags: ['@regression', '@login', '@negative'],
  },
  TC05: {
    id: 'TC05',
    title: 'Blank email and password',
    module: 'Login',
    type: 'Negative',
    objective: 'The login form cannot be submitted without credentials.',
    precondition: 'None',
    expected: 'Browser required-field validation blocks submit; URL stays /login; no login',
    severity: 'normal',
    tags: ['@regression', '@login', '@negative'],
  },
  TC06: {
    id: 'TC06',
    title: 'Complete registration end to end',
    module: 'Signup',
    type: 'Positive',
    objective: 'A new customer can register, is logged in, and can delete the account.',
    precondition: 'Email not yet registered',
    expected:
      '"Account Created!" shown, then "Logged in as {name}". Cleanup: account deleted, "Account Deleted!" shown',
    severity: 'blocker',
    tags: ['@smoke', '@regression', '@e2e', '@signup', '@positive'],
  },
  TC07: {
    id: 'TC07',
    title: 'Name and email carried to account info page',
    module: 'Signup',
    type: 'Positive',
    objective: 'Signup step 1 hands the entered name and email to the account information step.',
    precondition: 'Email not yet registered',
    expected:
      'User lands on /signup; "Enter Account Information" visible; Name pre-filled; Email pre-filled and disabled',
    severity: 'critical',
    tags: ['@regression', '@signup', '@positive'],
  },
  TC08: {
    id: 'TC08',
    title: 'Signup with an already registered email',
    module: 'Signup',
    type: 'Negative',
    objective: 'Duplicate accounts cannot be created for the same email.',
    precondition: 'Registered user exists',
    expected:
      'Error "Email Address already exist!" shown; user stays on the New User Signup form (/signup); Account Information page not opened',
    severity: 'critical',
    tags: ['@regression', '@signup', '@negative'],
  },
  TC09: {
    id: 'TC09',
    title: 'Signup with invalid email format',
    module: 'Signup',
    type: 'Negative',
    objective: 'Malformed email addresses are rejected before submission.',
    precondition: 'None',
    expected: 'Browser email validation blocks submit; user stays on /login',
    severity: 'normal',
    tags: ['@regression', '@signup', '@negative'],
  },
  TC10: {
    id: 'TC10',
    title: 'Signup with blank name',
    module: 'Signup',
    type: 'Negative',
    objective: 'Name is mandatory to start signup.',
    precondition: 'None',
    expected: 'Required-field validation blocks submit; user stays on /login',
    severity: 'normal',
    tags: ['@regression', '@signup', '@negative'],
  },
  TC11: {
    id: 'TC11',
    title: 'Login, register if not found, log in again and delete account',
    module: 'Login',
    type: 'Positive',
    objective:
      'A visitor who tries to log in without an account can register with the same email and password, log in with them, and delete the account.',
    precondition: 'Email qa_{DateTimeStamp}_Automation@testmail.com not yet registered',
    expected:
      'Login rejected with "Your email or password is incorrect!"; signup completes with "Account Created!"; after logout, login with the same credentials shows "Logged in as {name}"; "Account Deleted!" shown',
    severity: 'critical',
    tags: ['@regression', '@e2e', '@login', '@signup', '@positive'],
  },
} as const satisfies Record<string, TestCaseMeta>;

export type TestCaseId = keyof typeof TEST_CASES;

export function testTitle(id: TestCaseId): string {
  return `${id} - ${TEST_CASES[id].title}`;
}

export function testDetails(id: TestCaseId): { tag: string[] } {
  return { tag: [...TEST_CASES[id].tags] };
}

export function findTestCase(title: string): TestCaseMeta | undefined {
  const id = /^(TC\d+)/.exec(title)?.[1];
  return id && id in TEST_CASES ? TEST_CASES[id as TestCaseId] : undefined;
}
