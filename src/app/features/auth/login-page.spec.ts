import { safeDestination } from './login-page';

describe('safeDestination', () => {
  it('mantém caminho interno', () => {
    expect(safeDestination('/carrinho')).toBe('/carrinho');
    expect(safeDestination('/produto/dragon-slayer-guts')).toBe(
      '/produto/dragon-slayer-guts',
    );
  });

  it('cai para /conta quando não veio nada', () => {
    expect(safeDestination(null)).toBe('/conta');
    expect(safeDestination('')).toBe('/conta');
  });

  it('recusa outro domínio', () => {
    expect(safeDestination('https://site-falso.com')).toBe('/conta');
    expect(safeDestination('//site-falso.com')).toBe('/conta');
    expect(safeDestination('/\\site-falso.com')).toBe('/conta');
    expect(safeDestination('javascript:alert(1)')).toBe('/conta');
  });
});
