import { randomBytes } from 'crypto';
import profile from '../../test-data/account-profile.json';
import type { Title, UserAccount } from '../types';

const pad = (value: number, length = 2): string => String(value).padStart(length, '0');

function dateTimeStamp(date: Date = new Date()): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`
  );
}

let lastStamp = '';
let sequence = 0;

export function uniqueEmail(prefix = 'qa'): string {
  const stamp = dateTimeStamp();
  sequence = stamp === lastStamp ? sequence + 1 : 0;
  lastStamp = stamp;
  const suffix = sequence > 0 ? `-${sequence}` : '';
  return `${prefix}_${stamp}${suffix}_Automation@testmail.com`;
}

function generatePassword(): string {
  return `Qa@${randomBytes(6).toString('hex')}`;
}

export function buildUser(overrides: Partial<UserAccount> = {}): UserAccount {
  return {
    ...profile,
    title: profile.title as Title,
    email: uniqueEmail(),
    password: generatePassword(),
    ...overrides,
  };
}
