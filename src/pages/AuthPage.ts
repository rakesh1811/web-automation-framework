import type { Page } from '@playwright/test';
import { LoginFormComponent } from '../components/LoginFormComponent';
import { SignupFormComponent } from '../components/SignupFormComponent';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly loginForm: LoginFormComponent;
  readonly signupForm: SignupFormComponent;

  constructor(page: Page) {
    super(page, '/login', 'Signup / Login page');
    this.loginForm = new LoginFormComponent(page);
    this.signupForm = new SignupFormComponent(page);
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginForm.fill(email, password);
    await this.loginForm.submit();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupForm.fill(name, email);
    await this.signupForm.submit();
  }
}
