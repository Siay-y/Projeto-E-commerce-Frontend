import { checkEmail, checkName, normalizeEmail, normalizeName } from './validators';

describe('checkEmail', () => {
  it('aceita endereço comum', () => {
    expect(checkEmail('luiz@exemplo.com')).toBeNull();
    expect(checkEmail('  luiz+loja@sub.exemplo.com.br  ')).toBeNull();
  });

  it('cobra o que falta', () => {
    expect(checkEmail('')).toBe('Informe seu e-mail.');
    expect(checkEmail('luiz')).not.toBeNull();
    expect(checkEmail('luiz@exemplo')).not.toBeNull();
    expect(checkEmail('luiz @exemplo.com')).not.toBeNull();
  });
});

describe('checkName', () => {
  it('aceita nome com acento e espaço', () => {
    expect(checkName('Luiz Santos')).toBeNull();
    expect(checkName('Antônio')).toBeNull();
  });

  it('recusa vazio, curto e com número', () => {
    expect(checkName('')).toBe('Informe seu nome.');
    expect(checkName('L')).not.toBeNull();
    expect(checkName('Luiz 2')).not.toBeNull();
  });
});

describe('normalização', () => {
  it('baixa a caixa do e-mail', () => {
    expect(normalizeEmail('  Luiz@Exemplo.COM ')).toBe('luiz@exemplo.com');
  });

  it('colapsa espaços do nome', () => {
    expect(normalizeName('  Luiz   Santos ')).toBe('Luiz Santos');
  });
});
