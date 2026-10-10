import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import type { ApiResponse, UserAccount } from '../types';

export class AccountApiService {
  constructor(private readonly request: APIRequestContext) {}

  async createAccount(user: UserAccount): Promise<void> {
    const response = await this.request.post(`${env.apiBaseUrl}/createAccount`, {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: user.title,
        birth_date: user.birthDay,
        birth_month: user.birthMonth,
        birth_year: user.birthYear,
        firstname: user.firstName,
        lastname: user.lastName,
        company: user.company,
        address1: user.address1,
        address2: user.address2,
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobileNumber,
      },
    });
    const body = await this.parse(response, 'createAccount');
    if (body.responseCode !== 201) {
      throw new Error(
        `createAccount for ${user.email} failed: responseCode ${body.responseCode}, message "${body.message ?? ''}"`,
      );
    }
  }

  async deleteAccount(email: string, password: string): Promise<boolean> {
    const response = await this.request.delete(`${env.apiBaseUrl}/deleteAccount`, { form: { email, password } });
    const body = await this.parse(response, 'deleteAccount');
    if (body.responseCode === 200) return true;
    if (body.responseCode === 404) return false;
    throw new Error(
      `deleteAccount for ${email} failed: responseCode ${body.responseCode}, message "${body.message ?? ''}"`,
    );
  }

  private async parse(response: APIResponse, operation: string): Promise<ApiResponse> {
    const text = await response.text();
    if (!response.ok()) {
      throw new Error(`${operation} returned HTTP ${response.status()}: ${text.slice(0, 200)}`);
    }
    try {
      return JSON.parse(text) as ApiResponse;
    } catch (error) {
      throw new Error(`${operation} returned a non-JSON body: ${text.slice(0, 200)}`, { cause: error });
    }
  }
}
