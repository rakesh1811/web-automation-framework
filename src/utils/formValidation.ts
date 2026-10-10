import type { Locator } from '@playwright/test';

export interface FieldValidity {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
  message: string;
}

export async function getFieldValidity(field: Locator): Promise<FieldValidity> {
  return field.evaluate((element) => {
    const input = element as HTMLInputElement;
    return {
      valid: input.validity.valid,
      valueMissing: input.validity.valueMissing,
      typeMismatch: input.validity.typeMismatch,
      message: input.validationMessage,
    };
  });
}

export function describeValidity(fieldName: string, validity: FieldValidity): string {
  if (validity.valid) return `${fieldName} passed browser validation`;
  const reason = validity.valueMissing ? 'value missing' : validity.typeMismatch ? 'type mismatch' : 'invalid';
  return `${fieldName} blocked by browser validation (${reason}): "${validity.message}"`;
}
