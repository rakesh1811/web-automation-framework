import { expect } from '@playwright/test';
import type { HeaderComponent } from '../components/HeaderComponent';
import type { StepRunner } from '../core/stepRunner';
import type { AccountInformationPage } from '../pages/AccountInformationPage';
import type { AccountStatusPage } from '../pages/AccountStatusPage';
import type { AuthPage } from '../pages/AuthPage';
import type { UserAccount } from '../types';
import { MESSAGES } from '../../test-data/messages';

export interface RegistrationPages {
  authPage: AuthPage;
  accountInfoPage: AccountInformationPage;
  accountStatusPage: AccountStatusPage;
  header: HeaderComponent;
}

export async function registerThroughUi(steps: StepRunner, pages: RegistrationPages, user: UserAccount): Promise<void> {
  const { authPage, accountInfoPage, accountStatusPage, header } = pages;

  await steps.run(
    {
      title: 'Enter name and email in New User Signup, click Signup',
      action: 'Fill the New User Signup form and submit it',
      data: { Name: user.name, Email: user.email },
      expected: `"${MESSAGES.accountInformationHeading}" page opens`,
      component: authPage.signupForm.name,
    },
    async () => {
      await authPage.startSignup(user.name, user.email);
      await expect(accountInfoPage.heading).toBeVisible();
      return `Navigated to ${accountInfoPage.currentPath()}; account information form shown`;
    },
  );

  await steps.run(
    {
      title: 'Fill account details',
      action: 'Select title, enter password and date of birth, tick newsletter and offers',
      data: {
        Title: user.title,
        Password: user.password,
        'Date of birth': `${user.birthDay}/${user.birthMonth}/${user.birthYear}`,
      },
      expected: 'All account fields accept the data',
      component: accountInfoPage.name,
    },
    async () => {
      await accountInfoPage.fillAccountDetails(user);
      await expect(accountInfoPage.daySelect).toHaveValue(user.birthDay);
      await expect(accountInfoPage.monthSelect).toHaveValue(user.birthMonth);
      await expect(accountInfoPage.yearSelect).toHaveValue(user.birthYear);
      return `Title ${user.title} selected; DOB ${user.birthDay}/${user.birthMonth}/${user.birthYear}; password entered (masked)`;
    },
  );

  await steps.run(
    {
      title: 'Fill address details',
      action: 'Enter name, company, address, country, state, city, zipcode and mobile',
      data: {
        'First name': user.firstName,
        'Last name': user.lastName,
        Company: user.company,
        Address: `${user.address1}, ${user.address2}`,
        Country: user.country,
        State: user.state,
        City: user.city,
        Zipcode: user.zipcode,
        Mobile: user.mobileNumber,
      },
      expected: 'All address fields accept the data',
      component: accountInfoPage.name,
    },
    async () => {
      await accountInfoPage.fillAddressDetails(user);
      await expect(accountInfoPage.countrySelect).toHaveValue(user.country);
      await expect(accountInfoPage.mobileInput).toHaveValue(user.mobileNumber);
      return `Address fields filled; country "${await accountInfoPage.countrySelect.inputValue()}" selected`;
    },
  );

  await steps.run(
    {
      title: 'Click Create Account',
      action: 'Submit the account information form',
      expected: `"${MESSAGES.accountCreated}" is shown`,
      component: accountInfoPage.name,
    },
    async () => {
      await accountInfoPage.createAccount();
      await expect(accountStatusPage.accountCreatedHeading).toHaveText(MESSAGES.accountCreated, { ignoreCase: true });
      return `"${await accountStatusPage.accountCreatedHeading.innerText()}" shown on ${accountStatusPage.currentPath()}`;
    },
  );

  await steps.run(
    {
      title: 'Click Continue and validate logged-in user',
      action: 'Click Continue on the confirmation page',
      expected: `Header shows "${MESSAGES.loggedInAs} ${user.name}"`,
      component: header.name,
    },
    async () => {
      await accountStatusPage.continue();
      await expect(header.loggedInUserName).toHaveText(user.name);
      return `Header shows "${(await header.loggedInAs.innerText()).trim()}"`;
    },
  );
}

export async function deleteAccountThroughUi(steps: StepRunner, pages: RegistrationPages): Promise<void> {
  const { accountStatusPage, header } = pages;
  await steps.run(
    {
      title: 'Delete the account',
      action: 'Click Delete Account in the header',
      expected: `"${MESSAGES.accountDeleted}" is shown`,
      component: header.name,
    },
    async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toHaveText(MESSAGES.accountDeleted, { ignoreCase: true });
      return `"${await accountStatusPage.accountDeletedHeading.innerText()}" shown on ${accountStatusPage.currentPath()}`;
    },
  );
}

async function attemptLogin(steps: StepRunner, pages: RegistrationPages, user: UserAccount): Promise<boolean> {
  const { authPage, header } = pages;
  let isRegistered = false;
  await steps.run(
    {
      title: 'Try to log in with the email and password',
      action: 'Enter the email and password in the login form and click Login',
      data: { Email: user.email, Password: user.password },
      expected: `Either logged in, or "${MESSAGES.loginError}" shown when the user is not registered`,
      component: authPage.loginForm.name,
    },
    async () => {
      await authPage.login(user.email, user.password);
      await expect(header.loggedInAs.or(authPage.loginForm.errorMessage)).toBeVisible();
      isRegistered = await header.loggedInAs.isVisible();
      if (isRegistered)
        return `User already registered; header shows "${(await header.loggedInAs.innerText()).trim()}"`;
      await expect(authPage.loginForm.errorMessage).toHaveText(MESSAGES.loginError);
      return `User not registered: "${await authPage.loginForm.errorMessage.innerText()}"`;
    },
  );
  return isRegistered;
}

export async function loginOrRegister(steps: StepRunner, pages: RegistrationPages, user: UserAccount): Promise<void> {
  const { authPage, header } = pages;
  const isRegistered = await attemptLogin(steps, pages, user);
  if (isRegistered) return;

  await registerThroughUi(steps, pages, user);

  await steps.run(
    {
      title: 'Log out after registration',
      action: 'Click Logout in the header',
      expected: `"${MESSAGES.loginHeading}" form is shown; user logged out`,
      component: header.name,
    },
    async () => {
      await header.logout();
      await expect(authPage.loginForm.heading).toHaveText(MESSAGES.loginHeading);
      await expect(header.loggedInAs).toBeHidden();
      return `Logged out; redirected to ${authPage.currentPath()}`;
    },
  );

  await steps.run(
    {
      title: 'Log in with the same email and password',
      action: 'Enter the newly registered email and password and click Login',
      data: { Email: user.email, Password: user.password },
      expected: `Header shows "${MESSAGES.loggedInAs} ${user.name}"`,
      component: authPage.loginForm.name,
    },
    async () => {
      await authPage.login(user.email, user.password);
      await expect(header.loggedInUserName).toHaveText(user.name);
      await expect(authPage.loginForm.heading).toBeHidden();
      return `Logged in again on ${authPage.currentPath()}; header shows "${(await header.loggedInAs.innerText()).trim()}"`;
    },
  );
}
