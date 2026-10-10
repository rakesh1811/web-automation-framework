const MASK = '********';

const SENSITIVE_KEYS: readonly string[] = ['password', 'token', 'secret', 'apikey'];

export function isSensitiveKey(key: string): boolean {
  const normalised = key.toLowerCase().replace(/[^a-z]/g, '');
  return SENSITIVE_KEYS.some((sensitive) => normalised.includes(sensitive));
}

export function maskValue(): string {
  return MASK;
}
