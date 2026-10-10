const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

export function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

export function firstLine(value: string): string {
  return (
    stripAnsi(value)
      .split('\n')
      .find((line) => line.trim().length > 0)
      ?.trim() ?? ''
  );
}

export function slugify(value: string, maxLength = 50): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

export function xpathContainsTextCI(text: string): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  return `contains(translate(normalize-space(.), '${lower}', '${upper}'), '${text.toUpperCase()}')`;
}
