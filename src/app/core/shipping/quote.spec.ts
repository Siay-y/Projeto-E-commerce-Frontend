import { Packed } from '../catalog/product';
import { Parcel, billableWeight, cubicWeight, isOversize, quoteFor } from './quote';
import { zoneOf } from './zones';

const CAMISA: Packed = { length: 30, width: 22, height: 4, weight: 0.25 };
const ESPADA: Packed = { length: 80, width: 26, height: 14, weight: 5.8 };

const parcel = (packed: Packed, quantity = 1, readyInDays = 0): Parcel => ({
  packed,
  quantity,
  readyInDays,
});

describe('faixas de CEP', () => {
  it('acerta as cinco regiões', () => {
    expect(zoneOf('01310-100')).toBe('sudeste');
    expect(zoneOf('40010-000')).toBe('nordeste');
    expect(zoneOf('69900-000')).toBe('norte');
    expect(zoneOf('74000-000')).toBe('centro-oeste');
    expect(zoneOf('90010-000')).toBe('sul');
  });

  // Rondonia e Tocantins ficam dentro da faixa do Centro-Oeste mas sao Norte.
  it('não cobra Centro-Oeste de Rondônia e Tocantins', () => {
    expect(zoneOf('76800-000')).toBe('norte');
    expect(zoneOf('77000-000')).toBe('norte');
    expect(zoneOf('76799-000')).toBe('centro-oeste');
    expect(zoneOf('78000-000')).toBe('centro-oeste');
  });

  it('recusa CEP que não tem oito dígitos', () => {
    expect(zoneOf('1234')).toBeNull();
    expect(zoneOf('')).toBeNull();
  });
});

describe('peso cubado', () => {
  // Uma camisa pesa 250g e ocupa espaco de 440g: sem cubagem o frete sairia
  // barato demais e a loja pagaria a diferenca.
  it('cobra o volume quando ele passa o peso real', () => {
    expect(cubicWeight(CAMISA)).toBeCloseTo(0.44, 2);
    expect(billableWeight([parcel(CAMISA)])).toBe(0.44);
  });

  it('cobra o peso real quando ele passa o volume', () => {
    expect(cubicWeight(ESPADA)).toBeCloseTo(4.85, 2);
    expect(billableWeight([parcel(ESPADA)])).toBe(5.8);
  });

  it('multiplica pela quantidade', () => {
    expect(billableWeight([parcel(CAMISA, 4)])).toBeCloseTo(1.76, 2);
  });

  it('acusa peça que estoura o limite de lado', () => {
    expect(isOversize(ESPADA)).toBe(false);
    expect(isOversize({ length: 145, width: 20, height: 10, weight: 6 })).toBe(true);
  });
});

describe('cotação', () => {
  it('cobra mais longe do que perto', () => {
    const perto = quoteFor('01310-100', [parcel(ESPADA)]);
    const longe = quoteFor('69900-000', [parcel(ESPADA)]);

    if ('error' in perto || 'error' in longe) throw new Error('cotação falhou');

    expect(longe.services[0].price).toBeGreaterThan(perto.services[0].price);
    expect(longe.services[0].days).toBeGreaterThan(perto.services[0].days);
  });

  it('a expressa custa mais e chega antes', () => {
    const quote = quoteFor('01310-100', [parcel(CAMISA)]);
    if ('error' in quote) throw new Error('cotação falhou');

    const [padrao, expressa] = quote.services;
    expect(expressa.price).toBeGreaterThan(padrao.price);
    expect(expressa.days).toBeLessThan(padrao.days);
  });

  it('recusa CEP inválido e carrinho vazio', () => {
    expect(quoteFor('123', [parcel(CAMISA)])).toEqual({ error: 'cep-invalido' });
    expect(quoteFor('01310-100', [])).toEqual({ error: 'sem-itens' });
  });

  it('recusa peça que precisa de transporte especial', () => {
    const grande = parcel({ length: 145, width: 20, height: 10, weight: 6 });
    expect(quoteFor('01310-100', [grande])).toEqual({ error: 'peca-grande' });
  });

  it('separa o envio quando há peça sob encomenda', () => {
    const quote = quoteFor('01310-100', [parcel(CAMISA), parcel(ESPADA, 1, 30)]);
    if ('error' in quote) throw new Error('cotação falhou');

    expect(quote.shipments).toHaveLength(2);
    expect(quote.shipments[0].readyInDays).toBe(0);
    expect(quote.shipments[1].readyInDays).toBe(30);
  });

  it('não separa quando tudo está pronto', () => {
    const quote = quoteFor('01310-100', [parcel(CAMISA), parcel(ESPADA)]);
    if ('error' in quote) throw new Error('cotação falhou');

    expect(quote.shipments).toHaveLength(1);
  });

  // O cliente paga um frete so; a loja absorve o segundo envio.
  it('cobra um frete só mesmo com dois envios', () => {
    const junto = quoteFor('01310-100', [parcel(CAMISA), parcel(ESPADA, 1, 30)]);
    if ('error' in junto) throw new Error('cotação falhou');

    expect(junto.services).toHaveLength(2);
    expect(junto.services[0].price).toBeGreaterThan(0);
  });
});
