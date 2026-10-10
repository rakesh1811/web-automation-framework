import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/testFixtures';
import { deleteAccountThroughUi, loginOrRegister } from '../../src/flows/registrationFlow';
import { MESSAGES } from '../../test-data/messages';
import { testDetails, testTitle } from '../../test-data/test-cases';

test.describe('Login or register (end to end)', () => {
  test(
    testTitle('TC11'),
    testDetails('TC11'),
    async ({ authPage, accountInfoPage, accountStatusPage, header, steps, newUser }) => {
      const pages = { authPage, accountInfoPage, accountStatusPage, header };

      await steps.run(
        {
          title: 'Open the Signup / Login page',
          action: `Navigate to ${env.baseUrl}${authPage.path}`,
          expected: `"${MESSAGES.loginHeading}" and "${MESSAGES.signupHeading}" forms are visible`,
          component: authPage.name,
        },
        async () => {
          await authPage.open();
          await expect(authPage.loginForm.heading).toHaveText(MESSAGES.loginHeading);
          await expect(authPage.signupForm.heading).toHaveText(MESSAGES.signupHeading);
          return `Page ${authPage.currentPath()} loaded; both forms visible`;
        },
      );

      await loginOrRegister(steps, pages, newUser);

      await deleteAccountThroughUi(steps, pages);
    },
  );
});
