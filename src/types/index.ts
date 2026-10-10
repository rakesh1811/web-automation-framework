export type Title = 'Mr' | 'Mrs';

export interface UserAccount {
  name: string;
  email: string;
  password: string;
  title: Title;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export interface TestCaseMeta {
  id: string;
  title: string;
  module: 'Login' | 'Signup';
  type: 'Positive' | 'Negative';
  objective: string;
  precondition: string;
  expected: string;
  severity: Severity;
  tags: readonly string[];
}

export interface ApiResponse {
  responseCode: number;
  message?: string;
}
