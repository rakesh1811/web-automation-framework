import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/testFixtures';
import { deleteAccountThroughUi, registerThroughUi } from '../../src/flows/registrationFlow';
import { MESSAGES } from '../../test-data/messages';
import { testDetails, testTitle } from '../../test-data/test-cases';

test.describe('Registration (end to end)', () => {
  test(
    testTitle('TC06'),
    testDetails('TC06'),
    async ({ authPage, accountInfoPage, accountStatusPage, header, steps, newUser }) => {
      const pages = { authPage, accountInfoPage, accountStatusPage, header };

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
          return `Page ${authPage.currentPath()} loaded; "${MESSAGES.signupHeading}" visible`;
        },
      );

      await registerThroughUi(steps, pages, newUser);
      await deleteAccountThroughUi(steps, pages);
    },
  );
});
