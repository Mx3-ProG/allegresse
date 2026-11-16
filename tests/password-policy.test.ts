import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { isCompromisedPassword, passwordPolicyError } from '../src/lib/password-policy';

describe('mot de passe à la création de compte', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('exige longueur, lettre, chiffre et caractère spécial', () => {
    expect(passwordPolicyError('Abc1!')).not.toBeNull();
    expect(passwordPolicyError('abcdefghijkl!')).not.toBeNull();
    expect(passwordPolicyError('123456789012!')).not.toBeNull();
    expect(passwordPolicyError('Abcdefgh1234')).not.toBeNull();
    expect(passwordPolicyError('MotDePasse12!')).toBeNull();
  });
  it('refuse un mot de passe trouvé dans la liste compromise', async () => {
    const password = 'MotDePasse12!';
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const fetchMock = vi.fn().mockResolvedValue(new Response(`${hash.slice(5)}:42\r\n`, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await isCompromisedPassword(password)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
  });
  it('refuse de valider si le contrôle externe échoue', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(isCompromisedPassword('MotDePasse12!')).rejects.toThrow();
  });
});
