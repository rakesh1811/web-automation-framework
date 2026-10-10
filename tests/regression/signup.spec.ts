import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/testFixtures';
import { describeValidity, getFieldValidity } from '../../src/utils/formValidation';
import { INVALID_DATA, MESSAGES } from '../../test-data/messages';
import { testDetails, testTitle } from '../../test-data/test-cases';

const LOGIN_URL = /\/login(\?.*)?$/;
const SIGNUP_URL = /\/signup(\?.*)?$/;

test.describe('Signup', () => {
  test.beforeEach(async ({ authPage, steps }) => {
    await steps.run(
      {
        title: 'Open the Signup / Login page',
        action: `Navigate to ${env.baseUrl}${authPage.path}`,
        expected: `"${MESSAGES.signupHeading}" form is visible`,
        component: authPage.name,
      },
      async () => {
        await authPage.open();
        await expect(authPage.signupForm.heading).toHaveText(MESSAGES.signupHeading);
        return `Page ${authPage.currentPath()} loaded; heading "${await authPage.signupForm.heading.innerText()}" visible`;
      },
    );
  });

  test(testTitle('TC07'), testDetails('TC07'), async ({ page, authPage, accountInfoPage, steps, newUser }) => {
    await steps.run(
      {
        title: 'Enter name and a new email, click Signup',
        action: 'Fill the New User Signup form and submit it',
        data: { Name: newUser.name, Email: newUser.email },
        expected: 'User is taken to the account information step',
        component: authPage.signupForm.name,
      },
      async () => {
        await authPage.startSignup(newUser.name, newUser.email);
        await expect(page).toHaveURL(SIGNUP_URL);
        return `Navigated to ${accountInfoPage.currentPath()}`;
      },
    );

    await steps.run(
      {
        title: 'Validate account information page and pre-filled fields',
        action: 'Read the heading and the Name / Email fields',
        data: { 'Expected name': newUser.name, 'Expected email': newUser.email },
        expected: `"${MESSAGES.accountInformationHeading}" visible; Name pre-filled; Email pre-filled and disabled`,
        component: accountInfoPage.name,
      },
      async () => {
        await expect(accountInfoPage.heading).toBeVisible();
        await expect(accountInfoPage.nameInput).toHaveValue(newUser.name);
        await expect(accountInfoPage.emailInput).toHaveValue(newUser.email);
        await expect(accountInfoPage.emailInput).toBeDisabled();
        const name = await accountInfoPage.nameInput.inputValue();
        const email = await accountInfoPage.emailInput.inputValue();
        return `Heading visible; Name="${name}"; Email="${email}" (disabled)`;
      },
    );
  });

  test(testTitle('TC08'), testDetails('TC08'), async ({ page, authPage, accountInfoPage, steps, registeredUser }) => {
    await steps.run(
      {
        title: 'Enter a name and an already registered email, click Signup',
        action: 'Fill the New User Signup form with an existing email and submit it',
        data: { Name: registeredUser.name, Email: registeredUser.email },
        expected: 'Signup is rejected',
        component: authPage.signupForm.name,
      },
      async () => {
        await authPage.startSignup(registeredUser.name, registeredUser.email);
        await expect(authPage.signupForm.errorMessage).toBeVisible();
        return `Form submitted; an error message appeared on ${authPage.currentPath()}`;
      },
    );

    await steps.run(
      {
        title: 'Validate duplicate-email error',
        action: 'Read the signup form error, the current page and the URL',
        expected: `Error "${MESSAGES.signupEmailExists}" shown; user stays on the New User Signup form; Account Information page not opened`,
        component: authPage.signupForm.name,
      },
      async () => {
        await expect(authPage.signupForm.errorMessage).toHaveText(MESSAGES.signupEmailExists);
        await expect(authPage.signupForm.heading).toHaveText(MESSAGES.signupHeading);
        await expect(accountInfoPage.heading).toBeHidden();
        await expect(page).toHaveURL(SIGNUP_URL);
        return `Error "${await authPage.signupForm.errorMessage.innerText()}" on ${authPage.currentPath()}; signup form still shown; Account Information page not opened`;
      },
    );
  });

  test(testTitle('TC09'), testDetails('TC09'), async ({ page, authPage, steps, newUser }) => {
    await steps.run(
      {
        title: 'Enter a name and an email without "@", click Signup',
        action: 'Fill the New User Signup form with a malformed email and submit it',
        data: { Name: newUser.name, Email: INVALID_DATA.emailWithoutAt },
        expected: 'Browser email validation blocks the submit',
        component: authPage.signupForm.name,
      },
      async () => {
        await authPage.startSignup(newUser.name, INVALID_DATA.emailWithoutAt);
        const validity = await getFieldValidity(authPage.signupForm.emailInput);
        expect(validity.valid).toBe(false);
        expect(validity.typeMismatch).toBe(true);
        return describeValidity('Email', validity);
      },
    );

    await steps.run(
      {
        title: 'Validate user stays on the login page',
        action: 'Check the current URL and the signup form',
        expected: 'User stays on /login',
        component: authPage.name,
      },
      async () => {
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(authPage.signupForm.heading).toBeVisible();
        return `Still on ${authPage.currentPath()}`;
      },
    );
  });

  test(testTitle('TC10'), testDetails('TC10'), async ({ page, authPage, steps, newUser }) => {
    await steps.run(
      {
        title: 'Leave Name empty, enter a valid email, click Signup',
        action: 'Fill only the email field of the New User Signup form and submit it',
        data: { Name: '(blank)', Email: newUser.email },
        expected: 'Required-field validation blocks the submit',
        component: authPage.signupForm.name,
      },
      async () => {
        await authPage.startSignup('', newUser.email);
        const validity = await getFieldValidity(authPage.signupForm.nameInput);
        expect(validity.valid).toBe(false);
        expect(validity.valueMissing).toBe(true);
        return describeValidity('Name', validity);
      },
    );

    await steps.run(
      {
        title: 'Validate user stays on the login page',
        action: 'Check the current URL and the signup form',
        expected: 'User stays on /login',
        component: authPage.name,
      },
      async () => {
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(authPage.signupForm.heading).toBeVisible();
        return `Still on ${authPage.currentPath()}`;
      },
    );
  });
});
