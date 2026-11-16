import { createHash } from 'node:crypto';

export const passwordRequirements = '12 caractères minimum, avec au moins une lettre, un chiffre et un caractère spécial.';

export function passwordPolicyError(password: string): string | null {
  if (password.length < 12 || password.length > 128 || !/\p{L}/u.test(password) || !/[0-9]/.test(password) || !/[^\p{L}0-9\s]/u.test(password)) return passwordRequirements;
  return null;
}

export async function isCompromisedPassword(password: string): Promise<boolean> {
  const hash = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
  const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
    headers: { 'User-Agent': 'Bibleva-Password-Check/1.0', 'Add-Padding': 'true' },
    cache: 'no-store', signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Password breach check unavailable');
  const suffix = hash.slice(5);
  return (await response.text()).split('\n').some(line => {
    const [candidate, count] = line.trim().split(':');
    return candidate === suffix && Number(count) > 0;
  });
}
