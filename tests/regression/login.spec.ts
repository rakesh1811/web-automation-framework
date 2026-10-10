import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/testFixtures';
import { describeValidity, getFieldValidity } from '../../src/utils/formValidation';
import { uniqueEmail } from '../../src/utils/dataFactory';
import { INVALID_DATA, MESSAGES } from '../../test-data/messages';
import { testDetails, testTitle } from '../../test-data/test-cases';

const LOGIN_URL = /\/login(\?.*)?$/;

test.describe('Login', () => {
  test.beforeEach(async ({ authPage, steps }) => {
    await steps.run(
      {
        title: 'Open the Signup / Login page',
        action: `Navigate to ${env.baseUrl}${authPage.path}`,
        expected: `"${MESSAGES.loginHeading}" form is visible`,
        component: authPage.name,
      },
      async () => {
        await authPage.open();
        await expect(authPage.loginForm.heading).toHaveText(MESSAGES.loginHeading);
        return `Page ${authPage.currentPath()} loaded; heading "${await authPage.loginForm.heading.innerText()}" visible`;
      },
    );
  });

  test(testTitle('TC01'), testDetails('TC01'), async ({ authPage, header, steps, registeredUser }) => {
    await steps.run(
      {
        title: 'Enter registered credentials',
        action: 'Type the registered email and password into the login form',
        data: { Email: registeredUser.email, Password: registeredUser.password },
        expected: 'Both fields accept the values',
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.loginForm.fill(registeredUser.email, registeredUser.password);
        await expect(authPage.loginForm.emailInput).toHaveValue(registeredUser.email);
        return `Email field contains ${registeredUser.email}; password entered (masked)`;
      },
    );

    await steps.run(
      {
        title: 'Click Login',
        action: 'Click the Login button',
        expected: 'User is signed in and leaves the login page',
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.loginForm.submit();
        await expect(header.loggedInAs).toBeVisible();
        return `Navigated to ${authPage.currentPath()}`;
      },
    );

    await steps.run(
      {
        title: 'Validate logged-in header',
        action: 'Check the header for the logged-in user and the Logout link',
        data: { 'Expected name': registeredUser.name },
        expected: `Header shows "${MESSAGES.loggedInAs} ${registeredUser.name}"; Logout link visible`,
        component: header.name,
      },
      async () => {
        await expect(header.loggedInUserName).toHaveText(registeredUser.name);
        await expect(header.logoutLink).toBeVisible();
        return `Header shows "${(await header.loggedInAs.innerText()).trim()}"; Logout link visible`;
      },
    );
  });

  test(testTitle('TC02'), testDetails('TC02'), async ({ page, authPage, header, steps, registeredUser }) => {
    await steps.run(
      {
        title: 'Log in with a valid user',
        action: 'Enter registered credentials and click Login',
        data: { Email: registeredUser.email, Password: registeredUser.password },
        expected: `"${MESSAGES.loggedInAs} ${registeredUser.name}" is shown`,
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.login(registeredUser.email, registeredUser.password);
        await expect(header.loggedInUserName).toHaveText(registeredUser.name);
        return `Logged in; header shows "${(await header.loggedInAs.innerText()).trim()}"`;
      },
    );

    await steps.run(
      {
        title: 'Click Logout',
        action: 'Click the Logout link in the header',
        expected: 'User is taken back to /login',
        component: header.name,
      },
      async () => {
        await header.logout();
        await expect(authPage.loginForm.heading).toBeVisible();
        await expect(page).toHaveURL(LOGIN_URL);
        return `Redirected to ${authPage.currentPath()}`;
      },
    );

    await steps.run(
      {
        title: 'Validate logged-out state',
        action: 'Check the login form heading and the header',
        expected: `"${MESSAGES.loginHeading}" visible; "${MESSAGES.loggedInAs}" no longer shown`,
        component: authPage.name,
      },
      async () => {
        await expect(authPage.loginForm.heading).toHaveText(MESSAGES.loginHeading);
        await expect(header.loggedInAs).toBeHidden();
        return `"${MESSAGES.loginHeading}" visible; "${MESSAGES.loggedInAs}" not displayed`;
      },
    );
  });

  test(testTitle('TC03'), testDetails('TC03'), async ({ page, authPage, header, steps, registeredUser }) => {
    await steps.run(
      {
        title: 'Enter registered email with a wrong password and submit',
        action: 'Type a registered email and an incorrect password, click Login',
        data: { Email: registeredUser.email, Password: INVALID_DATA.wrongPassword },
        expected: 'Login is rejected',
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.login(registeredUser.email, INVALID_DATA.wrongPassword);
        await expect(authPage.loginForm.errorMessage).toBeVisible();
        return 'Form submitted; an error message appeared';
      },
    );

    await steps.run(
      {
        title: 'Validate error message and page',
        action: 'Read the login form error and the current URL',
        expected: `Error "${MESSAGES.loginError}" shown; user stays on /login`,
        component: authPage.loginForm.name,
      },
      async () => {
        await expect(authPage.loginForm.errorMessage).toHaveText(MESSAGES.loginError);
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(header.loggedInAs).toBeHidden();
        return `Error "${await authPage.loginForm.errorMessage.innerText()}" on ${authPage.currentPath()}; not logged in`;
      },
    );
  });

  test(testTitle('TC04'), testDetails('TC04'), async ({ authPage, header, steps }) => {
    const unregisteredEmail = uniqueEmail('notregistered');

    await steps.run(
      {
        title: 'Enter an unregistered email and submit',
        action: 'Type an email that was never registered and any password, click Login',
        data: { Email: unregisteredEmail, Password: INVALID_DATA.wrongPassword },
        expected: 'Login is rejected',
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.login(unregisteredEmail, INVALID_DATA.wrongPassword);
        await expect(authPage.loginForm.errorMessage).toBeVisible();
        return 'Form submitted; an error message appeared';
      },
    );

    await steps.run(
      {
        title: 'Validate error message and logged-out state',
        action: 'Read the login form error and check the header',
        expected: `Error "${MESSAGES.loginError}" shown; user not logged in`,
        component: authPage.loginForm.name,
      },
      async () => {
        await expect(authPage.loginForm.errorMessage).toHaveText(MESSAGES.loginError);
        await expect(header.loggedInAs).toBeHidden();
        return `Error "${await authPage.loginForm.errorMessage.innerText()}"; "${MESSAGES.loggedInAs}" not displayed`;
      },
    );
  });

  test(testTitle('TC05'), testDetails('TC05'), async ({ page, authPage, header, steps }) => {
    await steps.run(
      {
        title: 'Submit the login form with both fields empty',
        action: 'Leave email and password blank, click Login',
        data: { Email: '(blank)', Password: '(blank)' },
        expected: 'Browser required-field validation blocks the submit',
        component: authPage.loginForm.name,
      },
      async () => {
        await authPage.loginForm.submit();
        const validity = await getFieldValidity(authPage.loginForm.emailInput);
        expect(validity.valid).toBe(false);
        expect(validity.valueMissing).toBe(true);
        return describeValidity('Email', validity);
      },
    );

    await steps.run(
      {
        title: 'Validate user stays on the login page',
        action: 'Check the current URL and the header',
        expected: 'URL stays /login; no login',
        component: authPage.name,
      },
      async () => {
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(authPage.loginForm.heading).toBeVisible();
        await expect(header.loggedInAs).toBeHidden();
        return `Still on ${authPage.currentPath()}; "${MESSAGES.loggedInAs}" not displayed`;
      },
    );
  });
});
