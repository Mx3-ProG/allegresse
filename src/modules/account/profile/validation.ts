export const usernameRequirements = '3 à 24 caractères : lettres minuscules, chiffres et underscore uniquement.';

const reserved = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'moderator',
  'allegresse', 'account', 'profile', 'login', 'signup', 'api',
]);

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function usernameError(username: string): string | null {
  const normalized = normalizeUsername(username);
  if (!/^[a-z0-9_]{3,24}$/.test(normalized)) return usernameRequirements;
  if (reserved.has(normalized)) return 'Ce pseudo est réservé.';
  return null;
}