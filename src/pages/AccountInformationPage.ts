import type { Locator, Page } from '@playwright/test';
import type { UserAccount } from '../types';
import { fillSecret } from '../utils/secureInput';
import { xpathContainsTextCI } from '../utils/text';
import { BasePage } from './BasePage';

export class AccountInformationPage extends BasePage {
  readonly heading: Locator;
  readonly titleMr: Locator;
  readonly titleMrs: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly daySelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly offersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileInput: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page, '/signup', 'Account Information page');
    const byQa = (tag: string, qa: string): Locator => page.locator(`xpath=//${tag}[@data-qa='${qa}']`);

    this.heading = page.locator(`xpath=//h2[${xpathContainsTextCI('Enter Account Information')}]`);
    this.titleMr = page.locator("xpath=//input[@type='radio' and @id='id_gender1']");
    this.titleMrs = page.locator("xpath=//input[@type='radio' and @id='id_gender2']");
    this.nameInput = byQa('input', 'name');
    this.emailInput = byQa('input', 'email');
    this.passwordInput = byQa('input', 'password');
    this.daySelect = byQa('select', 'days');
    this.monthSelect = byQa('select', 'months');
    this.yearSelect = byQa('select', 'years');
    this.newsletterCheckbox = page.locator("xpath=//input[@type='checkbox' and @id='newsletter']");
    this.offersCheckbox = page.locator("xpath=//input[@type='checkbox' and @id='optin']");
    this.firstNameInput = byQa('input', 'first_name');
    this.lastNameInput = byQa('input', 'last_name');
    this.companyInput = byQa('input', 'company');
    this.address1Input = byQa('input', 'address');
    this.address2Input = byQa('input', 'address2');
    this.countrySelect = byQa('select', 'country');
    this.stateInput = byQa('input', 'state');
    this.cityInput = byQa('input', 'city');
    this.zipcodeInput = byQa('input', 'zipcode');
    this.mobileInput = byQa('input', 'mobile_number');
    this.createAccountButton = byQa('button', 'create-account');
  }

  async fillAccountDetails(user: UserAccount): Promise<void> {
    await (user.title === 'Mr' ? this.titleMr : this.titleMrs).check();
    await fillSecret(this.passwordInput, user.password);
    await this.daySelect.selectOption(user.birthDay);
    await this.monthSelect.selectOption(user.birthMonth);
    await this.yearSelect.selectOption(user.birthYear);
    await this.newsletterCheckbox.check();
    await this.offersCheckbox.check();
  }

  async fillAddressDetails(user: UserAccount): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.companyInput.fill(user.company);
    await this.address1Input.fill(user.address1);
    await this.address2Input.fill(user.address2);
    await this.countrySelect.selectOption(user.country);
    await this.stateInput.fill(user.state);
    await this.cityInput.fill(user.city);
    await this.zipcodeInput.fill(user.zipcode);
    await this.mobileInput.fill(user.mobileNumber);
  }

  async createAccount(): Promise<void> {
    await this.createAccountButton.click();
  }
}
