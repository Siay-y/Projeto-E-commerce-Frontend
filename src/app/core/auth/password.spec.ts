import { MAX_PASSWORD, checkPassword, strengthOf } from './password';

describe('checkPassword', () => {
  it('aceita frase longa sem símbolo', () => {
    expect(checkPassword('a espada de gutts pesa').ok).toBe(true);
  });

  it('recusa menos de oito caracteres', () => {
    expect(checkPassword('curta12')).toEqual({
      ok: false,
      reason: 'Use pelo menos 8 caracteres.',
    });
  });

  it('recusa senha acima do teto', () => {
    const verdict = checkPassword('a'.repeat(MAX_PASSWORD + 1));

    expect(verdict.ok).toBe(false);
  });

  it('recusa senha de vazamento conhecido', () => {
    expect(checkPassword('senha123').ok).toBe(false);
    expect(checkPassword('SENHA123').ok).toBe(false);
  });

  it('recusa caractere repetido', () => {
    expect(checkPassword('aaaaaaaaaa').ok).toBe(false);
  });

  it('recusa senha que contém o nome ou o e-mail', () => {
    const context = { name: 'Luiz Santos', email: 'luiz.santos@exemplo.com' };

    expect(checkPassword('santos12345', context).ok).toBe(false);
    expect(checkPassword('xx-luiz.santos-xx', context).ok).toBe(false);
  });

  it('ignora pedaços curtos do nome', () => {
    expect(checkPassword('ana e a jornada', { name: 'Ana' }).ok).toBe(true);
  });
});

describe('strengthOf', () => {
  it('não pontua senha vazia', () => {
    expect(strengthOf('')).toEqual({ score: 0, label: '' });
  });

  it('zera o que não passa na checagem', () => {
    expect(strengthOf('senha123').score).toBe(0);
  });

  it('sobe com o comprimento', () => {
    const curta = strengthOf('frieren1').score;
    const media = strengthOf('frieren no fim').score;
    const longa = strengthOf('frieren e a jornada ao fim').score;

    expect(curta).toBeLessThan(media);
    expect(media).toBeLessThan(longa);
  });

  it('não passa de quatro', () => {
    expect(strengthOf('Frieren-2026-a-jornada-ao-fim!').score).toBe(4);
  });
});
