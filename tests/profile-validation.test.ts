import { describe, expect, it } from 'vitest';
import { normalizeUsername, usernameError } from '../src/modules/account/profile/validation';

describe('pseudo utilisateur', () => {
  it('normalise en minuscules', () => {
    expect(normalizeUsername('  Mon_Pseudo  ')).toBe('mon_pseudo');
  });
  it('accepte un pseudo valide', () => {
    expect(usernameError('mathieu_42')).toBeNull();
  });
  it('refuse un pseudo trop court ou invalide', () => {
    expect(usernameError('ab')).not.toBeNull();
    expect(usernameError('avec espace')).not.toBeNull();
    expect(usernameError('avec-espace')).not.toBeNull();
  });
  it('refuse un pseudo réservé', () => {
    expect(usernameError('admin')).not.toBeNull();
  });
});