import { MAX_PER_LINE } from '../../app/core/cart/cart-store';
import { PRODUCTS } from '../../app/core/catalog/catalog-data';
import { packedOf } from '../../app/core/catalog/product';
import { MAX_ITEMS, parcelsFrom } from './parcels';

const CAMISA = PRODUCTS.find((product) => product.slug === 'camiseta-frieren-jornada')!;
const ESPADA = PRODUCTS.find((product) => product.slug === 'dragon-slayer-guts')!;

function only(result: ReturnType<typeof parcelsFrom>) {
  if (!result.ok) throw new Error(`esperava sucesso, veio ${result.error}`);

  return result.parcels;
}

describe('parcelsFrom', () => {
  it('busca peso e medida no catálogo', () => {
    const [parcel] = only(parcelsFrom([{ id: CAMISA.id, quantity: 1 }]));

    expect(parcel.packed).toEqual(packedOf(CAMISA));
    expect(parcel.quantity).toBe(1);
  });

  it('respeita a caixa da variante escolhida', () => {
    const grande = ESPADA.options!.values.find((value) => value.id === '145cm')!;

    const [padrao] = only(parcelsFrom([{ id: ESPADA.id, quantity: 1 }]));
    const [outra] = only(
      parcelsFrom([{ id: ESPADA.id, optionId: grande.id, quantity: 1 }]),
    );

    expect(outra.packed.weight).toBeGreaterThan(padrao.packed.weight);
  });

  it('ignora peso, medida e preço enviados pelo cliente', () => {
    const honesto = only(parcelsFrom([{ id: ESPADA.id, quantity: 1 }]));
    const mentiroso = only(
      parcelsFrom([
        {
          id: ESPADA.id,
          quantity: 1,
          packed: { length: 1, width: 1, height: 1, weight: 0.001 },
          price: 0,
        } as never,
      ]),
    );

    expect(mentiroso).toEqual(honesto);
  });

  it('separa o que é sob encomenda do que sai hoje', () => {
    const [pronto] = only(parcelsFrom([{ id: CAMISA.id, quantity: 1 }]));
    const [encomenda] = only(parcelsFrom([{ id: ESPADA.id, quantity: 1 }]));

    expect(pronto.readyInDays).toBe(0);
    expect(encomenda.readyInDays).toBeGreaterThan(0);
  });

  describe('quantidade', () => {
    const quantityOf = (quantity: unknown) =>
      only(parcelsFrom([{ id: CAMISA.id, quantity }]))[0].quantity;

    it('usa o mesmo teto do carrinho', () => {
      expect(quantityOf(99999)).toBe(MAX_PER_LINE);
    });

    it('nunca desce de um', () => {
      expect(quantityOf(0)).toBe(1);
      expect(quantityOf(-5)).toBe(1);
      expect(quantityOf('abacaxi')).toBe(1);
      expect(quantityOf(undefined)).toBe(1);
    });

    it('corta a fração em vez de arredondar para cima', () => {
      expect(quantityOf(2.9)).toBe(2);
    });
  });

  describe('recusas', () => {
    it('recusa carrinho vazio', () => {
      expect(parcelsFrom([])).toEqual({ ok: false, error: 'sem-itens' });
    });

    it('recusa mais itens do que o teto', () => {
      const muitos = Array.from({ length: MAX_ITEMS + 1 }, () => ({
        id: CAMISA.id,
        quantity: 1,
      }));

      expect(parcelsFrom(muitos)).toEqual({ ok: false, error: 'sem-itens' });
    });

    it('recusa produto que não existe', () => {
      expect(parcelsFrom([{ id: 'nao-existe' }])).toEqual({
        ok: false,
        error: 'item-desconhecido',
      });
    });
  });
});
